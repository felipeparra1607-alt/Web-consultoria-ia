const FORM_ENDPOINT = "https://grindlane-form.felipe-parra1607.workers.dev";

// Keep the existing Worker contract: audit context travels in the email's message.
function buildContactPayload(formData, pageUrl) {
  let message = String(formData.get("mensaje") || "").trim();
  if (formData.get("lead_origin") === "home_auditoria") {
    message = [
      "Solicitud de auditoría gratuita — Home",
      "Origen: home_auditoria",
      `Teléfono: ${String(formData.get("telefono") || "").trim() || "No indicado"}`,
      `Tipo de empresa: ${formData.get("tipo_empresa") || "No indicado"}`,
      `Conoce automatización: ${formData.get("conoce_automatizacion") || "No indicado"}`,
      `Conoce GEO: ${formData.get("conoce_geo") || "No indicado"}`,
      "",
      "Mensaje:",
      message,
    ].join("\n");
  }
  return {
    name: String(formData.get("nombre") || "").trim(),
    company: String(formData.get("empresa") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    message,
    source: String(formData.get("source") || "general"),
    contact_person: String(formData.get("contact_person") || ""),
    page_url: pageUrl,
    website: String(formData.get("website") || "").trim(),
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
    navigation.classList.add("is-open");
    document.body.classList.add("menu-open");
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1120) closeMenu();
    });
  }

  const scrollToHashTarget = () => {
    if (!window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(targetId);
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  };

  scrollToHashTarget();
  window.addEventListener("hashchange", scrollToHashTarget);

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const answerId = button.getAttribute("aria-controls");
      const answer = document.getElementById(answerId);
      const isOpen = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isOpen));
      if (answer) answer.hidden = isOpen;
    });
  });

  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const formStatus = form.querySelector("[data-form-status]");
    const submitButton = form.querySelector('button[type="submit"]');
    if (!formStatus || !submitButton) return;

    const updateStatus = (message, state = "") => {
      formStatus.textContent = message;
      formStatus.classList.toggle("form-status--success", state === "success");
      formStatus.classList.toggle("form-status--error", state === "error");
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (form.dataset.submitting === "true") return;

      const formData = new FormData(form);
      const source = String(formData.get("source") || "general");
      const contactPerson = String(formData.get("contact_person") || "");
      const payload = buildContactPayload(formData, window.location.href);
      const originalButtonText = submitButton.textContent;
      const contextIsCurrent = () =>
        form.elements.source?.value === source &&
        form.elements.contact_person?.value === contactPerson;

      form.dataset.submitting = "true";
      form.setAttribute("aria-busy", "true");
      submitButton.disabled = true;
      submitButton.textContent = "Enviando…";
      updateStatus("Enviando el mensaje…");

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || result?.ok !== true) {
          throw new Error("El servicio de formularios ha rechazado el envío.");
        }

        if (contextIsCurrent()) {
          form.reset();
          form.elements.source.value = source;
          form.elements.contact_person.value = contactPerson;
          updateStatus("Mensaje enviado. Nos pondremos en contacto contigo pronto.", "success");
        }
      } catch (error) {
        if (contextIsCurrent()) {
          updateStatus(
            "No hemos podido enviar el mensaje. Inténtalo de nuevo o escríbenos a contacto@grindlaneconsulting.com.",
            "error",
          );
        }
      } finally {
        form.dataset.submitting = "false";
        form.removeAttribute("aria-busy");
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  });

  const contactModal = document.querySelector("[data-contact-modal]");
  const contactModalOpeners = document.querySelectorAll("[data-contact-modal-open]");

  if (contactModal && contactModalOpeners.length) {
    let activeOpener = null;
    const closeButton = contactModal.querySelector("[data-contact-modal-close]");
    const modalPanel = contactModal.querySelector(".contact-modal__panel");
    const modalTitle = contactModal.querySelector("[data-contact-modal-title]");
    const modalForm = contactModal.querySelector("[data-contact-form]");
    const modalStatus = contactModal.querySelector("[data-form-status]");

    const closeContactModal = () => {
      if (contactModal.open) contactModal.close();
    };

    contactModalOpeners.forEach((opener) => {
      opener.addEventListener("click", () => {
        activeOpener = opener;
        modalForm?.reset();
        if (modalStatus) {
          modalStatus.textContent = "";
          modalStatus.classList.remove("form-status--success", "form-status--error");
        }
        if (modalTitle) modalTitle.textContent = `Contactar con ${opener.dataset.contactName}`;
        if (modalPanel) modalPanel.scrollTop = 0;
        contactModal.showModal();
        const sourceField = contactModal.querySelector("[data-contact-source-field]");
        const contactPersonField = contactModal.querySelector("[data-contact-person-field]");
        if (sourceField) {
          const source = opener.dataset.contactSource || "general";
          sourceField.setAttribute("value", source);
          sourceField.value = source;
        }
        if (contactPersonField) {
          const contactPerson = opener.dataset.contactName || "";
          contactPersonField.setAttribute("value", contactPerson);
          contactPersonField.value = contactPerson;
        }
        document.body.classList.add("modal-open");
      });
    });

    closeButton?.addEventListener("click", closeContactModal);

    contactModal.addEventListener("click", (event) => {
      if (event.target === contactModal) closeContactModal();
    });

    contactModal.addEventListener("close", () => {
      document.body.classList.toggle("modal-open", !!document.querySelector("dialog[open]"));
      activeOpener?.focus();
      activeOpener = null;
    });
  }

  const privacyOpeners = document.querySelectorAll("[data-privacy-open]");
  if (privacyOpeners.length) {
    const privacyModal = document.createElement("dialog");
    privacyModal.id = "privacy-modal";
    privacyModal.className = "contact-modal privacy-modal";
    privacyModal.setAttribute("role", "dialog");
    privacyModal.setAttribute("aria-modal", "true");
    privacyModal.setAttribute("aria-labelledby", "privacy-modal-title");
    privacyModal.innerHTML = `
      <div class="privacy-modal__header"><h2 id="privacy-modal-title">Política de Privacidad</h2><button class="contact-modal__close" type="button" data-privacy-close aria-label="Cerrar política de privacidad" autofocus>×</button></div>
      <div class="privacy-modal__body" tabindex="0" role="region" aria-label="Resumen de la política de privacidad">
        <p>Esta es una consulta rápida de nuestra política, para que puedas revisarla sin salir del formulario.</p>
        <section><h3>Responsables y contacto</h3><p>Felipe Parra y Francisco Arias son corresponsables del tratamiento en Grindlane Consulting. Puedes contactar con cualquiera de ellos a través de <a href="mailto:contacto@grindlaneconsulting.com">contacto@grindlaneconsulting.com</a>.</p></section>
        <section><h3>Para qué utilizamos tus datos</h3><p>Para responder a tu consulta, analizar las necesidades que nos comunicas, valorar posibles proyectos y mantener comunicaciones relacionadas con tu solicitud o una posible relación comercial. También para garantizar la seguridad del servicio.</p></section>
        <section><h3>Datos que tratamos</h3><p>Nombre, empresa, email y mensaje; persona o área de contacto, página de origen y datos técnicos estrictamente necesarios para la seguridad y el funcionamiento. No incluyas información sensible innecesaria.</p>${document.querySelector("[data-audit-form]") ? "<p>En la solicitud de auditoría también tratamos, si los facilitas, tu teléfono, tipo de empresa y familiaridad con la automatización y GEO, para preparar la revisión.</p>" : ""}</section>
        <section><h3>Base jurídica y conservación</h3><p>Medidas precontractuales solicitadas por ti al contactar y, cuando corresponda, tu consentimiento o el cumplimiento de obligaciones legales. Conservamos los datos durante el tiempo necesario para atender la solicitud y gestionar la relación, sin perjuicio de los plazos necesarios para posibles responsabilidades legales.</p></section>
        <section><h3>Proveedores tecnológicos</h3><p>GitHub Pages aloja la web; Cloudflare presta servicios de infraestructura, seguridad y procesamiento del formulario; Resend transmite los mensajes y Zoho gestiona el correo corporativo. Solo intervienen en la medida necesaria para prestar sus servicios. No vendemos datos personales. Las transferencias internacionales, cuando existan, estarán sujetas a las garantías exigibles.</p></section>
        <section><h3>Tus derechos</h3><p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar tu consentimiento cuando el tratamiento se base en él. Escribe a <a href="mailto:contacto@grindlaneconsulting.com">contacto@grindlaneconsulting.com</a> indicando el derecho que deseas ejercer. También puedes reclamar ante la Agencia Española de Protección de Datos.</p></section>
        <section><h3>Seguridad</h3><p>Aplicamos medidas técnicas y organizativas razonables, HTTPS, validación de formularios y protección frente a envíos automatizados. Los formularios no toman decisiones automatizadas con efectos jurídicos o significativamente similares.</p></section>
        <p>Puedes consultar la versión completa en la <a href="/privacidad/">Política de Privacidad</a>.</p>
      </div>`;
    document.body.append(privacyModal);
    let privacyOpener = null;
    privacyOpeners.forEach((opener) => opener.addEventListener("click", (event) => {
      // Prevent the surrounding consent label from checking the checkbox.
      event.preventDefault();
      event.stopPropagation();
      privacyOpener = opener;
      privacyModal.showModal();
      privacyModal.querySelector(".privacy-modal__body").scrollTop = 0;
      privacyModal.querySelector("[data-privacy-close]").focus();
      document.body.classList.add("modal-open");
    }));
    privacyModal.querySelector("[data-privacy-close]").addEventListener("click", () => privacyModal.close());
    privacyModal.addEventListener("click", (event) => {
      if (event.target === privacyModal) privacyModal.close();
    });
    // Keep Tab inside the panel (including at browser chrome boundaries).
    privacyModal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const stops = [...privacyModal.querySelectorAll('button, a[href], [tabindex="0"]')];
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    // Native Escape closes only the top dialog, preserving the underlying form.
    privacyModal.addEventListener("close", () => {
      document.body.classList.toggle("modal-open", !!document.querySelector("dialog[open]"));
      privacyOpener?.focus();
      privacyOpener = null;
    });
  }

  const countupItems = document.querySelectorAll("[data-countup], [data-countup-start]");

  if (countupItems.length && !reduceMotion && "IntersectionObserver" in window) {
    const formatNumber = (value, decimals = 0) =>
      new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);

    const renderCount = (item, progress) => {
      const suffix = item.dataset.suffix || "";
      const decimals = Number(item.dataset.decimals || 0);

      if (item.dataset.countupStart !== undefined) {
        const lower = Number(item.dataset.countupStart);
        const upper = Number(item.dataset.countupEnd);
        item.textContent = `${formatNumber(lower * progress, decimals)}–${formatNumber(upper * progress, decimals)}${suffix}`;
        return;
      }

      const target = Number(item.dataset.countup);
      item.textContent = `${formatNumber(target * progress, decimals)}${suffix}`;
    };

    const animateCount = (item) => {
      if (item.dataset.counted === "true") return;
      item.dataset.counted = "true";
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        renderCount(item, eased);
        if (elapsed < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
    };

    countupItems.forEach((item) => {
      item.setAttribute("aria-label", item.textContent.trim());
      renderCount(item, 0);
    });

    const countupObserver = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    countupItems.forEach((item) => countupObserver.observe(item));
  }

  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
});
