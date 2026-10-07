const FORM_ENDPOINT = "https://grindlane-form.felipe-parra1607.workers.dev";

// Keep the existing Worker contract: audit context travels in the email's message.
function buildContactPayload(formData, pageUrl) {
  let message = String(formData.get("mensaje") || "").trim();
  const leadOrigin = formData.get("lead_origin");
  if (["home_auditoria", "contacto_auditoria", "perfil_auditoria"].includes(leadOrigin)) {
    const isHome = leadOrigin === "home_auditoria";
    const context = leadOrigin === "perfil_auditoria"
      ? `Contactar con ${String(formData.get("contact_person") || "").trim()}`
      : isHome ? "Home" : "Contacto";
    message = [
      `Solicitud de auditoría gratuita — ${context}`,
      `Origen: ${leadOrigin}`,
      `Teléfono: ${String(formData.get("telefono") || "").trim() || "No indicado"}`,
      `Tipo de empresa: ${formData.get("tipo_empresa") || "No indicado"}`,
      `Conoce automatización: ${formData.get("conoce_automatizacion") || "No indicado"}`,
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

  // Benefit journeys: observe the native scroller, never consume wheel/touch/key events.
  (() => {
    const root = document.querySelector("[data-time-experience], [data-cost-experience], [data-growth-experience]");
    if (!root) return;
    const journey = root.hasAttribute("data-growth-experience") ? "growth"
      : root.hasAttribute("data-cost-experience") ? "cost" : "time";
    const sceneSelector = `[data-${journey}-scene]`;
    const scenes = [...root.querySelectorAll(sceneSelector)];
    if (scenes.length !== 6) return;
    const page = document.body;
    const footer = root.querySelector(`[data-${journey}-footer]`);
    const growthMotion = journey === "growth"
      ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const sand = [
      [.96, .04, .2],
      [.77, .23, .7],
      [.5, .5, .7],
      [.23, .77, .55],
      [.04, .96, .35],
      [0, 1, 0],
    ];
    let observer = null;
    let footerObserver = null;
    let revealObserver = null;
    let frame = 0;

    const updateFooter = () => {
      if (!footer) return;
      const bounds = footer.getBoundingClientRect();
      const viewport = root.getBoundingClientRect();
      page.classList.toggle("is-footer-visible",
        bounds.top < viewport.bottom && bounds.bottom > viewport.top);
    };
    const setScene = (scene) => {
      const index = scenes.indexOf(scene);
      if (index < 0) return;
      page.dataset.scene = String(index + 1);
      if (journey === "growth") scene.classList.add("is-entered");
      if (journey !== "time") return;
      page.style.setProperty("--sand-top", String(sand[index][0]));
      page.style.setProperty("--sand-bottom", String(sand[index][1]));
      page.style.setProperty("--sand-stream", String(sand[index][2]));
    };
    const updateScene = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const centre = rect.top + root.clientHeight / 2;
      const current = scenes.find((scene) => {
        const bounds = scene.getBoundingClientRect();
        return bounds.top <= centre && bounds.bottom > centre;
      });
      if (current) setScene(current);
      updateFooter();
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateScene);
    };
    const observeScenes = () => {
      observer?.disconnect();
      footerObserver?.disconnect();
      revealObserver?.disconnect();
      if ("IntersectionObserver" in window && root.clientHeight > 0) {
        // Use pixel margins: IntersectionObserver percentages are relative to width.
        // A narrow strip at viewport centre also works for taller mobile scenes.
        const inset = Math.max(0, Math.floor(root.clientHeight / 2) - 1);
        observer = new IntersectionObserver(updateScene, {
          root, rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0,
        });
        scenes.forEach((scene) => observer.observe(scene));
        if (journey === "growth") {
          // Reveal when a scene starts entering, not only at its midpoint.
          // This keeps taller mobile scenes readable; no JS means visible text.
          revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-entered");
              revealObserver.unobserve(entry.target);
            });
          }, { root, rootMargin: "0px 0px -24px 0px", threshold: 0 });
          scenes.filter((scene) => !scene.classList.contains("is-entered"))
            .forEach((scene) => revealObserver.observe(scene));
        }
        if (footer) {
          footerObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.target === footer)
                page.classList.toggle("is-footer-visible", entry.isIntersecting);
            });
          }, { root, rootMargin: "0px 0px -1px 0px", threshold: 0 });
          footerObserver.observe(footer);
        }
      }
      requestUpdate();
    };
    if (growthMotion) {
      const updateMotion = () => page.classList.toggle("has-growth-motion",
        !growthMotion.matches && "IntersectionObserver" in window);
      updateMotion();
      growthMotion.addEventListener("change", updateMotion);
    }
    setScene(scenes[0]);
    page.classList.add(`has-${journey}-scenes`);
    observeScenes();
    root.addEventListener("scroll", () => {
      if (!observer) requestUpdate();
    }, { passive: true });
    root.addEventListener("focusin", (event) => {
      const scene = event.target.closest(sceneSelector);
      if (scene) setScene(scene);
      updateFooter();
    });
    window.addEventListener("resize", observeScenes, { passive: true });
    window.addEventListener("pagehide", () => {
      observer?.disconnect();
      footerObserver?.disconnect();
      revealObserver?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) observeScenes();
    });
  })();

  // Progressive enhancement only for the three benefit visuals. No scroll hijacking.
  (() => {
    const visuals = [...document.querySelectorAll(".benefit-page [data-benefit-motion]")];
    if (!visuals.length) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const showFinalState = () => visuals.forEach((visual) => {
      visual.classList.remove("motion-ready");
      visual.classList.add("is-active");
    });
    if (motionPreference.matches || !("IntersectionObserver" in window)) {
      showFinalState();
      return;
    }
    const visualObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-active");
        visualObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    visuals.forEach((visual) => {
      visual.classList.add("motion-ready");
      visualObserver.observe(visual);
    });
    motionPreference.addEventListener("change", (event) => {
      if (!event.matches) return;
      visualObserver.disconnect();
      showFinalState();
    });
    window.addEventListener("pagehide", () => visualObserver.disconnect(), { once: true });
    // Restore pending observations when returning through the browser back/forward cache.
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted || motionPreference.matches) return;
      visuals.filter((visual) => !visual.classList.contains("is-active"))
        .forEach((visual) => visualObserver.observe(visual));
    });
  })();

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

  // One moving track, with inert edge copies for seamless wrapping in either direction.
  document.querySelectorAll("[data-team-showcase]").forEach((showcase) => {
    const stage = showcase.querySelector(".team-showcase__stage");
    const members = [...stage.querySelectorAll("[data-team-member]")];
    const controls = showcase.querySelector("[data-team-controls]");
    const help = showcase.querySelector(".team-showcase__help");
    if (members.length < 3) return;
    const desktop = matchMedia("(min-width: 861px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const track = document.createElement("div");
    track.className = "team-showcase__track";
    const copyMember = (member) => {
      const copy = member.cloneNode(true);
      copy.dataset.teamCopy = "";
      copy.removeAttribute("id");
      copy.removeAttribute("aria-labelledby");
      copy.setAttribute("aria-label", member.querySelector("h3").textContent);
      copy.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
      return copy;
    };
    const before = members.slice(-3).map(copyMember);
    const after = members.slice(0, 3).map(copyMember);
    track.append(...before, ...members, ...after);
    stage.append(track);
    const cards = [...track.children];
    let active = 0, position = 3, pointerFrame = 0;
    let rotationFrame = 0, transitionFrame = 0, pointerInside = false, animation = null;
    let lastFrame = 0, mobileTimer = 0, mobileMoving = false, cardStep = 0;
    let pendingNavigation = null;
    let inView = !("IntersectionObserver" in window);
    const pixelsPerSecond = 28;
    const transitionDuration = 450;
    // active identifies the center on desktop and the only visible card on mobile.
    const leadingOffset = () => desktop.matches ? 2 : 3;
    const memberIndex = (index) => ((index - leadingOffset()) % members.length + members.length) % members.length;
    const stopRotation = () => {
      cancelAnimationFrame(rotationFrame);
      rotationFrame = 0;
      lastFrame = 0;
    };
    const scheduleRotation = () => {
      stopRotation();
      if (!desktop.matches || motion.matches || animation || document.hidden || !inView ||
          pointerInside || showcase.contains(document.activeElement)) return;
      rotationFrame = requestAnimationFrame(advance);
    };
    const resetPointer = () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      cards.forEach((member) => {
        member.style.removeProperty("--team-x");
        member.style.removeProperty("--team-y");
      });
    };
    const stepSize = () => {
      const card = members[0];
      return parseFloat(getComputedStyle(card).width) + parseFloat(getComputedStyle(track).columnGap);
    };
    const translate = (index) => `translate3d(${-index * cardStep}px, 0, 0)`;
    const updateCards = () => {
      cards.forEach((card, index) => {
        const isCopy = card.hasAttribute("data-team-copy");
        // Mobile also needs the edge copies to move forward from Daniel to Felipe.
        card.hidden = false;
        const visible = desktop.matches ? index + 1 > position && index < position + 3
          : !isCopy || index === Math.round(position);
        card.inert = !visible;
        if (visible) card.removeAttribute("aria-hidden");
        else card.setAttribute("aria-hidden", "true");
        const distance = Math.abs(index - position - 1);
        card.style.setProperty("--team-scale", String(0.94 + 0.06 * Math.max(0, 1 - distance)));
        card.classList.toggle("is-active", desktop.matches && distance < 0.5);
        card.classList.remove("is-left", "is-right");
      });
    };
    const normalizePosition = () => {
      // Equivalent copies are physically one full cycle apart: reset without a visible jump.
      while (position >= leadingOffset() + members.length) position -= members.length;
      while (position < leadingOffset()) position += members.length;
    };
    const paint = () => {
      track.style.transform = translate(position);
      updateCards();
    };
    const advance = (time) => {
      rotationFrame = 0;
      if (lastFrame) position += Math.min(time - lastFrame, 50) * pixelsPerSecond / (1000 * cardStep);
      lastFrame = time;
      normalizePosition();
      active = memberIndex(Math.floor(position));
      paint();
      rotationFrame = requestAnimationFrame(advance);
    };
    const settleMobile = () => {
      clearTimeout(mobileTimer);
      if (desktop.matches) return;
      position = Math.round(stage.scrollLeft / cardStep);
      active = memberIndex(position);
      normalizePosition();
      mobileMoving = false;
      stage.scrollTo({ left: position * cardStep, behavior: "instant" });
      updateCards();
      finishNavigation();
    };
    const cancelTransition = () => {
      cancelAnimationFrame(transitionFrame);
      transitionFrame = 0;
      if (animation) {
        const interrupted = animation;
        animation = null;
        interrupted.cancel();
      }
    };
    const render = () => {
      stopRotation();
      cancelTransition();
      clearTimeout(mobileTimer);
      mobileMoving = false;
      pendingNavigation = null;
      resetPointer();
      showcase.classList.toggle("is-enhanced", desktop.matches);
      controls.hidden = false;
      help.hidden = false;
      help.textContent = desktop.matches
        ? "Usa las flechas izquierda y derecha para cambiar de integrante. Inicio y Fin muestran el primero y el último."
        : "Desliza para ver el equipo o usa las flechas. Inicio y Fin muestran el primero y el último.";
      showcase.tabIndex = 0;
      showcase.setAttribute("aria-roledescription", "carrusel");
      showcase.setAttribute("aria-describedby", help.id);
      position = leadingOffset() + active;
      cardStep = stepSize();
      updateCards();
      if (desktop.matches) {
        stage.scrollLeft = 0;
        track.style.transform = translate(position);
      } else {
        track.style.removeProperty("transform");
        stage.scrollTo({ left: position * cardStep, behavior: "instant" });
      }
      scheduleRotation();
    };
    const show = (index) => {
      stopRotation();
      const next = (index + members.length) % members.length;
      if (!desktop.matches) {
        position = index === active + 1 ? Math.round(position) + 1
          : index === active - 1 ? Math.round(position) - 1 : 3 + next;
        active = next;
        mobileMoving = true;
        updateCards();
        stage.scrollTo({ left: position * cardStep, behavior: motion.matches ? "instant" : "smooth" });
        clearTimeout(mobileTimer);
        mobileTimer = setTimeout(settleMobile, 180);
        return;
      }
      if (next === active && Math.abs(position - (leadingOffset() + next)) < 0.001) { finishNavigation(); return; }
      const from = translate(position);
      // Adjacent moves cross the edge copies; Home/End go directly to the requested member.
      const start = position;
      const destination = index === active + 1 ? Math.floor(position + 0.001) + 1
        : index === active - 1 ? Math.floor(position + 0.001) - 1 : leadingOffset() + next;
      active = next;
      const to = translate(destination);
      const settle = () => {
        position = destination;
        normalizePosition();
        active = memberIndex(Math.round(position));
        paint();
        finishNavigation();
      };
      if (motion.matches) { settle(); return; }
      const running = track.animate([{ transform: from }, { transform: to }], {
        duration: transitionDuration, easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
      animation = running;
      // Manual navigation uses the same fractional position as the continuous motor.
      const followTransition = () => {
        if (animation !== running) return;
        const progress = running.effect.getComputedTiming().progress || 0;
        position = start + (destination - start) * progress;
        updateCards();
        transitionFrame = requestAnimationFrame(followTransition);
      };
      transitionFrame = requestAnimationFrame(followTransition);
      running.finished.then(() => {
        if (animation !== running) return;
        animation = null;
        cancelAnimationFrame(transitionFrame);
        transitionFrame = 0;
        settle();
      }).catch(() => {}); // Resize/reduced-motion cancellation is handled by render.
    };
    const navigate = (request) => {
      if (animation || mobileMoving) {
        // Keep the latest intent, not a stale index or an unbounded backlog.
        pendingNavigation = request;
        return;
      }
      show("step" in request ? active + request.step : request.index);
    };
    const finishNavigation = () => {
      if (pendingNavigation) {
        const request = pendingNavigation;
        pendingNavigation = null;
        navigate(request);
      } else scheduleRotation();
    };
    showcase.querySelector("[data-team-previous]").addEventListener("click", () => navigate({ step: -1 }));
    showcase.querySelector("[data-team-next]").addEventListener("click", () => navigate({ step: 1 }));
    showcase.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      pointerInside = true;
      stopRotation();
    });
    showcase.addEventListener("pointerleave", () => {
      pointerInside = false;
      resetPointer();
      scheduleRotation();
    });
    showcase.addEventListener("focusin", () => { if (!animation) stopRotation(); });
    showcase.addEventListener("focusout", () => requestAnimationFrame(scheduleRotation));
    showcase.addEventListener("pointerdown", () => { if (!animation) stopRotation(); });
    document.addEventListener("visibilitychange", scheduleRotation);
    showcase.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const destinations = { ArrowLeft: { step: -1 }, ArrowRight: { step: 1 }, Home: { index: 0 }, End: { index: members.length - 1 } };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      navigate(destinations[event.key]);
    });
    stage.addEventListener("scroll", () => {
      if (desktop.matches) return;
      position = stage.scrollLeft / cardStep;
      active = memberIndex(Math.round(position));
      updateCards();
      clearTimeout(mobileTimer);
      mobileTimer = setTimeout(settleMobile, 150);
    }, { passive: true });
    cards.forEach((member) => {
      member.addEventListener("click", (event) => {
        if (!event.target.closest("a, button") && window.getSelection().isCollapsed) member.querySelector("a").click();
      });
      member.addEventListener("pointermove", (event) => {
        if (!desktop.matches || animation || motion.matches || !finePointer.matches || event.pointerType === "touch") return;
        const rect = member.getBoundingClientRect();
        const x = Math.max(-3, Math.min(3, ((event.clientX - rect.left) / rect.width - 0.5) * 6));
        const y = Math.max(-2, Math.min(2, ((event.clientY - rect.top) / rect.height - 0.5) * 4));
        cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
          member.style.setProperty("--team-x", `${x.toFixed(2)}px`);
          member.style.setProperty("--team-y", `${y.toFixed(2)}px`);
          pointerFrame = 0;
        });
      }, { passive: true });
      member.addEventListener("pointerleave", resetPointer);
    });
    window.addEventListener("resize", render);
    desktop.addEventListener("change", render);
    motion.addEventListener("change", render);
    finePointer.addEventListener("change", resetPointer);
    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25);
        scheduleRotation();
      }, { threshold: 0.25 });
      visibilityObserver.observe(showcase);
    }
    render();
  });

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
          updateStatus("Gracias. Hemos recibido tu solicitud. Te hemos enviado un email con tu enlace personal para reservar el diagnóstico gratuito. Puede tardar unos minutos en llegar. Revisa también la carpeta de spam, correo no deseado o promociones.", "success");
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
          const contactPerson = opener.dataset.contactPerson || opener.dataset.contactName || "";
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
        <section><h3>Datos que tratamos</h3><p>Nombre, empresa, email y mensaje; persona o área de contacto, página de origen y datos técnicos estrictamente necesarios para la seguridad y el funcionamiento. No incluyas información sensible innecesaria.</p>${document.querySelector("[data-audit-form]") ? "<p>En la solicitud de auditoría también tratamos, si los facilitas, tu teléfono, tipo de empresa y familiaridad con la automatización, para preparar la revisión.</p>" : ""}</section>
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
