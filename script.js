(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const heroShell = document.querySelector('.hero-shell');
  const timeline = document.querySelector('.build-timeline');
  const timelineViewport = timeline.querySelector('.timeline-sticky');
  const timelineStates = [...document.querySelectorAll('.timeline-state')];
  const timelineCounters = [...document.querySelectorAll('.timeline-counter span')];
  const timelineRailSteps = [...document.querySelectorAll('.timeline-rail__labels span')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const phase = (progress, start, end) => clamp((progress - start) / (end - start), 0, 1);

  window.addEventListener('load', () => {
    window.setTimeout(() => body.classList.add('is-loaded'), 120);
    window.setTimeout(() => body.classList.add('intro-complete'), 2350);
  });

  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));
  menuToggle?.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let scrollY = window.scrollY;
  let ticking = false;
  let activeStage = -1;
  let useNativeTimeline = true;

  function setTimelineStage(nextStage) {
    if (nextStage === activeStage) return;
    activeStage = nextStage;
    timelineStates.forEach((state, index) => {
      state.classList.toggle('is-active', index === activeStage);
      state.classList.toggle('is-before', index < activeStage);
      state.setAttribute('aria-hidden', String(index !== activeStage));
    });
    timelineCounters.forEach((counter, index) => counter.classList.toggle('is-active', index === activeStage));
    timelineRailSteps.forEach((step, index) => {
      step.classList.toggle('is-active', index === activeStage);
      step.classList.toggle('is-past', index < activeStage);
    });
  }

  function renderTimeline(progress) {
    const bounded = clamp(progress, 0, 1);
    root.style.setProperty('--timeline-progress', Math.max(.012, bounded).toFixed(4));
    root.style.setProperty('--timeline-exit', phase(bounded, .88, 1).toFixed(4));
    setTimelineStage(bounded < .2 ? 0 : bounded < .5 ? 1 : bounded < .8 ? 2 : 3);
    window.constructionProgress = bounded;
    window.arkenConstructionScene?.setConstructionProgress(bounded);
  }

  function updateScene() {
    const viewport = window.innerHeight;
    const heroRect = heroShell.getBoundingClientRect();
    const heroDistance = Math.max(1, heroRect.height - viewport);
    const heroProgress = clamp(-heroRect.top / heroDistance, 0, 1);
    const buildProgress = phase(heroProgress, .2, .86);
    const backgroundProgress = phase(heroProgress, .35, .88);
    const machineProgress = phase(heroProgress, .45, .9);
    const uiProgress = phase(heroProgress, .55, .74);
    const darkProgress = phase(heroProgress, .62, .94);
    const teaseProgress = phase(heroProgress, .7, .96);

    const timelineRect = timeline.getBoundingClientRect();
    const timelineDistance = Math.max(1, timelineRect.height - viewport);
    const timelineProgress = clamp(-timelineRect.top / timelineDistance, 0, 1);
    const timelineEnter = clamp((viewport * .92 - timelineRect.top) / (viewport * .92), 0, 1);

    currentX = lerp(currentX, targetX, .07);
    currentY = lerp(currentY, targetY, .07);

    root.style.setProperty('--bg-scale', (1.06 + backgroundProgress * .05).toFixed(4));
    root.style.setProperty('--hero-ui-opacity', (1 - uiProgress).toFixed(4));
    root.style.setProperty('--hero-darkness', (.68 + darkProgress * .32).toFixed(4));
    root.style.setProperty('--tease-opacity', teaseProgress.toFixed(4));
    root.style.setProperty('--tease-y', `${((1 - teaseProgress) * 80 - teaseProgress * 12).toFixed(2)}px`);
    root.style.setProperty('--nav-opacity', Math.max(1 - uiProgress, timelineEnter).toFixed(4));
    root.style.setProperty('--bg-x', `${(currentX * 3).toFixed(2)}px`);
    root.style.setProperty('--bg-y', `${(currentY * 2 - backgroundProgress * 5).toFixed(2)}px`);
    root.style.setProperty('--type-x', `${(currentX * 6).toFixed(2)}px`);
    root.style.setProperty('--type-y', `${(currentY * 4 - buildProgress * 96).toFixed(2)}px`);
    root.style.setProperty('--machine-x', `${(currentX * 9).toFixed(2)}px`);
    root.style.setProperty('--machine-y', `${(currentY * 6 - machineProgress * 38).toFixed(2)}px`);
    root.style.setProperty('--mist-x', `${(currentX * 13).toFixed(2)}px`);
    root.style.setProperty('--mist-y', `${(currentY * 8).toFixed(2)}px`);
    root.style.setProperty('--timeline-enter', timelineEnter.toFixed(4));
    if (useNativeTimeline) renderTimeline(timelineProgress);
    header?.classList.toggle('is-compact', scrollY > 80);

    const moving = Math.abs(currentX - targetX) > .002 || Math.abs(currentY - targetY) > .002;
    if (moving) requestAnimationFrame(updateScene);
    else ticking = false;
  }

  function requestSceneUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScene);
  }

  if (!reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      targetX = (event.clientX / window.innerWidth - .5) * 2;
      targetY = (event.clientY / window.innerHeight - .5) * 2;
      requestSceneUpdate();
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    requestSceneUpdate();
  }, { passive: true });
  window.addEventListener('resize', requestSceneUpdate, { passive: true });
  // URL parameters must never override the live construction progress.
  renderTimeline(0);
  if (window.gsap && window.ScrollTrigger) {
    useNativeTimeline = false;
    root.classList.add('has-pinned-timeline');
    let refreshFrame = 0;
    let scrollRestoreFrame = 0;
    let savedScrollStyles = null;

    function prepareTimelineMeasurement() {
      cancelAnimationFrame(scrollRestoreFrame);
      savedScrollStyles ??= ['scroll-behavior'].map((property) => ({
        property,
        value: root.style.getPropertyValue(property),
        priority: root.style.getPropertyPriority(property)
      }));
      // GSAP temporarily resets scroll during measurement. CSS smooth scrolling
      // makes that reset asynchronous, corrupting starts on hash entry/refresh.
      root.style.setProperty('scroll-behavior', 'auto', 'important');
      // Flush the style before GSAP calls scrollTo(0), including in Chromium.
      void root.offsetHeight;
    }
    function restoreScrollStyles() {
      cancelAnimationFrame(scrollRestoreFrame);
      scrollRestoreFrame = requestAnimationFrame(() => {
        scrollRestoreFrame = 0;
        if (!savedScrollStyles) return;
        void root.offsetHeight;
        savedScrollStyles.forEach(({ property, value, priority }) => {
          if (value) root.style.setProperty(property, value, priority);
          else root.style.removeProperty(property);
        });
        savedScrollStyles = null;
      });
    }

    prepareTimelineMeasurement();
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.addEventListener('refreshInit', prepareTimelineMeasurement);
    window.ScrollTrigger.addEventListener('refresh', restoreScrollStyles);
    window.ScrollTrigger.getById('construction-timeline')?.kill(true);
    const timelineContext = window.gsap.context(() => {
      window.ScrollTrigger.create({
        id: 'construction-timeline',
        trigger: timeline,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (window.innerWidth <= 680 ? 3.4 : 3.2))}`,
        pin: timelineViewport,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: prepareTimelineMeasurement,
        // One normalized value drives the UI, model, camera and environment.
        onUpdate: (self) => renderTimeline(self.progress),
        onRefresh: (self) => {
          renderTimeline(self.progress);
          restoreScrollStyles();
        },
        onLeave: () => renderTimeline(1),
        onLeaveBack: () => renderTimeline(0)
      });
    }, timeline);

    function refreshTimeline() {
      if (refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        window.ScrollTrigger.refresh();
        requestSceneUpdate();
      });
    }
    // Refresh on layout readiness, never from the scroll/render loop.
    window.addEventListener('load', refreshTimeline, { once: true });
    window.addEventListener('arken:scene-ready', refreshTimeline, { once: true });
    window.addEventListener('pageshow', refreshTimeline);
    document.fonts?.ready.then(refreshTimeline);
    if (document.readyState === 'complete' || window.arkenConstructionScene) refreshTimeline();
    window.addEventListener('pagehide', (event) => {
      if (event.persisted) return;
      cancelAnimationFrame(refreshFrame);
      timelineContext.revert();
      root.classList.remove('has-pinned-timeline');
      window.ScrollTrigger.removeEventListener('refreshInit', prepareTimelineMeasurement);
      window.ScrollTrigger.removeEventListener('refresh', restoreScrollStyles);
      restoreScrollStyles();
      window.removeEventListener('pageshow', refreshTimeline);
      window.removeEventListener('arken:scene-ready', refreshTimeline);
    });
  } else {
    // Only the no-GSAP fallback uses sticky positioning; never combine it with pin.
    timeline.classList.add('is-native-timeline');
  }
  requestSceneUpdate();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .13, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  if (finePointer) {
    const cursor = document.querySelector('.cursor');
    let cursorX = -100;
    let cursorY = -100;
    let cursorTX = -100;
    let cursorTY = -100;
    let cursorFrame = 0;

    window.addEventListener('pointermove', (event) => {
      cursorTX = event.clientX;
      cursorTY = event.clientY;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    }, { passive: true });

    function renderCursor() {
      cursorFrame = 0;
      cursorX = lerp(cursorX, cursorTX, .2);
      cursorY = lerp(cursorY, cursorTY, .2);
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      if (Math.abs(cursorX-cursorTX)>.08 || Math.abs(cursorY-cursorTY)>.08) cursorFrame=requestAnimationFrame(renderCursor);
    }

    document.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('pointerenter', () => cursor.classList.add('is-link'));
      item.addEventListener('pointerleave', () => cursor.classList.remove('is-link'));
    });
    document.querySelectorAll('[data-cursor="view"]').forEach((item) => {
      item.addEventListener('pointerenter', () => cursor.classList.add('is-view'));
      item.addEventListener('pointerleave', () => cursor.classList.remove('is-view'));
    });
  }

  const video = document.querySelector('.hero__video');
  if (video?.dataset.enabled === 'true' && !reduceMotion && window.innerWidth > 720) {
    video.src = video.dataset.src;
    video.addEventListener('canplay', () => video.classList.add('is-playing'), { once: true });
    video.play().catch(() => {});
  }
})();
