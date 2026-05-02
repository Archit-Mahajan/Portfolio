import { useState, useEffect, useRef, useCallback } from "react";

/* ================================================================
   GOOGLE FONTS — injected once via useEffect
   ================================================================ */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap";

/* ================================================================
   GLOBAL CSS
   ================================================================ */
const STYLES = `
  :root {
    --bg:         #030305;
    --bg2:        #09090f;
    --bg3:        #0f0f1a;
    --accent:     #00ff88;
    --accent2:    #4d6cff;
    --accent-dim: rgba(0, 255, 136, 0.1);
    --text:       #eeeef8;
    --muted:      #5a5a78;
    --border:     rgba(255, 255, 255, 0.06);
    --font-display: 'Bebas Neue', sans-serif;
    --font-heading: 'Syne', sans-serif;
    --font-body:    'Syne', sans-serif;
    --font-mono:    'DM Mono', monospace;
    --nav-h:      72px;
    --section-px: 5rem;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; overflow-x: hidden; cursor: none; }
  a { color: inherit; text-decoration: none; cursor: none; }
  ul { list-style: none; }

  /* ── Cursor ── */
  #cursor-dot {
    position: fixed; width: 8px; height: 8px; background: var(--accent);
    border-radius: 50%; pointer-events: none; z-index: 9999;
    transform: translate(-50%,-50%); transition: transform .08s, background .3s;
  }
  #cursor-ring {
    position: fixed; width: 38px; height: 38px; border: 1.5px solid var(--accent);
    border-radius: 50%; pointer-events: none; z-index: 9998;
    transform: translate(-50%,-50%);
    transition: width .3s, height .3s, background .3s, opacity .3s, border-color .3s;
    opacity: .55;
  }
  #cursor-ring.hovered { width: 60px; height: 60px; background: var(--accent-dim); opacity: 1; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; height: var(--nav-h); z-index: 1000;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 var(--section-px);
    background: rgba(3,3,5,0); backdrop-filter: blur(0px); border-bottom: 1px solid transparent;
    transition: background .4s, backdrop-filter .4s, border-color .4s;
  }
  nav.scrolled { background: rgba(3,3,5,.88); backdrop-filter: blur(16px); border-bottom-color: var(--border); }
  .nav-logo { font-family: var(--font-mono); font-size: .8rem; letter-spacing: .15em; color: var(--accent); text-transform: uppercase; }
  .nav-links { display: flex; gap: 2.5rem; }
  .nav-links a { font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); position: relative; transition: color .3s; }
  .nav-links a::after { content:''; position: absolute; bottom: -4px; left: 0; height: 1px; width: 0; background: var(--accent); transition: width .3s; }
  .nav-links a:hover, .nav-links a.active { color: var(--text); }
  .nav-links a:hover::after, .nav-links a.active::after { width: 100%; }

  /* ── Reveal ── */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity .8s ease, transform .8s ease; }
  .reveal.visible { opacity: 1; transform: none; }
  .delay-1 { transition-delay: .1s; } .delay-2 { transition-delay: .2s; }
  .delay-3 { transition-delay: .3s; } .delay-4 { transition-delay: .45s; }
  .delay-5 { transition-delay: .6s; }

  /* ── Sections ── */
  section { padding: 8rem var(--section-px); position: relative; overflow: hidden; }
  .section-label {
    display: inline-flex; align-items: center; gap: 1rem;
    font-family: var(--font-mono); font-size: .72rem; color: var(--accent);
    letter-spacing: .25em; text-transform: uppercase; margin-bottom: 1.75rem;
  }
  .section-label::before { content:''; display: block; width: 28px; height: 1px; background: var(--accent); }
  .section-title { font-family: var(--font-display); font-size: clamp(3.5rem,7vw,6.5rem); line-height: .93; letter-spacing: .025em; margin-bottom: 3.5rem; }
  .accent { color: var(--accent); }

  /* ── Hero ── */
  #hero { min-height: 100vh; display: flex; align-items: center; padding-top: calc(var(--nav-h) + 2rem); }
  .hero-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .12; will-change: transform; animation: orb-drift 10s ease-in-out infinite; }
  .orb-1 { width: 700px; height: 700px; background: var(--accent); top: -250px; right: -150px; animation-delay: 0s; }
  .orb-2 { width: 450px; height: 450px; background: var(--accent2); bottom: -100px; left: 25%; animation-delay: -4s; }
  .orb-3 { width: 320px; height: 320px; background: var(--accent); top: 45%; left: -120px; animation-delay: -7s; }
  @keyframes orb-drift { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-28px) scale(1.06); } }
  .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px); background-size: 64px 64px; }
  .hero-content { position: relative; z-index: 2; max-width: 860px; }
  .hero-badge { display: inline-flex; align-items: center; gap: .6rem; font-family: var(--font-mono); font-size: .72rem; color: var(--accent); letter-spacing: .12em; text-transform: uppercase; border: 1px solid rgba(0,255,136,.28); padding: .4rem 1.1rem; border-radius: 100px; margin-bottom: 2rem; animation: fade-in-down .7s ease both; }
  .hero-badge .dot { width: 7px; height: 7px; background: var(--accent); border-radius: 50%; animation: pulse-dot 2s ease infinite; }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.7); } }
  .hero-name { font-family: var(--font-display); font-size: clamp(5.5rem,15vw,13rem); line-height: .88; letter-spacing: .015em; margin-bottom: .75rem; animation: fade-in-up .75s ease .15s both; }
  .hero-role-line { display: flex; align-items: center; gap: .6rem; height: 2rem; margin-bottom: 2rem; animation: fade-in-up .75s ease .28s both; }
  .hero-role { font-family: var(--font-heading); font-size: clamp(1rem,2.2vw,1.35rem); font-weight: 400; font-style: italic; color: var(--muted); }
  #typed-text { color: var(--accent); font-style: normal; font-weight: 600; }
  .cursor-blink { display: inline-block; width: 2px; height: 1.1em; background: var(--accent); vertical-align: middle; margin-left: 2px; animation: blink 1.1s step-end infinite; }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  .hero-desc { max-width: 500px; font-size: .975rem; color: var(--muted); line-height: 1.9; margin-bottom: 2.75rem; animation: fade-in-up .75s ease .42s both; }
  .hero-desc strong { color: var(--text); font-weight: 500; }
  .hero-cta { display: flex; gap: .85rem; flex-wrap: wrap; animation: fade-in-up .75s ease .55s both; }
  .hero-stats { position: absolute; right: var(--section-px); bottom: 5.5rem; z-index: 2; display: flex; flex-direction: column; align-items: flex-end; gap: 2.25rem; animation: fade-in-right .75s ease .8s both; }
  .hero-stat .num { font-family: var(--font-display); font-size: 2.8rem; color: var(--accent); line-height: 1; }
  .hero-stat .lbl { font-family: var(--font-mono); font-size: .62rem; color: var(--muted); letter-spacing: .18em; text-transform: uppercase; }
  .scroll-hint { position: absolute; bottom: 2.25rem; left: var(--section-px); z-index: 2; display: flex; align-items: center; gap: .8rem; font-family: var(--font-mono); font-size: .68rem; color: var(--muted); letter-spacing: .18em; text-transform: uppercase; animation: fade-in 1s ease 1.1s both; }
  .scroll-hint-line { width: 44px; height: 1px; background: var(--muted); position: relative; overflow: hidden; }
  .scroll-hint-line::after { content:''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: var(--accent); animation: line-sweep 2.4s ease infinite; }
  @keyframes line-sweep { 0% { left:-100%; } 100% { left:100%; } }
  @keyframes fade-in-down { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:none; } }
  @keyframes fade-in-up   { from { opacity:0; transform:translateY(28px);  } to { opacity:1; transform:none; } }
  @keyframes fade-in-right{ from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:none; } }
  @keyframes fade-in       { from { opacity:0; } to { opacity:1; } }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; gap: .5rem; padding: .8rem 1.65rem; font-family: var(--font-mono); font-size: .74rem; letter-spacing: .14em; text-transform: uppercase; border-radius: 4px; cursor: none; position: relative; overflow: hidden; transition: all .3s; }
  .btn svg { flex-shrink: 0; }
  .btn::before { content:''; position: absolute; inset: 0; background: rgba(255,255,255,.06); transform: translateX(-100%); transition: transform .35s; }
  .btn:hover::before { transform: translateX(0); }
  .btn-primary { background: var(--accent); color: #000; font-weight: 600; }
  .btn-primary:hover { box-shadow: 0 0 28px rgba(0,255,136,.35); }
  .btn-ghost { border: 1px solid var(--border); color: var(--muted); }
  .btn-ghost:hover { border-color: rgba(0,255,136,.4); color: var(--accent); }

  /* ── About ── */
  #about { display: grid; grid-template-columns: 1fr 1fr; gap: 7rem; align-items: start; }
  .about-body p { font-size: .975rem; color: var(--muted); line-height: 1.95; margin-bottom: 1.25rem; }
  .about-body p a { color: var(--accent); border-bottom: 1px solid rgba(0,255,136,.25); transition: border-color .3s; }
  .about-body p a:hover { border-color: var(--accent); }
  .stack { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .stack-row { display: flex; flex-direction: column; gap: .5rem; }
  .stack-label { font-family: var(--font-mono); font-size: .66rem; color: var(--accent); letter-spacing: .22em; text-transform: uppercase; }
  .stack-tags { display: flex; flex-wrap: wrap; gap: .45rem; }
  .stag { font-family: var(--font-mono); font-size: .72rem; padding: .3rem .8rem; border: 1px solid var(--border); border-radius: 3px; color: var(--text); background: var(--bg3); transition: all .25s; }
  .stag:hover { border-color: rgba(0,255,136,.35); color: var(--accent); transform: translateY(-2px); }
  .about-card-wrap { perspective: 900px; }
  .about-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 2.75rem; transform-style: preserve-3d; transition: transform .5s ease; position: relative; overflow: hidden; }
  .about-card::before { content:''; position: absolute; inset: 0; background: radial-gradient(circle at 35% 25%,rgba(0,255,136,.04),transparent 55%); pointer-events: none; }
  .card-metric { margin-bottom: 1.75rem; }
  .card-metric .m-num { font-family: var(--font-display); font-size: 4rem; color: var(--accent); line-height: 1; }
  .card-metric .m-lbl { font-family: var(--font-mono); font-size: .68rem; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; margin-top: .2rem; }
  .card-divider { height: 1px; background: var(--border); margin: 1.25rem 0; }

  /* ── Experience ── */
  #experience { background: var(--bg2); }
  .exp-list { display: flex; flex-direction: column; }
  .exp-item { display: grid; grid-template-columns: 220px 1fr; gap: 3rem; padding: 3rem 0; border-bottom: 1px solid var(--border); position: relative; }
  .exp-item::before { content:''; position: absolute; left: 220px; top: 3.6rem; width: 10px; height: 10px; border-radius: 50%; background: var(--bg2); border: 2px solid var(--muted); transform: translateX(-50%); z-index: 2; transition: background .3s, border-color .3s, box-shadow .3s; }
  .exp-item:hover::before { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 14px rgba(0,255,136,.5); }
  .exp-meta .co { font-family: var(--font-mono); font-size: .72rem; color: var(--accent); letter-spacing: .12em; text-transform: uppercase; margin-bottom: .3rem; }
  .exp-meta .period { font-family: var(--font-mono); font-size: .68rem; color: var(--muted); }
  .exp-body .role { font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; margin-bottom: 1rem; }
  .exp-body ul { display: flex; flex-direction: column; gap: .6rem; }
  .exp-body ul li { font-size: .885rem; color: var(--muted); padding-left: 1.35rem; position: relative; line-height: 1.75; }
  .exp-body ul li::before { content:'▸'; position: absolute; left: 0; color: var(--accent); font-size: .7rem; top: .18em; }
  .exp-body ul li strong { color: var(--accent); font-weight: 500; }

  /* ── Projects ── */
  .proj-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.25rem; }
  .proj-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 2rem; position: relative; overflow: hidden; transition: border-color .35s, box-shadow .35s, transform .4s cubic-bezier(.23,1,.32,1); cursor: none; transform-style: preserve-3d; }
  .proj-card::before { content:''; position: absolute; inset: 0; background: radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(0,255,136,.07),transparent 55%); opacity: 0; transition: opacity .4s; pointer-events: none; }
  .proj-card:hover::before { opacity: 1; }
  .proj-card:hover { border-color: rgba(0,255,136,.18); box-shadow: 0 22px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(0,255,136,.08); }
  .proj-card.featured { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center; }
  .proj-ghost-num { font-family: var(--font-display); font-size: 6rem; color: rgba(255,255,255,.03); line-height: 1; position: absolute; top: .75rem; right: 1.5rem; pointer-events: none; }
  .proj-date { font-family: var(--font-mono); font-size: .68rem; color: var(--accent); letter-spacing: .18em; text-transform: uppercase; margin-bottom: .85rem; }
  .proj-title { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; margin-bottom: .75rem; line-height: 1.35; }
  .proj-desc { font-size: .865rem; color: var(--muted); line-height: 1.78; margin-bottom: 1.4rem; }
  .proj-tags { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1.4rem; }
  .ptag { font-family: var(--font-mono); font-size: .66rem; padding: .2rem .65rem; background: var(--accent-dim); border: 1px solid rgba(0,255,136,.2); border-radius: 3px; color: var(--accent); }
  .proj-link { display: inline-flex; align-items: center; gap: .45rem; font-family: var(--font-mono); font-size: .7rem; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; transition: color .3s; }
  .proj-link svg { width: 11px; transition: transform .3s; }
  .proj-link:hover { color: var(--accent); }
  .proj-link:hover svg { transform: translate(3px,-3px); }
  .proj-terminal { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 1.5rem; font-family: var(--font-mono); font-size: .74rem; color: var(--muted); line-height: 2.1; }
  .proj-terminal .t-header { display: flex; gap: .4rem; margin-bottom: 1rem; }
  .t-dot { width: 10px; height: 10px; border-radius: 50%; }
  .t-dot.r { background: #ff5f57; } .t-dot.y { background: #ffbd2e; } .t-dot.g { background: #28c840; }
  .t-pass { color: #00ff88; } .t-fail { color: #ff6b6b; } .t-hi { color: var(--text); }

  /* ── Skills ── */
  #skills { background: var(--bg2); }
  .skills-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 4rem; }
  .skill-row { margin-bottom: 1.85rem; }
  .skill-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .55rem; }
  .skill-name { font-family: var(--font-mono); font-size: .76rem; letter-spacing: .14em; text-transform: uppercase; color: var(--text); }
  .skill-pct { font-family: var(--font-mono); font-size: .7rem; color: var(--accent); }
  .skill-bar-bg { height: 2px; background: rgba(255,255,255,.05); border-radius: 2px; overflow: hidden; }
  .skill-bar-fill { height: 100%; width: 0; border-radius: 2px; background: linear-gradient(90deg,var(--accent),var(--accent2)); transition: width 1.3s cubic-bezier(.25,.46,.45,.94); }

  /* ── Publications ── */
  .pub-card { display: grid; grid-template-columns: 56px 1fr; gap: 2rem; align-items: start; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 2.5rem; max-width: 900px; transition: border-color .3s, transform .3s; }
  .pub-card:hover { border-color: rgba(0,255,136,.2); transform: translateX(8px); }
  .pub-icon-wrap { width: 52px; height: 52px; background: var(--accent-dim); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .pub-icon-wrap svg { width: 22px; color: var(--accent); }
  .pub-meta-label { font-family: var(--font-mono); font-size: .68rem; color: var(--accent); letter-spacing: .14em; text-transform: uppercase; margin-bottom: .5rem; }
  .pub-paper-title { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin-bottom: .6rem; line-height: 1.4; }
  .pub-venue { font-size: .875rem; color: var(--muted); line-height: 1.7; }

  /* ── Certifications ── */
  #certifications { background: var(--bg2); }
  .cert-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.1rem; }
  .cert-card { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 1.75rem; position: relative; overflow: hidden; transition: border-color .3s, transform .3s; }
  .cert-card::after { content:''; position: absolute; bottom: 0; left: 0; height: 2px; width: 0; background: linear-gradient(90deg,var(--accent),var(--accent2)); transition: width .4s; }
  .cert-card:hover { border-color: rgba(0,255,136,.12); transform: translateY(-4px); }
  .cert-card:hover::after { width: 100%; }
  .cert-icon-wrap { width: 38px; height: 38px; background: var(--accent-dim); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.1rem; }
  .cert-icon-wrap svg { width: 17px; color: var(--accent); }
  .cert-name { font-family: var(--font-heading); font-weight: 600; font-size: .9rem; margin-bottom: .3rem; line-height: 1.4; }
  .cert-issuer { font-family: var(--font-mono); font-size: .68rem; color: var(--muted); letter-spacing: .08em; }

  /* ── Contact ── */
  #contact { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .contact-headline { font-family: var(--font-display); font-size: clamp(4rem,11vw,9rem); line-height: .92; letter-spacing: .02em; margin-bottom: 1.5rem; }
  .contact-sub { max-width: 440px; font-size: .965rem; color: var(--muted); line-height: 1.85; margin-bottom: 2.75rem; }
  .contact-cta { display: flex; gap: .85rem; flex-wrap: wrap; justify-content: center; margin-bottom: 3.5rem; }
  .contact-details { display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; }
  .cd-item { display: flex; align-items: center; gap: .55rem; font-family: var(--font-mono); font-size: .76rem; color: var(--muted); transition: color .3s; }
  .cd-item svg { width: 13px; flex-shrink: 0; }
  .cd-item:hover { color: var(--accent); }

  /* ── Footer ── */
  footer { border-top: 1px solid var(--border); padding: 1.75rem var(--section-px); display: flex; align-items: center; justify-content: space-between; }
  footer p { font-family: var(--font-mono); font-size: .7rem; color: var(--muted); letter-spacing: .08em; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    :root { --section-px: 3rem; }
    #about { grid-template-columns: 1fr; gap: 3rem; }
    .about-card-wrap { display: none; }
    .proj-card.featured { grid-column: span 1; grid-template-columns: 1fr; }
    .cert-grid { grid-template-columns: repeat(2,1fr); }
    .hero-stats { display: none; }
  }
  @media (max-width: 768px) {
    :root { --section-px: 1.5rem; }
    .nav-links { display: none; }
    section { padding: 5rem var(--section-px); }
    .exp-item { grid-template-columns: 1fr; gap: .75rem; }
    .exp-item::before { display: none; }
    .proj-grid, .skills-cols, .cert-grid { grid-template-columns: 1fr; }
    .proj-card.featured { grid-column: span 1; grid-template-columns: 1fr; }
    .contact-details { flex-direction: column; align-items: center; }
    footer { flex-direction: column; gap: .5rem; text-align: center; }
  }
`;

