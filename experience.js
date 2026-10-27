// Shared photographic header; other motion runs only on .experience pages.
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".experience, .about-hero-page");
  if (!page) return;
  if (page.matches('.home-page, .about-hero-page, .automation-hero-page')) {
    const updateHeroHeader = () => page.classList.toggle('hero-at-top', window.scrollY <= 24);
    updateHeroHeader();
    window.addEventListener('scroll', updateHeroHeader, { passive: true });
    window.addEventListener('pageshow', updateHeroHeader);
  }
  // Only the two requested heroes opt in. Default markup stays visible without JS.
  if (page.matches('.about-hero-page, .automation-hero-page')) {
    const hero = page.querySelector('.about-hero, .insight-hero');
    const image = hero.querySelector('img');
    const title = hero.querySelector('h1');
    const originalTitle = title.textContent;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const splitAboutTitle = () => {
      if (!page.matches('.about-hero-page')) return;
      title.textContent = originalTitle;
      const node = title.firstChild;
      const range = document.createRange();
      const lines = [];
      for (const word of originalTitle.matchAll(/\S+/g)) {
        range.setStart(node, word.index);
        range.setEnd(node, word.index + word[0].length);
        const top = range.getBoundingClientRect().top;
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.top - top) < 2) last.end = word.index + word[0].length;
        else lines.push({ top, start: word.index, end: word.index + word[0].length });
      }
      const fragment = document.createDocumentFragment();
      lines.forEach((line, index) => {
        const mask = document.createElement('span');
        const content = document.createElement('span');
        mask.className = 'hero-line';
        content.className = 'hero-line__text';
        content.style.setProperty('--hero-line-index', index);
        content.textContent = originalTitle.slice(line.start, lines[index + 1]?.start ?? originalTitle.length);
        mask.append(content);
        fragment.append(mask);
      });
      if (lines.length) title.replaceChildren(fragment);
      hero.style.setProperty('--hero-copy-delay', `${(0.88 + lines.length * 0.15).toFixed(2)}s`);
    };
    const startHeroMotion = () => {
      if (preference.matches) return;
      try { splitAboutTitle(); }
      catch { title.textContent = originalTitle; }
      hero.classList.add('cinematic-ready');
    };
    // Wait for the actual photograph and fonts, rather than animate an unloaded asset.
    Promise.all([
      document.fonts?.ready || Promise.resolve(),
      image.decode ? image.decode().catch(() => {}) : Promise.resolve(),
    ]).then(startHeroMotion);
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      if (!hero.classList.contains('cinematic-ready') || preference.matches) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        // Reflow natural title lines without replaying the entrance on resize.
        hero.classList.add('cinematic-settled');
        try { splitAboutTitle(); } catch { title.textContent = originalTitle; }
      });
    }, { passive: true });
    preference.addEventListener('change', () => {
      if (!preference.matches) return;
      cancelAnimationFrame(resizeFrame);
      hero.classList.remove('cinematic-ready', 'cinematic-settled');
      if (page.matches('.about-hero-page')) title.textContent = originalTitle;
    });
  }
  if (!page.matches('.experience')) return;
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
