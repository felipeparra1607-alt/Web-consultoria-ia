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
    const formMessage = form.querySelector("[data-form-message]");
    if (!formMessage) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // Integrar aquí el envío real cuando exista backend o proveedor de formularios.
      formMessage.hidden = false;
      formMessage.focus();
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
    const modalMessage = contactModal.querySelector("[data-form-message]");
    const sourceField = contactModal.querySelector("[data-contact-source-field]");

    const closeContactModal = () => {
      if (contactModal.open) contactModal.close();
    };

    contactModalOpeners.forEach((opener) => {
      opener.addEventListener("click", () => {
        activeOpener = opener;
        modalForm?.reset();
        if (modalMessage) modalMessage.hidden = true;
        if (modalTitle) modalTitle.textContent = `Contactar con ${opener.dataset.contactName}`;
        if (sourceField) sourceField.value = opener.dataset.contactSource || "general";
        if (modalPanel) modalPanel.scrollTop = 0;
        contactModal.showModal();
        document.body.classList.add("modal-open");
      });
    });

    closeButton?.addEventListener("click", closeContactModal);

    contactModal.addEventListener("click", (event) => {
      if (event.target === contactModal) closeContactModal();
    });

    contactModal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      activeOpener?.focus();
      activeOpener = null;
    });
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