/* ================================================================
   PORTFOLIO DATA  — all corrections from resume / LinkedIn / GitHub
   ================================================================ */
const TYPED_ROLES = ['Data Engineer', 'ML Engineer', 'AI Systems Builder', 'Full-Stack Developer'];

const NAV_LINKS = ['about', 'experience', 'projects', 'certifications', 'contact'];

const HERO_STATS = [
  { num: '3+',   lbl: 'Internships' },
  { num: '1',    lbl: 'IEEE Paper'  },
  { num: '3.43', lbl: 'CGPA / 4.0' },
];

const STACK = [
  { label: 'Languages',       tags: ['Python', 'SQL', 'JavaScript'] },
  { label: 'Data & Streaming',tags: ['Apache Kafka', 'PySpark', 'ARIMA', 'scikit-learn', 'LangChain'] },
  { label: 'Backend & DB',    tags: ['Flask', 'Node.js', 'PostgreSQL', 'MongoDB', 'REST APIs'] },
  { label: 'Cloud & Tools',   tags: ['AWS', 'Git', 'Tableau', 'Power BI'] },
];

const ABOUT_METRICS = [
  { num: '60%',   lbl: 'Manual triage reduction · Vi' },
  { num: '82%',   lbl: 'Forecast accuracy · Reliance Retail' },
  { num: '200K+', lbl: 'Records engineered · Rallis India' },
  { num: 'IEEE',  lbl: 'Published researcher · ICCCNT 2024' },
];

