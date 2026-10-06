/* Disponibilidad y confirmación reales exclusivamente contra el Worker de prueba. */
(() => {
  'use strict';
  // SOLO Worker de prueba. Revisar/cambiar este endpoint antes de publicar en producción.
  const BOOKING_OPTIONS_URL = 'https://grindlane-form-test.felipe-parra1607.workers.dev/api/booking-options';
  const CONFIRM_BOOKING_URL = 'https://grindlane-form-test.felipe-parra1607.workers.dev/api/confirm-booking';
  const token = new URLSearchParams(window.location.search).get('token')?.trim();
  const elements = Object.fromEntries([
    ['loading', 'booking-loading'], ['error', 'booking-error'], ['errorTitle', 'error-title'],
    ['experience', 'booking-experience'], ['intro', 'booking-intro'], ['associated', 'booking-associated'],
    ['days', 'booking-days'], ['weekLabel', 'booking-week-label'], ['hoursSection', 'booking-hours-section'],
    ['slots', 'booking-slots'], ['dayStatus', 'booking-day-status'], ['summary', 'booking-summary'],
    ['confirm', 'booking-confirm'],
    ['status', 'booking-status'], ['successMessage', 'success-message'], ['successEndTime', 'success-end-time'],
    ['successEmailRow', 'success-email-row'], ['successEmail', 'success-email'],
    ['customerEmailStatus', 'success-customer-email-status'], ['internalEmailStatus', 'success-internal-email-status'],
    ['success', 'booking-success'], ['successTitle', 'success-title'], ['successDay', 'success-day'],
    ['successTime', 'success-time'], ['successDuration', 'success-duration'], ['successAttendant', 'success-attendant'],
  ].map(([name, id]) => [name, document.getElementById(id)]));
  const state = { days: [], timezone: '', duration: null, selectedDay: null, selectedTime: null, confirmed: false, submitting: false, blocked: false };
  const errorMessages = {
    missing_token: 'Enlace no válido', invalid_token: 'Este enlace no es válido.',
    inactive_token: 'Este enlace ya no está activo.', used_token: 'Este enlace ya se ha utilizado.',
    expired_token: 'Este enlace ha caducado.',
    invalid_date: 'La fecha seleccionada no es válida.', invalid_time: 'La hora seleccionada no es válida.',
    past_date: 'La fecha seleccionada ya ha pasado.', date_out_of_range: 'La fecha está fuera del periodo disponible.',
    weekend_unavailable: 'No hay disponibilidad en fin de semana.', past_slot: 'La hora seleccionada ya ha pasado.',
    slot_unavailable: 'Esta hora acaba de dejar de estar disponible. Elige otra.',
    booking_failed: 'No se ha podido crear la reserva. Inténtalo de nuevo.',
  };
  const AMBIGUOUS_CONFIRMATION = 'No podemos confirmar el estado de la reserva. Es posible que se haya creado. Escríbenos a contacto@grindlaneconsulting.com antes de intentarlo de nuevo.';
  const INVALID_CONFIRMATION = 'La respuesta del servidor no ha podido verificarse. Es posible que la reserva se haya creado. Escríbenos a contacto@grindlaneconsulting.com.';
  // Solo rechazos explícitos de validación/disponibilidad permiten recuperar el flujo.
  // booking_failed no garantiza que no se haya escrito la reserva y queda excluido.
  const safeConfirmationErrors = new Set([
    'missing_token', 'invalid_date', 'invalid_time', 'invalid_token', 'inactive_token',
    'used_token', 'expired_token', 'past_date', 'date_out_of_range',
    'weekend_unavailable', 'past_slot', 'slot_unavailable',
  ]);
  const longDate = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const rangeDate = new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
  const calendarDate = (key) => new Date(`${key}T00:00:00Z`);
  const timezoneLabel = () => state.timezone === 'Europe/Madrid' ? 'Hora de Madrid' : state.timezone;
  const reasonText = (reason) => typeof reason === 'string' && reason.trim() ? reason : 'No disponible';

  function showError(message) {
    elements.loading.hidden = true;
    elements.experience.hidden = true;
    elements.confirm.disabled = true;
    // Nunca insertar HTML del servidor ni renderizar lead.email o el token.
    elements.errorTitle.textContent = message;
    elements.error.hidden = false;
  }
  function backendErrorMessage(data) {
    const code = backendErrorCode(data);
    if (code === 'slot_unavailable' || code === 'used_token') return errorMessages[code];
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;
    if (typeof data?.error?.message === 'string' && data.error.message.trim()) return data.error.message;
    return errorMessages[code] || 'No se ha podido cargar la disponibilidad. Inténtalo de nuevo más tarde.';
  }
  function backendErrorCode(data) {
    return data?.error_code || data?.error?.error_code || data?.error?.code;
  }
  function ambiguousConfirmation(message = AMBIGUOUS_CONFIRMATION) {
    const error = new Error(message);
    error.ambiguous = true;
    return error;
  }
  function validateConfirmation(data) {
    const booking = data?.booking;
    const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
    const validTime = (value) => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
    const validDate = typeof booking?.booking_date === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(booking.booking_date)
      && Number.isFinite(calendarDate(booking.booking_date).getTime())
      && calendarDate(booking.booking_date).toISOString().slice(0, 10) === booking.booking_date;
    if (data?.ok !== true || !booking || !nonEmptyString(booking.id) || !validDate
      || !validTime(booking.start_time) || !validTime(booking.end_time)
      || !booking.assigned_to || !nonEmptyString(booking.assigned_to.name)) {
      throw ambiguousConfirmation(INVALID_CONFIRMATION);
    }
  }

  // GET /api/booking-options?token=... carga la disponibilidad.
  // Sin fallback mock: response.booking.days es la fuente de verdad.
  const bookingService = {
    async getOptions(bookingToken) {
      const url = new URL(BOOKING_OPTIONS_URL);
      url.searchParams.set('token', bookingToken);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, {
          method: 'GET', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
          headers: { Accept: 'application/json' }, signal: controller.signal,
        });
        let data;
        try { data = await response.json(); }
        catch { throw new Error('El servidor no ha devuelto una respuesta válida. Inténtalo de nuevo más tarde.'); }
        if (!response.ok || data?.ok !== true) {
          const error = new Error(backendErrorMessage(data));
          error.code = backendErrorCode(data);
          throw error;
        }
        return data;
      } finally { window.clearTimeout(timeout); }
    },
    // POST real al Worker de prueba. No reintentar automáticamente: puede haber creado la cita.
    async confirmBooking(selection) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(CONFIRM_BOOKING_URL, {
          method: 'POST', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, booking_date: selection.date, start_time: selection.time }),
          signal: controller.signal,
        });
        // Un 5xx puede llegar después de crear la reserva: nunca habilitar otro POST.
        if (response.status >= 500) throw ambiguousConfirmation();
        let data;
        try { data = await response.json(); }
        catch { throw ambiguousConfirmation(INVALID_CONFIRMATION); }
        if (!response.ok || data?.ok !== true) {
          const code = backendErrorCode(data);
          if (data?.ok !== false || !safeConfirmationErrors.has(code)) throw ambiguousConfirmation();
          const error = new Error(backendErrorMessage(data));
          error.code = code;
          throw error;
        }
        validateConfirmation(data);
        return data;
      } catch (error) {
        // Incluye red, timeout y excepciones no reconocidas; no se sabe si llegó el POST.
        if (!error.ambiguous && !safeConfirmationErrors.has(error.code)) throw ambiguousConfirmation();
        throw error;
      } finally { window.clearTimeout(timeout); }
    },
  };

  function applyOptions(data) {
    const booking = data.booking;
    if (!booking || !Array.isArray(booking.days) || typeof booking.timezone !== 'string'
      || !Number.isFinite(booking.duration_minutes) || booking.duration_minutes <= 0) {
      throw new Error('El servidor no ha devuelto una disponibilidad válida.');
    }
    // Validar forma y fechas sin fabricar, completar ni recalcular slots en frontend.
    new Intl.DateTimeFormat('es-ES', { timeZone: booking.timezone });
    const dates = new Set();
    for (const day of booking.days) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day?.date) || !Number.isFinite(calendarDate(day.date).getTime())
        || calendarDate(day.date).toISOString().slice(0, 10) !== day.date
        || dates.has(day.date) || typeof day.weekday !== 'string' || day.day == null || day.month == null
        || typeof day.available !== 'boolean' || !Array.isArray(day.slots)) {
        throw new Error('El servidor no ha devuelto una disponibilidad válida.');
      }
      dates.add(day.date);
      const times = new Set();
      for (const slot of day.slots) {
        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(slot?.time) || times.has(slot.time)
          || typeof slot.available !== 'boolean') {
          throw new Error('El servidor no ha devuelto una disponibilidad válida.');
        }
        times.add(slot.time);
      }
    }
    state.days = booking.days;
    state.timezone = booking.timezone;
    state.duration = booking.duration_minutes;
    elements.intro.textContent = `Elige un día y una hora para una llamada de ${state.duration} minutos con Grindlane Consulting.`;
    // Únicamente email enmascarado; el resto del lead no se copia a estado ni al DOM.
    const maskedEmail = data.lead?.email_masked;
    const safelyMasked = typeof maskedEmail === 'string' && /[*•…]/.test(maskedEmail);
    elements.associated.hidden = !safelyMasked;
    elements.associated.textContent = safelyMasked ? `Reserva asociada a: ${maskedEmail}` : '';
    const first = state.days[0];
    const last = state.days[state.days.length - 1];
    elements.weekLabel.textContent = first
      ? rangeDate.formatRange(calendarDate(first.date), calendarDate(last.date)) : 'No hay días disponibles por ahora.';
  }
  function selectedDay() { return state.days.find((day) => day.date === state.selectedDay); }
  function selectedSlot() {
    const day = selectedDay();
    return day?.available ? day.slots.find((slot) => slot.time === state.selectedTime && slot.available) : null;
  }
  function updateSummary() {
    const day = selectedDay();
    const slot = selectedSlot();
    elements.confirm.disabled = !slot || state.submitting || state.confirmed || state.blocked;
    elements.summary.hidden = !slot;
    elements.summary.textContent = slot
      ? `${longDate.format(calendarDate(day.date))} · ${slot.time} (${timezoneLabel()}) · ${state.duration} minutos` : '';
  }
  function renderDays() {
    elements.days.replaceChildren();
    for (const day of state.days) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `booking-choice booking-day${day.available ? '' : ' booking-day--unavailable'}`;
      button.dataset.day = day.date;
      button.setAttribute('aria-pressed', String(day.date === state.selectedDay));
      button.setAttribute('aria-label', `${day.weekday}, ${day.day} ${day.month}${day.available ? '' : `, ${reasonText(day.reason)}`}`);
      const labels = [['booking-day__name', day.weekday], ['booking-day__date', `${day.day} ${day.month}`]];
      if (!day.available) labels.push(['booking-day__closed', reasonText(day.reason)]);
      for (const [className, text] of labels) {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        button.append(span);
      }
      // Permite consultar días no disponibles; sus slots permanecen bloqueados.
      button.addEventListener('click', () => {
        if (state.submitting || state.confirmed || state.blocked) return;
        elements.status.textContent = '';
        state.selectedDay = day.date;
        state.selectedTime = null;
        for (const item of elements.days.children) item.setAttribute('aria-pressed', String(item.dataset.day === day.date));
        renderSlots();
        updateSummary();
      });
      elements.days.append(button);
    }
  }
  function renderSlots() {
    const day = selectedDay();
    elements.slots.replaceChildren();
    elements.hoursSection.hidden = !day;
    if (!day) return;
    elements.dayStatus.textContent = `${longDate.format(calendarDate(day.date))} · ${timezoneLabel()}${day.available ? '' : ` · ${reasonText(day.reason)}`}`;
    if (!day.slots.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No hay horarios disponibles para este día.';
      elements.slots.append(empty);
      return;
    }
    // Agrupar por period recibido, sin deducir persona por hora ni fabricar bloques.
    const groups = new Map();
    for (const slot of day.slots) {
      const period = slot.period || 'other';
      if (!groups.has(period)) groups.set(period, []);
      groups.get(period).push(slot);
    }
    for (const [period, slots] of groups) {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'booking-period';
      const legend = document.createElement('legend');
      legend.textContent = period === 'morning' ? 'Mañana' : period === 'afternoon' ? 'Tarde' : 'Horarios';
      const grid = document.createElement('div');
      grid.className = 'booking-slots';
      for (const slot of slots) {
        const available = day.available && slot.available;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'booking-choice booking-slot';
        button.dataset.time = slot.time;
        button.dataset.available = String(available);
        button.disabled = !available;
        button.setAttribute('aria-pressed', String(slot.time === state.selectedTime));
        const reason = reasonText(slot.reason || day.reason);
        button.setAttribute('aria-label', `${slot.time}, ${available ? 'disponible' : `no disponible: ${reason}`}`);
        button.textContent = slot.time;
        if (!available) {
          const label = document.createElement('small');
          label.textContent = reason;
          button.append(label);
        }
        button.addEventListener('click', () => {
          if (state.submitting || state.confirmed || state.blocked) return;
          elements.status.textContent = '';
          state.selectedTime = slot.time;
          for (const item of elements.slots.querySelectorAll('.booking-slot')) item.setAttribute('aria-pressed', String(item.dataset.time === slot.time));
          updateSummary();
        });
        grid.append(button);
      }
      fieldset.append(legend, grid);
      elements.slots.append(fieldset);
    }
  }
  function setSelectionLocked(locked) {
    for (const button of elements.days.children) button.disabled = locked;
    for (const button of elements.slots.querySelectorAll('.booking-slot')) button.disabled = locked || button.dataset.available !== 'true';
  }
  function showSuccess(data) {
    validateConfirmation(data);
    const booking = data.booking;
    state.confirmed = true;
    state.blocked = true;
    elements.confirm.disabled = true;
    const zone = booking?.timezone === 'Europe/Madrid' ? 'Hora de Madrid' : booking?.timezone || '';
    // Solo datos devueltos por el POST, nunca la selección previa como confirmación.
    elements.successDay.textContent = booking.date_label || booking.booking_date;
    elements.successTime.textContent = `${booking.start_time} (${zone})`;
    elements.successEndTime.textContent = `${booking.end_time} (${zone})`;
    elements.successDuration.textContent = Number.isFinite(booking?.duration_minutes) ? `${booking.duration_minutes} minutos` : 'No indicada';
    elements.successAttendant.textContent = booking.assigned_to.name;
    const maskedEmail = data.lead?.email_masked;
    const safelyMasked = typeof maskedEmail === 'string' && /[*•…]/.test(maskedEmail);
    elements.successEmailRow.hidden = !safelyMasked;
    elements.successEmail.textContent = safelyMasked ? maskedEmail : '';
    const customerSent = data.email_status?.customer === 'sent';
    elements.successMessage.textContent = customerSent
      ? 'Te hemos enviado un email de confirmación con los detalles de la llamada.'
      : 'La reserva se ha creado, pero no hemos podido enviar el email de confirmación. Escríbenos a contacto@grindlaneconsulting.com.';
    elements.customerEmailStatus.textContent = customerSent ? 'Enviado' : 'No enviado';
    elements.internalEmailStatus.textContent = data.email_status?.internal === 'sent' ? 'Enviado' : 'No enviado';
    elements.experience.hidden = true;
    elements.success.hidden = false;
    elements.successTitle.focus();
  }
  elements.confirm.addEventListener('click', async () => {
    const day = selectedDay();
    const slot = selectedSlot();
    if (!slot || state.submitting || state.confirmed || state.blocked) return;
    state.submitting = true;
    elements.status.textContent = '';
    elements.confirm.disabled = true;
    elements.confirm.textContent = 'Confirmando reserva…';
    elements.confirm.setAttribute('aria-busy', 'true');
    setSelectionLocked(true);
    try {
      const data = await bookingService.confirmBooking({ date: day.date, time: slot.time });
      showSuccess(data);
    } catch (error) {
      elements.status.textContent = error.message;
      if (error.ambiguous) {
        state.blocked = true;
      } else if (error.code === 'slot_unavailable') {
        state.selectedTime = null;
        await initialize(true);
        elements.status.textContent = errorMessages.slot_unavailable;
      } else if (['missing_token', 'invalid_token', 'inactive_token', 'used_token', 'expired_token'].includes(error.code)) {
        state.blocked = true;
        showError(error.message);
      }
    } finally {
      state.submitting = false;
      elements.confirm.textContent = 'Confirmar diagnóstico gratuito';
      elements.confirm.removeAttribute('aria-busy');
      setSelectionLocked(state.confirmed || state.blocked);
      updateSummary();
    }
  });
  async function initialize(preserveDay = false) {
    if (!token) { showError(errorMessages.missing_token); return; }
    elements.loading.hidden = false;
    elements.experience.setAttribute('aria-busy', 'true');
    try {
      const data = await bookingService.getOptions(token);
      applyOptions(data);
      if (!preserveDay || !selectedDay()) state.selectedDay = null;
      state.selectedTime = null;
      renderDays();
      renderSlots();
      updateSummary();
      elements.loading.hidden = true;
      elements.experience.hidden = false;
    } catch (error) {
      const networkFailure = error instanceof TypeError || error.name === 'AbortError';
      showError(networkFailure
        ? 'No se ha podido conectar con el servidor de disponibilidad. Inténtalo de nuevo más tarde.' : error.message);
    } finally { elements.experience.removeAttribute('aria-busy'); }
  }
  initialize();
})();
