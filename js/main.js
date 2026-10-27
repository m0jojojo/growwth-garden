(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const lines1 = document.querySelectorAll('.headline__line--1');
  const lines2 = document.querySelectorAll('.headline__line--2');

  /* Fit the headline to the 1280px design: "CREATIVE" spans 710 design-px. */
  function fitHeadline() {
    const u = window.innerWidth <= 900 ? window.innerWidth / 760 : window.innerWidth / 1280;
    const probe = lines1[0];
    probe.style.fontSize = '100px';
    const w = probe.getBoundingClientRect().width;
    const size = (710 * u) / w * 100;
    document.querySelectorAll('.headline__line').forEach(el => (el.style.fontSize = size + 'px'));
  }
  document.fonts.ready.then(fitHeadline);
  window.addEventListener('resize', fitHeadline);

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- marquee: seamless loop ---------- */
  const track = document.querySelector('.marquee__track');
  const group = track.querySelector('.marquee__group');
  const copies = Math.ceil((window.innerWidth * 1.1) / group.offsetWidth) + 1;
  for (let i = 0; i < copies; i++) track.appendChild(group.cloneNode(true));
  const loop = gsap.to(track, {
    x: () => -group.offsetWidth, duration: 22, ease: 'none', repeat: -1,
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
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .15 });
    tl.from('.header', { y: -40, autoAlpha: 0, duration: .9 })
      .from('.headline__line--1 span', { xPercent: -110, duration: 1.3 }, .1)
      .from('.headline__line--2 span', { xPercent: 110, duration: 1.3 }, .1)
      .from('.hero__person', { xPercent: 40, autoAlpha: 0, duration: 1.3 }, .2)
      .from('.hero__left > *', { y: 30, autoAlpha: 0, duration: .9, stagger: .15 }, .6)
      .from('.hero__right > *, .hero__badge', { y: 30, autoAlpha: 0, duration: .9, stagger: .12 }, .7)
      .from('.marquee', { yPercent: 100, duration: 1 }, .5);

    document.querySelectorAll('[data-count]').forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 2, delay: .9, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
    });
  }
})();
