(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const lines1 = document.querySelectorAll('.headline__line--1');
  const lines2 = document.querySelectorAll('.headline__line--2');

  /* Fit the headline to the 1280px design: "CREATIVE" spans 710 design-px. */
  function fitHeadline() {
    const w1 = innerWidth;
    /* measure the original "CREATIVE" word so the font size (and every ratio) stays unchanged for any headline text */
    const probe = document.createElement('span');
    probe.className = 'headline__line';
    probe.style.cssText = 'visibility:hidden;font-size:100px';
    probe.textContent = 'CREATIVE';
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    /* phones/tablets: "CREATIVE" spans the content width; desktop: 710 design-px */
    const target = w1 <= 900 ? document.querySelector('.hero__inner').offsetWidth : 710 * (w1 <= 1100 ? w1 / 1100 : w1 / 1280);
    const size = target / w * 100;
    document.querySelectorAll('.headline__line').forEach(el => (el.style.fontSize = size + 'px'));
    root.style.setProperty('--hl', size + 'px');
  }
  /* re-fit once Anton has really loaded (fonts.ready can resolve early), on load, and on width changes only */
  fitHeadline();
  if (document.fonts) {
    document.fonts.load('100px Anton', 'CREATIVE').then(fitHeadline);
    document.fonts.ready.then(fitHeadline);
    document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', fitHeadline);
  }
  window.addEventListener('load', fitHeadline);
  let lastW = innerWidth;
  window.addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; fitHeadline(); } });

  /* mobile menu */
  const menu = document.querySelector('.menu'), navEl = document.querySelector('.nav');
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    navEl.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', open);
  });
  navEl.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('is-open'); navEl.classList.remove('is-open'); menu.setAttribute('aria-expanded', false); } });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- service tags: highlight one pill at a time per card, hover takes over ---------- */
  document.querySelectorAll('.card__tags').forEach(list => {
    const tags = [...list.children].filter(li => !li.classList.contains('card__break'));
    let cur = 0, hovering = false;
    const show = i => tags.forEach((t, k) => t.classList.toggle('is-active', k === i));
    show(cur);
    tags.forEach((t, i) => {
      t.addEventListener('mouseenter', () => { hovering = true; cur = i; show(i); });
      t.addEventListener('mouseleave', () => { hovering = false; });
    });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      setInterval(() => { if (!hovering) { cur = (cur + 1) % tags.length; show(cur); } }, 2200);
  });

  /* ---------- marquee: seamless loop ---------- */
  const track = document.querySelector('.marquee__track');
  const group = track.querySelector('.marquee__group');
  const copies = Math.ceil((window.innerWidth * 1.1) / group.offsetWidth) + 1;
  for (let i = 0; i < copies; i++) track.appendChild(group.cloneNode(true));
  const loop = gsap.to(track, {
    x: () => -group.offsetWidth, duration: 15, ease: 'none', repeat: -1,
    modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % group.offsetWidth) },
  });
  /* scroll speeds the marquee up a touch, direction-aware */
  ScrollTrigger.create({
    onUpdate: self => {
      gsap.to(loop, { timeScale: 1 + Math.abs(self.getVelocity()) / 600 * Math.sign(self.direction), duration: .3, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1, delay: .3 });
    },
  });

  /* ---------- load-in timeline ---------- */
  if (!reduce) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .15 });
    tl.from('.header', { y: -40, autoAlpha: 0, duration: .9 })
      .from('.headline__line--1 span', { xPercent: -110, duration: 1.3 }, .1)
      .from('.headline__line--2 span', { xPercent: 110, duration: 1.3 }, .1)
      .from('.hero__person', { xPercent: 40, autoAlpha: 0, duration: 1.3 }, .2)
      .from('.hero__left > *', { y: 30, autoAlpha: 0, duration: .9, stagger: .15 }, .6)
      .from('.hero__right > *', { y: 30, autoAlpha: 0, duration: .9, stagger: .12 }, .7)
      .from('.marquee', { yPercent: 100, duration: 1 }, .5);

    document.querySelectorAll('[data-count]').forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 2, delay: .9, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
    });
  }
  /* ---------- services: reveal on scroll (fadeInUp, 200ms stagger like the original) ---------- */
  if (!reduce) {
    const reveal = (targets, vars, trigger) =>
      gsap.from(targets, { y: 50, autoAlpha: 0, duration: .9, ease: 'power3.out', ...vars, scrollTrigger: { trigger, start: 'top 85%', once: true } });
    reveal('.services__head > *', { stagger: .15 }, '.services__head');
    document.querySelectorAll('.card').forEach((card, i) => reveal(card, { y: 230, duration: .5, delay: i * .09, ease: 'power3.out', clearProps: 'all' }, '.cards'));
  }
  /* ---------- who we are: reveal, skill bars, logo carousel ---------- */
  const logosTrack = document.querySelector('.logos__track');
  if (logosTrack) {
    const items = [...logosTrack.children];
    items.forEach(n => logosTrack.appendChild(n.cloneNode(true)));      // 16 slides, 8 visible
    const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(items[0]).marginRight);
    const slide = gsap.to(logosTrack, {
      x: () => -step(), duration: 1, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.5,
      onRepeat: () => { logosTrack.appendChild(logosTrack.firstElementChild); gsap.set(logosTrack, { x: 0 }); },
    });
    const strip = document.querySelector('.logos');
    strip.addEventListener('mouseenter', () => slide.pause());
    strip.addEventListener('mouseleave', () => slide.resume());
  }

  const skillBars = document.querySelectorAll('.skills__bar');
  if (!reduce) {
    const dir = { left: { x: -60 }, right: { x: 60 }, up: { y: 60 } };
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
      gsap.from(el, { ...dir[el.dataset.reveal], autoAlpha: 0, duration: 1, delay: i * .15, ease: 'power3.out', clearProps: 'all',
        scrollTrigger: { trigger: '.about', start: 'top 70%', once: true } });
    });
    skillBars.forEach((bar, i) => {
      const num = bar.closest('li').querySelector('b');
      const o = { v: 0 };
      gsap.to(bar, { width: bar.dataset.to + '%', duration: 1.6, delay: .4 + i * .15, ease: 'power2.out', scrollTrigger: { trigger: '.skills', start: 'top 85%', once: true } });
      gsap.to(o, { v: +bar.dataset.to, duration: 1.6, delay: .4 + i * .15, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(o.v) + '%'), scrollTrigger: { trigger: '.skills', start: 'top 85%', once: true } });
    });
  } else {
    skillBars.forEach(bar => (bar.style.width = bar.dataset.to + '%'));
  }
  /* ---------- process: cards rise, their titles slide in from the left ---------- */
  if (!reduce) {
    document.querySelectorAll('.step').forEach((step, i) => {
      const st = { trigger: '.steps', start: 'top 85%', once: true };
      gsap.from(step, { y: 40, autoAlpha: 0, duration: .8, delay: i * .12, ease: 'power3.out', clearProps: 'all', scrollTrigger: st });
      gsap.from(step.querySelector('.step__title span'), { xPercent: -40, autoAlpha: 0, duration: 1, delay: .3 + i * .12, ease: 'power3.out', clearProps: 'all', scrollTrigger: st });
    });
    gsap.from('.process__head > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .15, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.process__head', start: 'top 85%', once: true } });
  }
  /* ---------- testimonials: looping carousel, 2 per view, one slide every few seconds (Swiper in the original) ---------- */
  const tTrack = document.querySelector('.testi__track');
  if (tTrack && !reduce) {
    const step = () => tTrack.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(tTrack).columnGap || 0);
    let paused = false;
    const next = () => {
      if (paused || document.hidden) return;
      gsap.to(tTrack, { x: -step(), duration: 1, ease: 'power2.inOut', onComplete: () => { tTrack.appendChild(tTrack.children[0]); gsap.set(tTrack, { x: 0 }); } });
    };
    setInterval(() => { if (!gsap.isTweening(tTrack)) next(); }, 3500);
    const slider = document.querySelector('.testi__slider');
    slider.addEventListener('mouseenter', () => (paused = true));
    slider.addEventListener('mouseleave', () => (paused = false));
    gsap.from('.testi__head > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .15, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.testi', start: 'top 70%', once: true } });
    gsap.from('.tcard', { y: 60, autoAlpha: 0, duration: 1, stagger: .15, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.testi__slider', start: 'top 90%', once: true } });
  }
  /* ---------- blog: heading and posts fade up ---------- */
  if (!reduce) {
    gsap.from('.blog__head > *', { y: 50, autoAlpha: 0, duration: .9, stagger: .15, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.blog__head', start: 'top 85%', once: true } });
    document.querySelectorAll('.post').forEach((post, i) =>
      gsap.from(post, { y: 60, autoAlpha: 0, duration: .9, delay: i * .15, ease: 'power3.out', clearProps: 'all',
        scrollTrigger: { trigger: '.posts', start: 'top 85%', once: true } }));
  }
  /* ---------- newsletter: card rises, copy slides in from the left, star keeps turning ---------- */
  if (!reduce) {
    const nst = { trigger: '.news', start: 'top 85%', once: true };
    gsap.from('.news', { y: 60, autoAlpha: 0, duration: .9, ease: 'power3.out', clearProps: 'all', scrollTrigger: nst });
    gsap.from('.news__body > *', { xPercent: -8, autoAlpha: 0, duration: 1, delay: .25, stagger: .12, ease: 'power3.out', clearProps: 'all', scrollTrigger: nst });
    gsap.to('.news__star', { rotation: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    gsap.from('.footer__grid > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .12, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true } });
  }
  /* ---------- cta: ring text turns non-stop (Lottie autoplay + loop in the original) ---------- */
  if (!reduce) {
    gsap.to('.cta__ring', { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    gsap.to('.cta__emblem', { rotation: -360, duration: 26, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    gsap.from('.cta__card', { y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.cta', start: 'top 65%', once: true } });
  }
})();