// FIX: Reliance period was "2024" in original — corrected to Jun 2025–Jul 2025 (per LinkedIn)
// FIX: Rallis period was "2023" — corrected to May 2024–Jul 2024 (per LinkedIn)
// FIX: Vi bullets expanded with quantified metrics from resume
const EXPERIENCE = [
  {
    company: 'Vodafone Idea (Vi)',
    period: 'Jan 2026 — Apr 2026',
    role: 'Techno-Functional Analyst Intern',
    bullets: [
      'Architected <strong>iRoam Assist</strong>, an automated international roaming complaint diagnosis system processing 1,000+ simulated events with <strong>90% automated coverage</strong>.',
      'Designed a <strong>5-rule SOL engine (SOL101–SOL105)</strong> integrating Apache Kafka streams and PySpark processing pipelines; delivered FRS/SRD documentation under Senior Manager Hareesh Elayath.',
      'Reduced manual triage by <strong>60%</strong> and cut agent handling time from <strong>8 min → 90 sec</strong> by consolidating 5+ diagnosis workflows into a single UI.',
    ],
  },
  {
    company: 'Reliance Retail',
    period: 'Jun 2025 — Jul 2025',   // ← FIXED (was "2024")
    role: 'Data Science Intern',
    bullets: [
      'Forecasted spare-parts demand with <strong>82% accuracy</strong> using ARIMA + ML ensembles, reducing stockouts by 25%.',
      'Built an automated KPI scorecard evaluating <strong>50+ service centers</strong>, slashing management reporting TAT by 30%.',
    ],
  },
  {
    company: 'Rallis India / Tata Group',
    period: 'May 2024 — Jul 2024',   // ← FIXED (was "2023")
    role: 'ML Engineering Intern',
    bullets: [
      'Cleaned, engineered, and preprocessed <strong>200K+ records</strong>, reducing missing data by 40% and improving downstream model performance.',
      'Reduced training time by <strong>35%</strong> through feature engineering and pipeline optimization, achieving 78% validation accuracy.',
    ],
  },
];

