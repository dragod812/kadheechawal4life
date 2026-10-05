(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData === true;
  const toggle = document.querySelector('.motion-toggle');
  const videos = [...document.querySelectorAll('.memory-video video')];
  let paused = reducedMotion.matches || saveData;
  let framePending = false;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let smoothScroll = scrollY;
  let lastFrame = 0;
  const completed = new WeakSet();
  const visibleVideos = new Set();
  const hero = document.querySelector('.hero');
  const join = document.querySelector('.joining-photos');
  // Text follows the scenery by just a pixel or two; controls stay easy to use.
  document.querySelectorAll('.chapter-copy, .centred-copy, .forever-copy, .closing-inner, .opening-line, .image-note, .mumbai-postscript, .city-labels, .programme, .travel-section .reveal, .hero-footnote').forEach(element => {
    element.dataset.parallax = '';
    element.dataset.depth = '.008';
    element.dataset.pointer = '1.5';
  });
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const parallaxLayers = [...document.querySelectorAll('[data-parallax]')].map(element => ({
    element,
    scene: element.closest('[data-scene]'),
    depth: Number(element.dataset.depth) || 0,
    pointer: Number(element.dataset.pointer) || 0,
    turn: Number(element.dataset.turn) || 0,
    zoom: Number(element.dataset.zoom) || 1,
    mobileZoom: Number(element.dataset.mobileZoom) || 1
  }));
  document.querySelectorAll('.memory-grid .memory, .playful-pair > figure').forEach((element, index) => {
    element.dataset.drift = String((index % 2 ? 1 : -1) * (0.7 + index % 3 * 0.2));
  });
  const actors = [...document.querySelectorAll('[data-drift]')];
  const activeActors = new Set();
  const activeScenes = new Set();
  const metrics = new Map();

  function layoutTop(element) {
    let top = 0;
    for (let current = element; current; current = current.offsetParent) top += current.offsetTop;
    return top;
  }

  function measureScenes() {
    [...scenes, ...actors, join].forEach(element => {
      metrics.set(element, {top: layoutTop(element), height: element.offsetHeight});
    });
    scheduleDepth();
  }

  function setMotionState() {
    document.documentElement.classList.toggle('js-motion', !paused);
    document.documentElement.classList.toggle('motion-paused', paused);
    document.body.classList.toggle('js-motion', !paused);
    document.body.classList.toggle('motion-paused', paused);
    toggle.textContent = paused ? 'Enable motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
    videos.forEach(video => {
      if (paused) {
        video.pause();
        video.parentElement.classList.remove('is-playing');
      } else if (visibleVideos.has(video)) playMoment(video);
    });
    smoothScroll = scrollY;
    lastFrame = 0;
    if (paused) {
      join.style.setProperty('--join-gap', '0px');
    } else scheduleDepth();
  }

  function playMoment(video) {
    if (paused || completed.has(video)) return;
    if (!video.src) {
      video.src = video.dataset.src;
      video.load();
    }
    video.muted = true;
    video.play().then(() => {
      if (!paused && visibleVideos.has(video)) video.parentElement.classList.add('is-playing');
      else video.pause();
    }).catch(() => video.parentElement.classList.remove('is-playing'));
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold: 0.1, rootMargin: '0px 0px -25px 0px'});
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    const sceneryObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const set = entry.target.hasAttribute('data-scene') ? activeScenes : activeActors;
        if (entry.isIntersecting) set.add(entry.target);
        else set.delete(entry.target);
        parallaxLayers.forEach(layer => {
          if (layer.scene === entry.target) layer.element.classList.toggle('is-near', entry.isIntersecting);
        });
      });
      scheduleDepth();
    }, {rootMargin: '200px 0px'});
    [...scenes, ...actors].forEach(element => sceneryObserver.observe(element));
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (entry.isIntersecting && !document.hidden) {
          visibleVideos.add(video);
          playMoment(video);
        } else {
          visibleVideos.delete(video);
          video.pause();
          entry.target.classList.remove('is-playing');
        }
      });
    }, {threshold: 0.45});
    videos.forEach(video => {
      videoObserver.observe(video.parentElement);
      video.addEventListener('ended', () => {
        completed.add(video);
        video.parentElement.classList.remove('is-playing');
      });
      video.addEventListener('error', () => video.parentElement.classList.remove('is-playing'));
    });
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
    scenes.forEach(element => activeScenes.add(element));
    actors.forEach(element => activeActors.add(element));
    parallaxLayers.forEach(layer => layer.element.classList.add('is-near'));
  }

  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);

  function renderDepth(time = performance.now()) {
    framePending = false;
    if (paused || document.hidden) return;
    // Settle between native scroll frames, then stop RAF completely when idle.
    const delta = lastFrame ? Math.min(64, time - lastFrame) : 16;
    const damping = 1 - Math.exp(-delta / 85);
    lastFrame = time;
    smoothScroll += (scrollY - smoothScroll) * damping;
    smoothPointerX += (pointerX - smoothPointerX) * damping;
    smoothPointerY += (pointerY - smoothPointerY) * damping;
    const mobile = innerWidth <= 700;
    const amplitude = mobile ? 0.55 : 1;
    const lateralAmplitude = innerWidth <= 1000 ? 0.35 : 1;
    const heroHeight = metrics.get(hero)?.height || innerHeight;
    const retreat = Math.min(Math.max(smoothScroll, 0), heroHeight);

    if (activeScenes.has(hero)) {
      hero.style.setProperty('--hero-copy-opacity', String(1 - clamp(retreat / heroHeight) * 0.18));
      hero.style.setProperty('--portrait-x', `${(retreat * 0.032 + smoothPointerX * 6) * amplitude}px`);
      hero.style.setProperty('--portrait-y', `${(-retreat * 0.10 + smoothPointerY * 4) * amplitude}px`);
      hero.style.setProperty('--portrait-turn', `${(retreat * 0.004 + smoothPointerX * .15) * amplitude}deg`);
    }

    // Botanical cutouts travel faster than the garden behind them. Each section
    // owns its depth, so the closing and celebration don't inherit hero offsets.
    parallaxLayers.forEach(layer => {
      if (!activeScenes.has(layer.scene)) return;
      const metric = metrics.get(layer.scene);
      if (!metric) return;
      const distance = Math.max(-innerHeight, Math.min(smoothScroll - metric.top, metric.height));
      layer.element.style.setProperty('--parallax-x', `${smoothPointerX * layer.pointer * amplitude}px`);
      layer.element.style.setProperty('--parallax-y', `${(distance * layer.depth + smoothPointerY * layer.pointer * .65) * amplitude}px`);
      layer.element.style.setProperty('--parallax-turn', `${smoothPointerX * layer.turn * amplitude}deg`);
      layer.element.style.setProperty('--parallax-scale', String(mobile ? layer.mobileZoom : layer.zoom));
    });

    activeScenes.forEach(scene => {
      if (!scene.classList.contains('scene-surface')) return;
      const top = metrics.get(scene)?.top ?? 0;
      const entry = ease(clamp((innerHeight * 0.92 - (top - smoothScroll)) / (innerHeight * 0.75)));
      scene.style.setProperty('--scene-inset', `${(1 - entry) * (mobile ? 4 : 5)}%`);
      scene.style.setProperty('--scene-round', `${(1 - entry) * (mobile ? 30 : 80)}px`);
    });

    activeActors.forEach(actor => {
      const metric = metrics.get(actor);
      if (!metric) return;
      const top = metric.top - smoothScroll;
      const entry = ease(clamp((innerHeight * 0.92 - top) / (innerHeight * 0.72)));
      const exit = ease(clamp(-(top + metric.height * 0.5) / (innerHeight * 0.65)));
      const direction = Number(actor.dataset.drift) || 1;
      actor.style.setProperty('--drift-x', `${((1 - entry) * direction * 27 - exit * direction * 10 + smoothPointerX * 6) * lateralAmplitude}px`);
      actor.style.setProperty('--drift-y', `${((1 - entry) * 52 - exit * 22 + smoothPointerY * 4) * amplitude}px`);
      actor.style.setProperty('--drift-turn', `${((1 - entry) * direction * 4.5 - exit * direction * 1.5) * lateralAmplitude}deg`);
      actor.style.setProperty('--drift-scale', String(1 - (1 - entry) * 0.025 * amplitude));
    });

    const joinMetric = metrics.get(join);
    if (joinMetric) {
      const progress = ease(clamp((innerHeight * 0.82 - (joinMetric.top - smoothScroll)) / (innerHeight * 0.5)));
      join.style.setProperty('--join-gap', `${(mobile ? 28 : 64) * (1 - progress)}px`);
      join.style.setProperty('--join-turn', `${(1 - progress) * -2.5 * amplitude}deg`);
      join.style.setProperty('--join-scale', String(0.965 + progress * 0.035));
      join.style.setProperty('--join-pointer-x', `${smoothPointerX * 4 * amplitude}px`);
      join.style.setProperty('--join-pointer-y', `${smoothPointerY * 3 * amplitude}px`);
    }
    if (Math.abs(scrollY - smoothScroll) > 0.15 || Math.abs(pointerX - smoothPointerX) > 0.002 || Math.abs(pointerY - smoothPointerY) > 0.002) scheduleDepth();
  }

  function scheduleDepth() {
    if (!paused && !document.hidden && !framePending) {
      framePending = true;
      requestAnimationFrame(renderDepth);
    }
  }
  addEventListener('scroll', scheduleDepth, {passive: true});
  addEventListener('resize', measureScenes, {passive: true});
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX / innerWidth * 2 - 1;
    pointerY = event.clientY / innerHeight * 2 - 1;
    scheduleDepth();
  }, {passive: true});
  function resetPointer() {
    pointerX = 0;
    pointerY = 0;
    scheduleDepth();
  }
  addEventListener('pointerout', event => {
    if (!event.relatedTarget) resetPointer();
  }, {passive: true});
  addEventListener('blur', resetPointer);
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    setMotionState();
  });
  reducedMotion.addEventListener('change', event => {
    paused = event.matches || saveData;
    setMotionState();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
    else {
      smoothScroll = scrollY;
      lastFrame = 0;
      visibleVideos.forEach(playMoment);
      scheduleDepth();
    }
  });
  measureScenes();
  document.fonts.ready.then(measureScenes);
  if ('ResizeObserver' in window) new ResizeObserver(measureScenes).observe(document.querySelector('main'));
  setMotionState();

  const dialog = document.querySelector('.photo-dialog');
  const enlarged = document.querySelector('#enlarged-photo');
  const caption = document.querySelector('#photo-caption');
  let returnFocus;
  document.querySelectorAll('.photo-open').forEach(button => {
    button.addEventListener('click', () => {
      returnFocus = button;
      enlarged.src = `assets/photos/${button.dataset.photo}-1440.webp`;
      enlarged.alt = button.querySelector('img').alt;
      caption.textContent = button.dataset.caption;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
        document.body.classList.add('dialog-open');
      } else window.open(enlarged.src, '_blank', 'noopener');
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    returnFocus?.focus({preventScroll: true});
  });

  const address = 'The Ummed, Airport Circle, Hansol, Ahmedabad, Gujarat 382475';
  const copy = document.querySelector('#copy-address');
  const status = document.querySelector('.copy-status');
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    let copied = false;
    // Textarea fallback works in common WhatsApp webviews as well as desktop.
    const area = document.createElement('textarea');
    area.value = address;
    area.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(area);
    area.select();
    try { copied = document.execCommand('copy'); } catch {}
    area.remove();
    if (!copied && navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(address); copied = true; } catch {}
    }
    status.textContent = copied ? 'Address copied. See you there!' : `You can copy this address: ${address}`;
    copy.focus({preventScroll: true});
  });
})();
