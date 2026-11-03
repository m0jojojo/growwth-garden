(() => {
  /* mobile menu */
  const menu = document.querySelector('.menu'), navEl = document.querySelector('.nav');
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    navEl.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', open);
  });

  /* services dropdown */
  const navItem = document.querySelector('.nav__item');
  if (navItem) {
    const trigger = navItem.querySelector('.nav__trigger');
    const setOpen = open => { navItem.classList.toggle('is-open', open); trigger.setAttribute('aria-expanded', open); };
    trigger.addEventListener('click', e => { e.preventDefault(); setOpen(!navItem.classList.contains('is-open')); });
    document.addEventListener('click', e => { if (!navItem.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .1 })
    .from('.header', { y: -30, autoAlpha: 0, duration: .8 })
    .from('.page-hero__title', { y: -40, autoAlpha: 0, duration: .9 }, .15)
    .from('.crumbs', { y: -20, autoAlpha: 0, duration: .8 }, .4);
  gsap.from('.footer__grid > *', { y: 40, autoAlpha: 0, duration: .9, stagger: .12, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true } });
})();