// FIX: TSP date was "2024 · IEEE ICCCNT" — IEEE paper is about Prim's/Kruskal's MST, not TSP.
//      TSP project was Jan–Apr 2025 (per LinkedIn).
// FIX: Valuation System date was "2024" — per LinkedIn it ran Aug–Nov 2025.
// FIX: Real Estate date was "2023" — GitHub shows last update Jan 2025.
// FIX: GitHub links filled from actual repos.
const PROJECTS = [
  {
    featured: true,
    date: 'APR 2026 · Vi Capstone',
    title: 'iRoam Assist — Automated Roaming Complaint Diagnosis',
    desc: 'End-to-end automated system diagnosing international roaming complaints via real-time streaming. 5-rule engine with Apache Kafka ingestion, PySpark processing, and a Flask API — achieving 90% automated diagnosis coverage across 1,000 simulated telecom events.',
    tags: ['Apache Kafka', 'PySpark', 'Flask', 'SOL Engine', 'Telecom', 'Real-time'],
    link: 'https://github.com/Archit-Mahajan/Complaint-Automation',
    linkLabel: 'GitHub',
  },
  {
    ghost: '02',
    date: 'Aug — Nov 2025',           // ← FIXED (was "2024")
    title: 'AI-Powered Company Valuation System',
    desc: 'ML-driven valuation engine integrating Random Forest, LSTM, NLP sentiment analysis, DCF, and Comparable Company Analysis. Engineered risk-adjusted modeling reducing valuation variance by 40% vs traditional methods.',
    tags: ['Python', 'ML', 'NLP', 'Finance', 'Flask'],
    link: 'https://github.com/Archit-Mahajan/AI-Powered-Company-Valuation-System',
    linkLabel: 'GitHub',
  },
  {
    ghost: '03',
    date: 'Jan — Apr 2025',           // ← FIXED (was "2024 · IEEE ICCCNT")
    title: 'TSP Solver — Reinforcement Learning + Genetic Algorithm',
    desc: 'Hybrid RL + GA approach combining Q-Learning and Genetic Algorithms on 214 Indian cities with dynamic traffic simulation. Achieved faster convergence and adaptive route optimization over standalone solvers.',
    tags: ['Python', 'Reinforcement Learning', 'Genetic Algorithm', 'Optimization'],
    link: 'https://github.com/Archit-Mahajan/RL-GA-HYBRID-RM',
    linkLabel: 'GitHub',
  },
  {
    ghost: '04',
    date: 'Jan 2025',                 // ← FIXED (was "2023")
    title: 'Real Estate Marketplace',
    desc: 'Full-stack real estate platform on the MERN stack with property listings, advanced search, JWT + Google OAuth authentication, image uploads, and an admin dashboard for property management.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js', 'JWT', 'Tailwind CSS'],
    link: 'https://github.com/Archit-Mahajan/ESTATE-MARKETPLACE',
    linkLabel: 'GitHub',
  },
];

