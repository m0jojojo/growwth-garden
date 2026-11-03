// Builds the content pages (about, services) into public/ from the data below plus src/partials.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const ORIGIN = 'https://growwthgarden.com';
const header = readFileSync('src/partials/header.html', 'utf8');
const footer = readFileSync('src/partials/footer.html', 'utf8');

const pages = [
  {
    path: '/services',
    title: 'Marketing, Website & Branding Services | Growwth Garden',
    description: 'Websites, apps and AI systems, branding, and lead generation (SEO, social, performance marketing) from Growwth Garden in Rewari, Haryana.',
    h1: 'Our Services',
    crumbs: [['Home', '/'], ['Our Services']],
    schema: [
      ['Websites, Apps & AI Systems', 'Website development, app development, e-commerce, AI systems and AI automations.'],
      ['Branding', 'Brand strategy, identity, rebranding, content development and communication design.'],
      ['Lead Generation', 'SEO, AEO and GEO, social media, performance and influencer marketing, email and WhatsApp marketing, with automated follow-up.'],
    ].map(([name, description]) => ({ '@type': 'Service', name, description, provider: { '@id': ORIGIN + '/#organization' }, areaServed: 'IN' })),
    body: `
      <p class="prose__lead">One team for the three things that grow a business online: a site that converts, a brand people remember, and a steady flow of qualified leads.</p>

      <h2 class="prose__h">Websites, Apps &amp; AI Systems</h2>
      <p>We build your SEO-ready website or app from scratch in just a few days. Every page is designed around your customers, coded clean and fast, and wired with AI automation so your work runs on its own from day one.</p>
      <ul class="prose__list">
        <li>Website development</li>
        <li>App development</li>
        <li>E-commerce</li>
        <li>AI systems and fine-tuned AI systems</li>
        <li>AI automations</li>
      </ul>

      <h2 class="prose__h">Branding</h2>
      <p>Your story, your look, your voice, shaped so the market knows who you are long before the ad budget kicks in.</p>
      <ul class="prose__list">
        <li>Brand strategy &amp; positioning</li>
        <li>Brand identity</li>
        <li>Rebranding &amp; refresh</li>
        <li>Content development</li>
        <li>Brand experience</li>
        <li>Communication &amp; design</li>
        <li>Corporate communications</li>
        <li>Brand conformance (IPR)</li>
      </ul>

      <h2 class="prose__h">Lead Generation</h2>
      <p>We start by identifying your ideal customers, mapping their demographics and where they spend time online. Then we set up the right lead channels and automate the flow, so every inquiry is captured, qualified and followed up without you chasing it.</p>
      <ul class="prose__list">
        <li>SEO, AEO &amp; GEO</li>
        <li>Social media marketing</li>
        <li>Performance marketing</li>
        <li>Influencer marketing</li>
        <li>Email &amp; WhatsApp marketing</li>
        <li>ORM &amp; automation</li>
        <li>ChatGPT ads</li>
      </ul>

      <div class="prose__cta">
        <h2 class="prose__h" style="margin-top:0">Not sure where to start?</h2>
        <p>Tell us about your business and goals and we will recommend the right mix.</p>
        <a class="btn btn--blue" href="/contact"><span>Talk to our team</span></a>
      </div>`,
  },
  {
    path: '/about',
    title: 'About Growwth Garden | Marketing Agency in Rewari, Haryana',
    description: 'Growwth Garden is a Rewari-based marketing agency combining websites, branding and lead generation so your growth runs as one system.',
    h1: 'About Us',
    crumbs: [['Home', '/'], ['About Us']],
    body: `
      <p class="prose__lead">Growwth Garden is a marketing agency based in Rewari, Haryana. We turn ideas into viral reels, brands into something people feel, and messages into stories that drive action. Web, branding and revenue, working together.</p>

      <h2 class="prose__h">What we do</h2>
      <p>Most businesses buy a website from one vendor, a logo from another and ads from a third, and none of it connects. We build the three parts together so each one makes the others work harder.</p>
      <ul class="prose__list">
        <li><b><a href="/services/websites-apps-ai">Websites, Apps &amp; AI Systems</a></b> built fast, SEO-ready and wired with automation.</li>
        <li><b><a href="/services/branding">Branding</a></b> strategy, identity and content so the market knows who you are.</li>
        <li><b><a href="/services/lead-generation">Lead Generation</a></b> SEO, social, performance marketing and automated follow-up.</li>
      </ul>

      <h2 class="prose__h">How we work</h2>
      <ul class="prose__list">
        <li><b>1. Discover.</b> We start by understanding your vision, your customers and your market.</li>
        <li><b>2. Design.</b> We craft unique concepts around what your customers respond to.</li>
        <li><b>3. Develop.</b> We bring the designs to life with clean, fast code and the right channels.</li>
        <li><b>4. Deliver.</b> We launch with care, then measure and improve.</li>
      </ul>

      <h2 class="prose__h">Where to find us</h2>
      <p>H.no 1405, Sector 4, Rewari, Haryana, 123401. Open Monday to Friday, 9:00 AM to 6:00 PM. Call <a href="tel:+919369033958">+91-9369033958</a> or email <a href="mailto:growwthgarden@gmail.com">growwthgarden@gmail.com</a>.</p>

      <div class="prose__cta">
        <h2 class="prose__h" style="margin-top:0">Ready to grow?</h2>
        <a class="btn btn--blue" href="/contact"><span>Talk to our team</span></a>
      </div>`,
  },
];

const activeNav = (h, path) => h
  .replace(`<a href="${path}" class="has-sub">`, `<a href="${path}" class="has-sub is-active">`)
  .replace(`<a href="${path}">`, `<a class="is-active" href="${path}">`);

const esc = s => s.replace(/&(?!amp;)/g, '&amp;');

for (const p of pages) {
  const url = ORIGIN + p.path;
  const crumbHtml = p.crumbs.map(([n, h]) => (h ? `<a href="${h}">${n}</a>` : n)).join(' <span>/</span> ');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'BreadcrumbList',
      itemListElement: p.crumbs.map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: h ? ORIGIN + h : url })),
    }, ...(p.schema || [])],
  };
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="only light">
  <meta name="supported-color-schemes" content="light">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Growwth Garden">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ORIGIN}/assets/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.title)}">
  <meta name="twitter:description" content="${esc(p.description)}">
  <meta name="twitter:image" content="${ORIGIN}/assets/og-image.jpg">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.min.css?v=2">
</head>
<body class="page-content">

  <section class="page-hero">
    <div class="hero__noise" aria-hidden="true"></div>
    ${activeNav(header.trim(), p.path)}
    <div class="page-hero__text">
      <h1 class="page-hero__title">${p.h1}</h1>
      <p class="crumbs">${crumbHtml}</p>
    </div>
  </section>

  <main class="prose">
    <div class="about__noise" aria-hidden="true"></div>
    <div class="container">${p.body}
    </div>
  </main>

  ${footer.trim()}

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="/js/page.min.js?v=2"></script>
</body>
</html>
`;
  const out = `public${p.path}.html`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', out);
}
