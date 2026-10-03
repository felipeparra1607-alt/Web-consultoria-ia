// This file is loaded only by Home and the automation explainer.
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".experience");
  if (!page) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealItems = [...page.querySelectorAll("[data-enter]")];
  const progressItems = [...page.querySelectorAll("[data-progress]")];
  // Home only: keep the explainer's existing scroll behaviour unchanged.
  const journey = page.matches(".home-page") ? page.querySelector(".grindlane-journey") : null;
  const journeySteps = journey ? [...journey.querySelectorAll("article")] : [];
  let observer;
  let frame = 0;
  const visibleProgress = new Set();
  let progressObserver;

  const updateProgress = () => {
    frame = 0;
    for (const item of visibleProgress) {
      const rect = item.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight * .9 - rect.top) / Math.max(1, rect.height * .85)));
      item.style.setProperty("--progress", progress.toFixed(3));
      if (journey && item.contains(journey)) {
        const journeyTop = journey.getBoundingClientRect().top;
        const nodePositions = journeySteps.map(step => journeyTop + step.offsetTop + 36);
        const firstNode = nodePositions[0];
        const lastNode = nodePositions[nodePositions.length - 1];
        const readingLine = innerHeight * .62;
        const lineProgress = Math.min(1, Math.max(0, (readingLine - firstNode) / Math.max(1, lastNode - firstNode)));
        const activeStep = nodePositions.reduce((active, position, index) => position <= readingLine ? index : active, -1);
        journey.style.setProperty("--journey-height", `${lastNode - firstNode}px`);
        journey.style.setProperty("--progress", lineProgress.toFixed(3));
        journeySteps.forEach((step, index) => {
          step.classList.toggle("is-active", index === activeStep);
          step.classList.toggle("is-complete", index < activeStep);
        });
      }
    }
  };
  const scheduleProgress = () => {
    if (!frame && visibleProgress.size) frame = requestAnimationFrame(updateProgress);
  };
  const configureMotion = () => {
    observer?.disconnect();
    progressObserver?.disconnect();
    window.removeEventListener("scroll", scheduleProgress);
    window.removeEventListener("resize", scheduleProgress);
    cancelAnimationFrame(frame);
    frame = 0;
    visibleProgress.clear();
    if (motion.matches || !("IntersectionObserver" in window)) {
      page.classList.remove("motion-ready");
      revealItems.forEach(item => item.classList.add("is-in"));
      progressItems.forEach(item => item.style.setProperty("--progress", "1"));
      if (journey) {
        journey.style.setProperty("--journey-height", `${journeySteps[journeySteps.length - 1].offsetTop - journeySteps[0].offsetTop}px`);
        journey.style.setProperty("--progress", "1");
        journeySteps.forEach(step => {
          step.classList.remove("is-active");
          step.classList.add("is-complete");
        });
      }
      return;
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = page.matches(".home-page") && entry.target.matches(".solution-tile") ? entry.target.querySelector("img") : null;
          // On slower connections, reveal the scene once its photograph is ready.
          if (image && !image.complete) image.decode().catch(() => {}).then(() => entry.target.classList.add("is-in"));
          else entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .12, rootMargin: "0px 0px -20px 0px"});
    revealItems.forEach(item => observer.observe(item));
    progressObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleProgress.add(entry.target);
        else visibleProgress.delete(entry.target);
      });
      scheduleProgress();
    }, {rootMargin: "100px"});
    progressItems.forEach(item => progressObserver.observe(item));
    page.classList.add("motion-ready");
    window.addEventListener("scroll", scheduleProgress, {passive: true});
    window.addEventListener("resize", scheduleProgress);
  };
  configureMotion();
  motion.addEventListener("change", configureMotion);
});
