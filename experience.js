// This file is loaded only by Home and the automation explainer.
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".experience");
  if (!page) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealItems = [...page.querySelectorAll("[data-enter]")];
  const progressItems = [...page.querySelectorAll("[data-progress]")];
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
      return;
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
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
