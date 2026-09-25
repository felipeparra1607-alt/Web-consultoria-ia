document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
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

  const solutionToggles = [...document.querySelectorAll(".solution-toggle")];

  const closeSolution = (button, immediate = false) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const solution = button.closest(".solution-detail");
    if (!panel || button.getAttribute("aria-expanded") !== "true") return;

    window.clearTimeout(panel.closeTimer);
    window.clearTimeout(panel.openTimer);
    button.setAttribute("aria-expanded", "false");
    solution?.classList.remove("is-open");

    if (immediate || reduceMotion) {
      panel.classList.remove("is-open");
      panel.style.maxHeight = "0px";
      panel.hidden = true;
      return;
    }

    panel.style.maxHeight = `${panel.scrollHeight}px`;
    panel.offsetHeight;
    panel.classList.remove("is-open");
    panel.style.maxHeight = "0px";
    panel.closeTimer = window.setTimeout(() => {
      if (button.getAttribute("aria-expanded") === "false") panel.hidden = true;
    }, 430);
  };

  const openSolution = (button, shouldScroll = false) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const solution = button.closest(".solution-detail");
    if (!panel || !solution) return;

    solutionToggles.forEach((otherButton) => {
      if (otherButton !== button) closeSolution(otherButton, true);
    });

    window.clearTimeout(panel.closeTimer);
    window.clearTimeout(panel.openTimer);
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    solution.classList.add("is-open");

    if (reduceMotion) {
      panel.classList.add("is-open");
      panel.style.maxHeight = "none";
    } else {
      panel.style.maxHeight = "0px";
      window.requestAnimationFrame(() => {
        panel.classList.add("is-open");
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      });
      panel.openTimer = window.setTimeout(() => {
        if (button.getAttribute("aria-expanded") === "true") panel.style.maxHeight = "none";
      }, 430);
    }

    if (shouldScroll) {
      window.setTimeout(() => {
        solution.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }, reduceMotion ? 0 : 80);
    }
  };

  solutionToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const solution = button.closest(".solution-detail");
      const isOpen = button.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeSolution(button);
        if (solution && window.location.hash === `#${solution.id}`) {
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }
      } else {
        openSolution(button);
        if (solution) window.history.replaceState(null, "", `#${solution.id}`);
      }
    });
  });

  const openSolutionFromHash = () => {
    const solutionId = decodeURIComponent(window.location.hash.slice(1));
    const solution = solutionId ? document.getElementById(solutionId) : null;
    const button = solution?.querySelector(".solution-toggle");
    if (button) openSolution(button, true);
  };

  if (solutionToggles.length) {
    openSolutionFromHash();
    window.addEventListener("hashchange", openSolutionFromHash);
  }

  const form = document.querySelector("[data-contact-form]");
  const formMessage = document.querySelector("[data-form-message]");

  if (form && formMessage) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // Integrar aquí el envío real cuando exista backend o proveedor de formularios.
      formMessage.hidden = false;
      formMessage.focus();
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