const SKILLS_LEFT = [
  { name: 'Python',           pct: 90 },
  { name: 'SQL',              pct: 85 },
  { name: 'Machine Learning', pct: 80 },
  { name: 'Apache Kafka',     pct: 70 },
  { name: 'PySpark',          pct: 65 },
];
const SKILLS_RIGHT = [
  { name: 'Flask / FastAPI',    pct: 72 },
  { name: 'Data Visualization', pct: 78 },
  { name: 'AWS',                pct: 68 },
  { name: 'LangChain / RAG',    pct: 60 },
  { name: 'React / MERN',       pct: 65 },
];

const CERTS = [
  {
    name: 'AWS Academy Cloud Architecting',
    issuer: 'Amazon Web Services · Nov 2025',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    name: 'Generative AI Prompt Engineering',
    issuer: 'IBM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    name: 'SQL Intermediate',
    issuer: 'HackerRank · Jan 2026',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
];

/* ================================================================
   TINY SVG ICONS
   ================================================================ */
const IcoEmail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/>
  </svg>
);
const IcoGithub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);
const IcoLinkedin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const IcoDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IcoPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IcoArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
);
const IcoPub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Portfolio() {
  const [typedText, setTypedText]     = useState('');
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Cursor refs — updated imperatively to avoid expensive re-renders
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);
  const mouseRef  = useRef({ x: -100, y: -100 });
  const ringPos   = useRef({ x: -100, y: -100 });
  const rafRef    = useRef(null);

  /* ── Inject Google Fonts + global CSS once ── */
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    document.body.style.cursor = 'none';

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
      document.body.style.cursor = '';
    };
  }, []);

  /* ── Typed text ── */
  useEffect(() => {
    let ri = 0, ci = 0, deleting = false, timer;
    function tick() {
      const word = TYPED_ROLES[ri];
      setTypedText(word.slice(0, ci));
      if (!deleting) {
        if (ci < word.length) { ci++; timer = setTimeout(tick, 88); }
        else { deleting = true; timer = setTimeout(tick, 1800); }
      } else {
        if (ci > 0) { ci--; timer = setTimeout(tick, 46); }
        else { deleting = false; ri = (ri + 1) % TYPED_ROLES.length; timer = setTimeout(tick, 480); }
      }
    }
    tick();
    return () => clearTimeout(timer);
  }, []);

  /* ── Custom cursor (imperatively update DOM) ── */
  useEffect(() => {
    function onMove(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top  = e.clientY + 'px';
      }
    }
    document.addEventListener('mousemove', onMove);

    function animRing() {
      const rx = ringPos.current.x + (mouseRef.current.x - ringPos.current.x) * 0.1;
      const ry = ringPos.current.y + (mouseRef.current.y - ringPos.current.y) * 0.1;
      ringPos.current = { x: rx, y: ry };
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px';
        ringRef.current.style.top  = ry + 'px';
      }
      rafRef.current = requestAnimationFrame(animRing);
    }
    rafRef.current = requestAnimationFrame(animRing);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Scroll: nav state + active section ── */
  useEffect(() => {
    function onScroll() {
      setNavScrolled(window.scrollY > 60);
      let cur = '';
      document.querySelectorAll('section[id]').forEach(s => {
        if (window.scrollY >= s.offsetTop - 180) cur = s.id;
      });
      setActiveSection(cur);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Skill bar animation ── */
  useEffect(() => {
    const wrap = document.getElementById('skillsWrap');
    if (!wrap) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 250);
        });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  /* ── 3D tilt — about card ── */
  useEffect(() => {
    const card = document.getElementById('aboutCard');
    if (!card) return;
    const wrap = card.parentElement;
    const onMove = e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x*14}deg) rotateX(${-y*14}deg) translateZ(24px)`;
    };
    const onLeave = () => { card.style.transform = ''; };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => { wrap.removeEventListener('mousemove', onMove); wrap.removeEventListener('mouseleave', onLeave); };
  }, []);

  /* ── 3D tilt — project cards ── */
  useEffect(() => {
    const handlers = [];
    document.querySelectorAll('.proj-card[data-tilt]').forEach(card => {
      const onMove = e => {
        const r  = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top)  / r.height;
        card.style.transform = `perspective(900px) rotateX(${(ny-.5)*-9}deg) rotateY(${(nx-.5)*9}deg) translateY(-4px)`;
        card.style.setProperty('--mx', nx * 100 + '%');
        card.style.setProperty('--my', ny * 100 + '%');
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      handlers.push({ card, onMove, onLeave });
    });
    return () => handlers.forEach(({ card, onMove, onLeave }) => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    });
  }, []);

  /* ── Helpers ── */
  const scrollTo = useCallback((id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const hoverOn  = () => ringRef.current && ringRef.current.classList.add('hovered');
  const hoverOff = () => ringRef.current && ringRef.current.classList.remove('hovered');
  const h = { onMouseEnter: hoverOn, onMouseLeave: hoverOff };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <>
      {/* ── Custom Cursor ── */}
      <div id="cursor-dot" ref={dotRef} style={{ position:'fixed', pointerEvents:'none', zIndex:9999 }} />
      <div id="cursor-ring" ref={ringRef} style={{ position:'fixed', pointerEvents:'none', zIndex:9998 }} />

      {/* ── Navigation ── */}
      <nav id="navbar" className={navScrolled ? 'scrolled' : ''}>
        <div className="nav-logo">AM // PORTFOLIO</div>
        <ul className="nav-links">
          {NAV_LINKS.map(id => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={activeSection === id ? 'active' : ''}
                onClick={e => { e.preventDefault(); scrollTo(`#${id}`); }}
                {...h}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ================================================================
          HERO
          ================================================================ */}
      <section id="hero">
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-badge"><div className="dot" />Available for full-time roles</div>

          <h1 className="hero-name">
            Archit<br />
            <span className="accent">Mahajan</span>
          </h1>

          <div className="hero-role-line">
            <span className="hero-role">
              <span id="typed-text">{typedText}</span>
              <span className="cursor-blink" />
            </span>
          </div>

          <p className="hero-desc">
            Building intelligent data pipelines and AI systems at the intersection of machine
            learning and scalable infrastructure. B.Tech Computer Engineering @ NMIMS Navi Mumbai
            (2026). Former intern at{' '}
            <strong>Vodafone Idea</strong>, <strong>Reliance Retail</strong> &amp;{' '}
            <strong>Tata Group</strong>.
          </p>

          <div className="hero-cta">
            <a href="mailto:archit.maha@gmail.com" className="btn btn-primary" {...h}>
              <IcoEmail /> Get In Touch
            </a>
            <a href="https://github.com/Archit-Mahajan" target="_blank" rel="noopener" className="btn btn-ghost" {...h}>
              <IcoGithub /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/archittmahajan" target="_blank" rel="noopener" className="btn btn-ghost" {...h}>
              <IcoLinkedin /> LinkedIn
            </a>
            <a href="https://drive.google.com/file/d/1xUm6Wdkalh1bS2KvQB5elRC40qo9UEvY/view?usp=sharing" target="_blank" rel="noopener" className="btn btn-ghost" {...h}>
              <IcoDownload /> Resume
            </a>
          </div>
        </div>

        <div className="hero-stats">
          {HERO_STATS.map(({ num, lbl }) => (
            <div className="hero-stat" key={lbl}>
              <div className="num">{num}</div>
              <div className="lbl">{lbl}</div>
            </div>
          ))}
        </div>

        <div className="scroll-hint">
          <div className="scroll-hint-line" />
          Scroll to explore
        </div>
      </section>

      {/* ================================================================
          ABOUT
          ================================================================ */}
      <section id="about">
        <div className="about-body">
          <div className="section-label reveal">About Me</div>
          <h2 className="section-title reveal delay-1">
            Engineering<br />Intelligence<br /><span className="accent">Into Data</span>
          </h2>
          <p className="reveal delay-2">
            I'm a <a href="https://nmims.edu" target="_blank" rel="noopener">Computer Engineering graduate</a> from
            NMIMS Navi Mumbai (Batch of 2026) specialising in Data Engineering, ML Engineering, and applied AI.
            I build production-ready intelligent pipelines that turn raw data into measurable business impact.
          </p>
          <p className="reveal delay-3">
            At <a href="#experience">Vodafone Idea</a>, I architected <strong style={{color:'var(--text)'}}>iRoam
            Assist</strong> — an automated international roaming complaint diagnosis system using Apache Kafka,
            PySpark, and a 5-rule SOL engine that reduced manual triage by 60%. At{' '}
            <a href="#experience">Reliance Retail</a>, I built demand forecasting models with 82% accuracy using
            ARIMA and ML ensembles, directly informing supply chain decisions.
          </p>
          <p className="reveal delay-4">
            My work sits at the intersection of <a href="#projects">real-time data infrastructure</a> and applied
            ML — I care deeply about the algorithm and the pipeline beneath it. Published IEEE researcher.
            Open to full-time DE / ML / AI Engineering roles.
          </p>

          <div className="stack reveal delay-5">
            {STACK.map(({ label, tags }) => (
              <div className="stack-row" key={label}>
                <div className="stack-label">{label}</div>
                <div className="stack-tags">
                  {tags.map(t => <span className="stag" key={t} {...h}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D stat card */}
        <div className="about-card-wrap reveal delay-2">
          <div className="about-card" id="aboutCard">
            {ABOUT_METRICS.map(({ num, lbl }, i) => (
              <div key={lbl}>
                {i > 0 && <div className="card-divider" />}
                <div className="card-metric">
                  <div className="m-num">{num}</div>
                  <div className="m-lbl">{lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          EXPERIENCE
          ================================================================ */}
      <section id="experience">
        <div className="section-label reveal">Experience</div>
        <h2 className="section-title reveal delay-1">
          Where I've<br /><span className="accent">Created Impact</span>
        </h2>

        <div className="exp-list">
          {EXPERIENCE.map(({ company, period, role, bullets }, idx) => (
            <div className={`exp-item reveal${idx > 0 ? ` delay-${idx}` : ''}`} key={company}>
              <div className="exp-meta">
                <div className="co">{company}</div>
                <div className="period">{period}</div>
              </div>
              <div className="exp-body">
                <div className="role">{role}</div>
                <ul>
                  {bullets.map((b, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          PROJECTS
          ================================================================ */}
      <section id="projects">
        <div className="section-label reveal">Projects</div>
        <h2 className="section-title reveal delay-1">
          Things I've<br /><span className="accent">Built</span>
        </h2>

        <div className="proj-grid">
          {/* Featured card */}
          <div className="proj-card featured reveal">
            <div>
              <div className="proj-date">{PROJECTS[0].date}</div>
              <h3 className="proj-title">{PROJECTS[0].title}</h3>
              <p className="proj-desc">{PROJECTS[0].desc}</p>
              <div className="proj-tags">
                {PROJECTS[0].tags.map(t => <span className="ptag" key={t}>{t}</span>)}
              </div>
              <a href={PROJECTS[0].link} target="_blank" rel="noopener" className="proj-link" {...h}>
                {PROJECTS[0].linkLabel} <IcoArrow />
              </a>
            </div>
            {/* Decorative terminal */}
            <div className="proj-terminal">
              <div className="t-header">
                <div className="t-dot r" /><div className="t-dot y" /><div className="t-dot g" />
              </div>
              <div>▸ <span className="t-hi">iRoamAssist</span> v1.0 — SOL Engine</div>
              <div>&nbsp;</div>
              <div>SOL101 IREG_SIGNAL <span className="t-pass">✓ PASS</span></div>
              <div>SOL102 TAP_RECORD  <span className="t-pass">✓ PASS</span></div>
              <div>SOL103 CDR_MATCH   <span className="t-pass">✓ PASS</span></div>
              <div>SOL104 BILL_SYNC   <span className="t-pass">✓ PASS</span></div>
              <div>SOL105 ROAM_BAR    <span className="t-fail">⚠ FLAG</span></div>
              <div>&nbsp;</div>
              <div>Diagnosis: <span className="t-pass">AUTOMATED</span></div>
              <div>Coverage : <span className="t-pass">90%</span> / 1,000 events</div>
            </div>
          </div>

          {/* Regular cards */}
          {PROJECTS.slice(1).map((p, i) => (
            <div className={`proj-card reveal delay-${i + 1}`} data-tilt key={p.title}>
              {p.ghost && <div className="proj-ghost-num">{p.ghost}</div>}
              <div className="proj-date">{p.date}</div>
              <h3 className="proj-title">{p.title}</h3>
              <p className="proj-desc">{p.desc}</p>
              <div className="proj-tags">
                {p.tags.map(t => <span className="ptag" key={t}>{t}</span>)}
              </div>
              <a href={p.link} target="_blank" rel="noopener" className="proj-link" {...h}>
                {p.linkLabel} <IcoArrow />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SKILLS
          ================================================================ */}
      <section id="skills">
        <div className="section-label reveal">Technical Skills</div>
        <h2 className="section-title reveal delay-1">My<br /><span className="accent">Toolbox</span></h2>

        <div className="skills-cols" id="skillsWrap">
          <div>
            {SKILLS_LEFT.map(({ name, pct }, i) => (
              <div className={`skill-row reveal${i ? ` delay-${i}` : ''}`} key={name}>
                <div className="skill-head">
                  <span className="skill-name">{name}</span>
                  <span className="skill-pct">{pct}%</span>
                </div>
                <div className="skill-bar-bg">
                  <div className="skill-bar-fill" data-pct={pct} />
                </div>
              </div>
            ))}
          </div>
          <div>
            {SKILLS_RIGHT.map(({ name, pct }, i) => (
              <div className={`skill-row reveal${i ? ` delay-${i}` : ''}`} key={name}>
                <div className="skill-head">
                  <span className="skill-name">{name}</span>
                  <span className="skill-pct">{pct}%</span>
                </div>
                <div className="skill-bar-bg">
                  <div className="skill-bar-fill" data-pct={pct} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          PUBLICATIONS
          ================================================================ */}
      <section id="publications">
        <div className="section-label reveal">Research</div>
        <h2 className="section-title reveal delay-1">Published<br /><span className="accent">Work</span></h2>

        <div className="pub-card reveal delay-2" {...h}>
          <div className="pub-icon-wrap"><IcoPub /></div>
          <div>
            <div className="pub-meta-label">IEEE · ICCCNT 2024</div>
            <h3 className="pub-paper-title">
              Exploring the Maze: A Comparative Study of Prim's and Kruskal's MST Algorithms
            </h3>
            <p className="pub-venue">
              Peer-reviewed research benchmarking Prim's and Kruskal's MST algorithms across varying
              network sizes and topologies. Analysed time complexity, edge-density sensitivity, and
              practical performance at scale. Accepted and presented at IEEE ICCCNT 2024
              (15th International Conference on Computing, Communication and Networking Technologies).
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          CERTIFICATIONS
          ================================================================ */}
      <section id="certifications">
        <div className="section-label reveal">Credentials</div>
        <h2 className="section-title reveal delay-1">Continuous<br /><span className="accent">Learning</span></h2>

        <div className="cert-grid">
          {CERTS.map(({ name, issuer, icon }, i) => (
            <div className={`cert-card reveal${i ? ` delay-${i}` : ''}`} key={name} {...h}>
              <div className="cert-icon-wrap">{icon}</div>
              <div className="cert-name">{name}</div>
              <div className="cert-issuer">{issuer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CONTACT
          ================================================================ */}
      <section id="contact">
        <div className="section-label reveal" style={{ justifyContent: 'center' }}>Contact</div>
        <h2 className="contact-headline reveal delay-1">
          Let's Build<br />Something<br /><span className="accent">Together</span>
        </h2>
        <p className="contact-sub reveal delay-2">
          Open to full-time roles in Data Engineering, ML Engineering &amp; AI Engineering
          at product-based companies. Remote preferred, open to hybrid.
        </p>

        <div className="contact-cta reveal delay-3">
          <a href="mailto:archit.maha@gmail.com" className="btn btn-primary" {...h}>
            <IcoEmail /> Send Email
          </a>
          <a href="https://www.linkedin.com/in/archittmahajan/" target="_blank" rel="noopener" className="btn btn-ghost" {...h}>
            <IcoLinkedin /> LinkedIn
          </a>
          <a href="https://github.com/Archit-Mahajan" target="_blank" rel="noopener" className="btn btn-ghost" {...h}>
            <IcoGithub /> GitHub
          </a>
        </div>

        <div className="contact-details reveal delay-4">
          <a href="mailto:archit.maha@gmail.com" className="cd-item" {...h}>
            <IcoEmail /> archit.maha@gmail.com
          </a>
          <a href="tel:+919326674717" className="cd-item" {...h}>
            <IcoPhone /> +91 9326674717
          </a>
          <a href="https://www.linkedin.com/in/archittmahajan/" target="_blank" rel="noopener" className="cd-item" {...h}>
            <IcoLinkedin /> LinkedIn
          </a>
          <a href="https://github.com/Archit-Mahajan" target="_blank" rel="noopener" className="cd-item" {...h}>
            <IcoGithub /> GitHub
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <p>© 2026 Archit Mahajan. All rights reserved.</p>
        <p>Designed &amp; Built by Archit · Belapur, Navi Mumbai</p>
      </footer>
    </>
  );
}
