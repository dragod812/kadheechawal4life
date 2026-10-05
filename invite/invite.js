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
  const completed = new WeakSet();
  const visibleVideos = new Set();

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
    renderDepth();
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
  } else document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));

  function renderDepth() {
    framePending = false;
    const hero = document.querySelector('.hero');
    const join = document.querySelector('.joining-photos');
    if (paused) {
      hero.style.setProperty('--leaf-x', '0px');
      hero.style.setProperty('--leaf-y', '0px');
      join.style.setProperty('--join-gap', '0px');
      return;
    }
    const heroTop = hero.getBoundingClientRect().top;
    const retreat = Math.min(Math.max(-heroTop, 0), 850);
    hero.style.setProperty('--leaf-x', `${pointerX * 7 - retreat * 0.025}px`);
    hero.style.setProperty('--leaf-y', `${pointerY * 5 - retreat * 0.055}px`);
    const rect = join.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * 0.82 - rect.top) / (innerHeight * 0.45)));
    join.style.setProperty('--join-gap', `${(innerWidth < 700 ? 20 : 35) * (1 - progress)}px`);
  }

  function scheduleDepth() {
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(renderDepth);
    }
  }
  addEventListener('scroll', scheduleDepth, {passive: true});
  addEventListener('resize', scheduleDepth, {passive: true});
  document.querySelector('.hero').addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX / innerWidth * 2 - 1;
    pointerY = event.clientY / innerHeight * 2 - 1;
    scheduleDepth();
  }, {passive: true});
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
    else visibleVideos.forEach(playMoment);
  });
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
