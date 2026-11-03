// Builds the content pages (about, services) into public/ from the data below plus src/partials.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const ORIGIN = 'https://growwthgarden.com';
const header = readFileSync('src/partials/header.html', 'utf8');
const footer = readFileSync('src/partials/footer.html', 'utf8');

const faqHtml = items => items.map(([q, a]) => `<h3 class="prose__sub">${q}</h3>\n      <p>${a}</p>`).join('\n      ');
const faqSchema = items => ({ '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });

const websitesFaq = [
  ['What do you build?', 'Business websites, e-commerce stores, mobile and web apps, AI systems and AI automations. Everything is designed around your customers and built to be fast and easy to find on Google.'],
  ['How long does a website take?', 'Timelines depend on scope. We build lean and move quickly, and many websites go live within days. Larger apps, e-commerce stores and custom AI systems take longer, and we give you a clear timeline before we start.'],
  ['Will my website be SEO-ready?', 'Yes. Every site we build has clean, fast code, mobile-first layouts, unique page titles and descriptions, structured data, a sitemap and clean URLs, so search engines can understand and rank it.'],
  ['What are AI automations?', 'AI automations are workflows that handle repetitive work for you, such as capturing and qualifying leads, replying to common questions and routing inquiries to the right person, so your team spends time on real conversations.'],
  ['Where are you based?', 'Our office is at H.no 1405, Sector 4, Rewari, Haryana, 123401. We work with clients across India and beyond.'],
];

const brandingFaq = [
  ['What does branding include?', 'Brand strategy and positioning, brand identity, rebranding and refresh, content development, brand experience, communication and design, corporate communications and brand conformance (IPR).'],
  ['What is brand strategy and positioning?', 'It is the thinking behind the visuals: who you serve, what makes you different and how you want to be remembered. Strategy comes first so the identity, content and campaigns all point in the same direction.'],
  ['Can you refresh an existing brand?', 'Yes. If your brand has outgrown its look or message, we can refresh it while keeping what your customers already recognise, or rebrand fully when a fresh start makes sense.'],
  ['What is brand conformance (IPR)?', 'It is making sure your brand assets are used consistently and protected, including guidelines for how your name, logo and content are used and support in protecting your intellectual property rights.'],
  ['How does branding help my marketing?', 'A clear brand makes every other channel work harder. People recognise you faster, trust you sooner and respond better to your ads, content and website.'],
];

const leadFaq = [
  ['What is lead generation?', 'Lead generation is getting the right people to enquire about your business. We find your ideal customers, reach them where they spend time online and capture their details so your team can follow up.'],
  ['What are SEO, AEO and GEO?', 'SEO helps your pages rank in search results. AEO (answer engine optimisation) and GEO (generative engine optimisation) make your content easy for answer engines and AI assistants such as ChatGPT to find, understand and cite.'],
  ['Which channels do you use?', 'SEO, AEO and GEO, social media marketing, performance marketing, influencer marketing, email and WhatsApp marketing, online reputation management (ORM) and ChatGPT ads. We choose the mix based on where your customers actually are.'],
  ['What is an ideal customer profile (ICP)?', 'It is a clear description of the customers who are the best fit for your business: who they are, where they spend time online and what makes them buy. Every campaign we run is built around it.'],
  ['How do you handle leads once they come in?', 'We automate the flow so every inquiry is captured, qualified and followed up without you chasing it, using email, WhatsApp and CRM-style automations.'],
];

const pages = [
  {
    path: '/services/websites-apps-ai',
    nav: '/services',
    title: 'Website, App & AI Development Services | Growwth Garden',
    description: 'SEO-ready websites, apps, e-commerce and AI automations built fast and clean by Growwth Garden in Rewari, Haryana. Talk to our team.',
    h1: 'Websites, Apps & AI Systems',
    crumbs: [['Home', '/'], ['Our Services', '/services'], ['Websites, Apps & AI Systems']],
    schema: [
      { '@type': 'Service', name: 'Websites, Apps & AI Systems', serviceType: 'Website, app and AI development', description: 'SEO-ready websites, apps, e-commerce stores, AI systems and AI automations.', provider: { '@id': ORIGIN + '/#organization' }, areaServed: 'IN' },
      faqSchema(websitesFaq),
    ],
    body: `
      <p class="prose__lead">We build your SEO-ready website or app from scratch in just a few days. Every page is designed around your customers, coded clean and fast, and wired with AI automation so your work runs on its own from day one.</p>

      <h2 class="prose__h">What we build</h2>
      <ul class="prose__list">
        <li><b>Website development.</b> Fast, mobile-first business sites that are easy to find and easy to use.</li>
        <li><b>App development.</b> Web and mobile apps built around a clear job your customers need done.</li>
        <li><b>E-commerce.</b> Stores that make it simple to browse, trust and buy.</li>
        <li><b>AI systems.</b> Practical AI built into how your business already works.</li>
        <li><b>Fine-tuned AI systems.</b> Models tuned on your own content so answers sound like you.</li>
        <li><b>AI automations.</b> Workflows that capture, qualify and follow up on leads without manual effort.</li>
      </ul>

      <h2 class="prose__h">Built to be found</h2>
      <p>A website that nobody finds does not grow your business. We build SEO into every project from the first line of code: clean and fast pages, mobile-first layouts, unique titles and descriptions, structured data, a sitemap and clean URLs. Pair it with our <a href="/services">lead generation services</a> and your site becomes the centre of a steady flow of inquiries.</p>

      <h2 class="prose__h">How we work</h2>
      <ul class="prose__list">
        <li><b>1. Discover.</b> We learn your business, your customers and your goals.</li>
        <li><b>2. Design.</b> We craft a concept around what your customers respond to.</li>
        <li><b>3. Develop.</b> We bring it to life with clean code and the automations you need.</li>
        <li><b>4. Deliver.</b> We launch with care, then measure and improve.</li>
      </ul>

      <h2 class="prose__h">Frequently asked questions</h2>
      ${faqHtml(websitesFaq)}

      <div class="prose__cta">
        <h2 class="prose__h" style="margin-top:0">Have a project in mind?</h2>
        <p>Tell us what you want to build and we will come back with a plan.</p>
        <a class="btn btn--blue" href="/contact"><span>Talk to our team</span></a>
      </div>`,
  },
  {
    path: '/services/branding',
    nav: '/services',
    title: 'Branding Services: Strategy, Identity & Content | Growwth Garden',
    description: 'Brand strategy, identity, rebranding and content from Growwth Garden in Rewari, Haryana. Shape a brand the market knows before the ads start.',
    h1: 'Branding',
    crumbs: [['Home', '/'], ['Our Services', '/services'], ['Branding']],
    schema: [
      { '@type': 'Service', name: 'Branding', serviceType: 'Branding and brand strategy', description: 'Brand strategy and positioning, brand identity, rebranding, content development and communication design.', provider: { '@id': ORIGIN + '/#organization' }, areaServed: 'IN' },
      faqSchema(brandingFaq),
    ],
    body: `
      <p class="prose__lead">Your story, your look, your voice, shaped so the market knows who you are long before the ad budget kicks in.</p>

      <h2 class="prose__h">What branding covers</h2>
      <ul class="prose__list">
        <li><b>Brand strategy &amp; positioning.</b> Who you serve and why you are the better choice.</li>
        <li><b>Brand identity.</b> Name, logo, colours, type and the visual system around them.</li>
        <li><b>Rebranding &amp; refresh.</b> A new look and message when your business has outgrown the old one.</li>
        <li><b>Content development.</b> Words, images and video that sound and look like you.</li>
        <li><b>Brand experience.</b> Every touchpoint, from your website to how you reply to a message.</li>
        <li><b>Communication &amp; design.</b> Creative that carries your message across channels.</li>
        <li><b>Corporate communications.</b> Clear, consistent messaging for your company as it grows.</li>
        <li><b>Brand conformance (IPR).</b> Keeping your brand consistent and protected.</li>
      </ul>

      <h2 class="prose__h">Why brand first</h2>
      <p>Ads buy attention, but a brand earns trust. When people already recognise you, they click sooner, enquire sooner and stay longer. We build the brand first, then put it to work across your <a href="/services/websites-apps-ai">website</a> and your marketing.</p>

      <h2 class="prose__h">How we work</h2>
      <ul class="prose__list">
        <li><b>1. Discover.</b> We learn your business, your customers and your competitors.</li>
        <li><b>2. Design.</b> We craft the strategy and identity around what sets you apart.</li>
        <li><b>3. Develop.</b> We turn it into content, guidelines and assets you can use every day.</li>
        <li><b>4. Deliver.</b> We launch the brand and keep it consistent as you grow.</li>
      </ul>

      <h2 class="prose__h">Frequently asked questions</h2>
      ${faqHtml(brandingFaq)}

      <div class="prose__cta">
        <h2 class="prose__h" style="margin-top:0">Ready to build a brand people remember?</h2>
        <p>Tell us about your business and we will suggest where to start.</p>
        <a class="btn btn--blue" href="/contact"><span>Talk to our team</span></a>
      </div>`,
  },
  {
    path: '/services/lead-generation',
    nav: '/services',
    title: 'Lead Generation: SEO, Social & Performance Marketing | Growwth Garden',
    description: 'Lead generation from Growwth Garden in Rewari, Haryana: SEO, AEO, GEO, social, performance marketing and automated follow-up.',
    h1: 'Lead Generation',
    crumbs: [['Home', '/'], ['Our Services', '/services'], ['Lead Generation']],
    schema: [
      { '@type': 'Service', name: 'Lead Generation', serviceType: 'Lead generation and digital marketing', description: 'SEO, AEO and GEO, social media, performance and influencer marketing, email and WhatsApp marketing, ORM and automation.', provider: { '@id': ORIGIN + '/#organization' }, areaServed: 'IN' },
      faqSchema(leadFaq),
    ],
    body: `
      <p class="prose__lead">We start by identifying your ideal customers, mapping their demographics and where they spend time online. Then we set up the right lead channels and automate the flow, so every inquiry is captured, qualified and followed up without you chasing it.</p>

      <h2 class="prose__h">Channels we run</h2>
      <ul class="prose__list">
        <li><b>SEO, AEO &amp; GEO.</b> Be found on Google and in answers from AI assistants.</li>
        <li><b>Social media marketing.</b> Content and campaigns where your customers scroll.</li>
        <li><b>Performance marketing.</b> Paid campaigns built around measurable results.</li>
        <li><b>Influencer marketing.</b> Creators your audience already trusts.</li>
        <li><b>Email &amp; WhatsApp marketing.</b> Direct follow-up with people who showed interest.</li>
        <li><b>ORM &amp; automation.</b> Protect your reputation and remove manual follow-up.</li>
        <li><b>ChatGPT ads.</b> Reach people while they ask AI for recommendations.</li>
      </ul>

      <h2 class="prose__h">Our approach</h2>
      <ul class="prose__list">
        <li><b>1. Discover.</b> We define your ideal customers (ICPs) and map where they spend time online.</li>
        <li><b>2. Design.</b> We pick the channels and craft the offers and messages that fit them.</li>
        <li><b>3. Develop.</b> We set up campaigns, landing pages and the automated flow behind them.</li>
        <li><b>4. Deliver.</b> We launch, track every inquiry and keep improving what works.</li>
      </ul>

      <h2 class="prose__h">Built on a strong foundation</h2>
      <p>Leads convert better when the basics are right. We pair lead generation with a fast, SEO-ready <a href="/services/websites-apps-ai">website</a> and a clear <a href="/services/branding">brand</a>, so the people you attract trust what they find.</p>

      <h2 class="prose__h">Frequently asked questions</h2>
      ${faqHtml(leadFaq)}

      <div class="prose__cta">
        <h2 class="prose__h" style="margin-top:0">Want more of the right inquiries?</h2>
        <p>Tell us who your ideal customer is and we will map out the channels to reach them.</p>
        <a class="btn btn--blue" href="/contact"><span>Talk to our team</span></a>
      </div>`,
  },
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
  <link rel="stylesheet" href="/css/style.min.css?v=3">
</head>
<body class="page-content">

  <section class="page-hero">
    <div class="hero__noise" aria-hidden="true"></div>
    ${activeNav(header.trim(), p.nav || p.path)}
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
  <script src="/js/page.min.js?v=3"></script>
</body>
</html>
`;
  const out = `public${p.path}.html`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', out);
}
