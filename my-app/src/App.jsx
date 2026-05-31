import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

// ─────────────────────────────────────────────────────────
//  EmailJS config — replace with your actual values
//  Dashboard: https://dashboard.emailjs.com
// ─────────────────────────────────────────────────────────
const EJS_SERVICE_ID  = "service_ns66bdr";
const EJS_TEMPLATE_ID = "template_dxhsnrl";
const EJS_PUBLIC_KEY  = "9Tom_kyWO2FxfWu4G";

const NAV_LINKS = ["About", "Skills", "Projects", "Experience", "Contact"];

const SKILLS = [
  { category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Next.js"] },
  { category: "Backend",  items: ["Node.js", "Python", "Express", "PostgreSQL"] },
  { category: "DevOps",   items: ["AWS EC2", "Docker", "Nginx", "CI/CD"] },
  { category: "Tools",    items: ["Git", "Linux", "VS Code", "Figma"] },
];

const PROJECTS = [
  {
    title: "Cloud Portfolio",
    desc: "This very portfolio deployed on AWS EC2 with Nginx reverse proxy and PM2 process manager.",
    tags: ["React", "AWS EC2", "Nginx", "PM2"],
    accent: "#6C63FF",
  },
  {
    title: "E-Commerce API",
    desc: "RESTful API for a full-stack e-commerce platform with JWT auth, PostgreSQL, and Redis caching.",
    tags: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    accent: "#00BFA6",
  },
  {
    title: "Real-Time Dashboard",
    desc: "Analytics dashboard with WebSocket integration, live charts, and role-based access control.",
    tags: ["React", "WebSockets", "Chart.js", "Express"],
    accent: "#FF6B6B",
  },
];

const EXPERIENCE = [
  {
    role: "Frontend Developer",
    company: "Coronis IT Systems Pvt. Ltd",
    period: "2024 – 2025",
    points: [
      "Designed, developed, and maintained scalable web applications using React.js and modern JavaScript frameworks.",
      "Collaborated with cross-functional teams to deliver responsive, high-performance UIs while integrating backend APIs and cloud-hosted services.",
      "Contributed to deployment workflows, Git-based version control, and application optimization to enhance UX and system reliability.",
    ],
  },
  {
    role: "Frontend Developer Intern",
    company: "Kaashiv Infotech",
    period: "2021 – 2022",
    points: [
      "Built React component library used across 3 products.",
      "Improved Lighthouse score from 62 → 96.",
    ],
  },
];

// ── Intersection-observer hook ──────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Animated section wrapper ────────────────────────────
function Section({ id, children, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <section
      id={id}
      ref={ref}
      className={`section ${visible ? "visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

// ── Main app ────────────────────────────────────────────
export default function App() {
  const [active,   setActive]   = useState("About");
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  // formState: "idle" | "sending" | "sent" | "error"
  const [formState, setFormState] = useState("idle");

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuOpen && !e.target.closest("nav") && !e.target.closest(".mobile-menu")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Active nav tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      NAV_LINKS.forEach((link) => {
        const el = document.getElementById(link.toLowerCase());
        if (!el) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= 120 && bottom >= 120) setActive(link);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // Send email via EmailJS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formState === "sending") return;
    setFormState("sending");

    try {
      // Build a timestamp in IST
      const now = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });

      await emailjs.send(
        EJS_SERVICE_ID,
        EJS_TEMPLATE_ID,
        {
          // Primary keys — match your EmailJS template exactly
          name:       formData.name,
          email:      formData.email,
          message:    formData.message,
          time:       now,
          // Aliases — covered in case template uses these names too
          from_name:  formData.name,
          from_email: formData.email,
          reply_to:   formData.email,
          to_email:   "harishps1219@gmail.com",
        },
        EJS_PUBLIC_KEY
      );
      setFormState("sent");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setFormState("idle"), 5000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setFormState("error");
      setTimeout(() => setFormState("idle"), 5000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');

        /* ── RESET & BASE ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a0a0f;
          --surface: #12121a;
          --card: #1a1a26;
          --border: rgba(255,255,255,0.07);
          --accent: #6C63FF;
          --accent2: #00BFA6;
          --text: #e8e8f0;
          --muted: rgba(232,232,240,0.5);
          --heading: 'Syne', sans-serif;
          --body: 'Inter', sans-serif;
          --nav-h: 60px;
          --px: clamp(1.1rem, 5vw, 6rem);
        }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--body);
          font-weight: 300;
          line-height: 1.7;
          overflow-x: hidden;
        }
        img, svg { max-width: 100%; display: block; }
        button, input, textarea { font-family: inherit; }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--px);
          height: var(--nav-h);
          background: rgba(10,10,15,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }
        .logo {
          font-family: var(--heading);
          font-weight: 800;
          font-size: clamp(0.95rem, 3vw, 1.25rem);
          letter-spacing: -0.03em;
          white-space: nowrap;
        }
        .logo span { color: var(--accent); }
        .nav-links { display: flex; gap: 0.15rem; list-style: none; }
        .nav-links button {
          background: none; border: none; cursor: pointer;
          color: var(--muted);
          font-family: var(--body); font-size: 0.85rem;
          padding: 0.4rem 0.75rem;
          border-radius: 999px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nav-links button:hover      { color: var(--text); background: rgba(255,255,255,0.05); }
        .nav-links button.nav-active { color: var(--text); background: rgba(108,99,255,0.15); }

        /* ── HAMBURGER ── */
        .hamburger {
          display: none;
          background: none; border: 1px solid var(--border);
          border-radius: 8px; cursor: pointer;
          color: var(--text); font-size: 1.2rem;
          width: 38px; height: 38px;
          align-items: center; justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .hamburger:hover { background: rgba(255,255,255,0.07); }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          position: fixed;
          top: var(--nav-h); left: 0; right: 0;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0.75rem 1rem;
          display: flex; flex-direction: column; gap: 0.2rem;
          z-index: 199;
          animation: slideDown 0.18s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu button {
          background: none; border: none;
          color: var(--text); font-size: 0.95rem;
          padding: 0.65rem 1rem;
          text-align: left; cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .mobile-menu button:hover      { background: rgba(255,255,255,0.05); }
        .mobile-menu button.mob-active { color: var(--accent); background: rgba(108,99,255,0.1); }

        /* ── SECTIONS ── */
        .section {
          padding: clamp(4.5rem, 10vw, 8rem) var(--px);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .section.visible { opacity: 1; transform: none; }
        .section-label {
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        h1, h2, h3 { font-family: var(--heading); }
        h2 {
          font-size: clamp(1.75rem, 4vw, 3rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          margin-bottom: 1rem;
        }

        /* ── BLOBS ── */
        .blob {
          position: fixed; border-radius: 50%;
          filter: blur(80px); opacity: 0.13;
          pointer-events: none; z-index: -1;
        }
        .blob1 { width: 520px; height: 520px; background: var(--accent); top: -10%; left: -15%; }
        .blob2 { width: 360px; height: 360px; background: var(--accent2); bottom: 5%; right: -10%; }

        /* ── HERO ── */
        #about {
          min-height: 100svh;
          display: flex; flex-direction: column; justify-content: center;
          padding-top: calc(var(--nav-h) + clamp(2rem, 6vw, 4rem));
          position: relative; overflow: hidden;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
          max-width: 1100px; width: 100%;
        }
        .hero-text  { order: 1; }
        .hero-avatar { order: 2; display: flex; justify-content: center; align-items: center; }
        .hero-name {
          font-size: clamp(2.2rem, 6vw, 5rem);
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1.05;
        }
        .hero-name .line2 { color: var(--accent); }
        .hero-tagline {
          font-size: clamp(0.92rem, 1.5vw, 1.15rem);
          color: var(--muted);
          margin: 1.1rem 0 1.75rem;
          max-width: 440px; line-height: 1.65;
        }
        .btn-group { display: flex; gap: 0.65rem; flex-wrap: wrap; }
        .btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.6rem 1.3rem;
          border-radius: 999px;
          font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: all 0.22s;
          text-decoration: none; border: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn:disabled { cursor: not-allowed; }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-primary:hover:not(:disabled) {
          background: #5a52e0;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(108,99,255,0.35);
        }
        .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
        .btn-outline:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }

        /* ── AVATAR ── */
        .avatar-ring {
          width: clamp(150px, 28vw, 300px);
          height: clamp(150px, 28vw, 300px);
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          padding: 3px; flex-shrink: 0;
        }
        .avatar-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: var(--card);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--heading);
          font-size: clamp(2rem, 5vw, 4.5rem);
          font-weight: 800; color: var(--accent);
          overflow: hidden;
        }
        .avatar-inner img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          border-radius: 50%; display: block;
        }

        /* ── SKILLS ── */
        #skills { min-height: auto; }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem; margin-top: 2rem;
        }
        .skill-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 1.25rem;
          transition: border-color 0.25s, transform 0.25s;
        }
        .skill-card:hover { border-color: var(--accent); transform: translateY(-4px); }
        .skill-cat {
          font-size: 0.68rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--accent2);
          margin-bottom: 0.85rem;
        }
        .skill-tags { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .tag {
          font-size: 0.78rem; padding: 0.28rem 0.7rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.06); color: var(--text);
        }

        /* ── PROJECTS ── */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem; margin-top: 2rem;
        }
        .project-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 1.5rem;
          position: relative; overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
          display: flex; flex-direction: column;
        }
        .project-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px; border-radius: 16px 16px 0 0;
        }
        .project-card:hover { transform: translateY(-5px); box-shadow: 0 18px 44px rgba(0,0,0,0.4); }
        .project-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.55rem; }
        .project-card p  { font-size: 0.865rem; color: var(--muted); line-height: 1.65; margin-bottom: 1.1rem; flex: 1; }
        .project-tags    { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .project-tag {
          font-size: 0.7rem; padding: 0.18rem 0.55rem;
          border-radius: 999px;
          border: 1px solid var(--border); color: var(--muted);
        }

        /* ── EXPERIENCE ── */
        .timeline { margin-top: 2rem; position: relative; }
        .timeline::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, var(--accent), transparent);
        }
        .timeline-item { padding-left: 1.75rem; margin-bottom: 2.25rem; position: relative; }
        .timeline-dot {
          position: absolute; left: -5px; top: 6px;
          width: 11px; height: 11px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px rgba(108,99,255,0.6);
        }
        .timeline-period { font-size: 0.72rem; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 0.3rem; }
        .timeline-role    { font-family: var(--heading); font-size: 1.1rem; font-weight: 700; }
        .timeline-company { font-size: 0.865rem; color: var(--muted); margin-bottom: 0.65rem; }
        .timeline-points  { list-style: none; }
        .timeline-points li {
          font-size: 0.865rem; color: var(--muted);
          padding: 0.18rem 0 0.18rem 1rem; position: relative;
        }
        .timeline-points li::before { content: '→'; position: absolute; left: 0; color: var(--accent2); }

        /* ── CONTACT ── */
        #contact { min-height: auto; }
        .contact-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: start; margin-top: 2rem;
        }
        .contact-info h3  { font-size: 1.4rem; margin-bottom: 0.65rem; }
        .contact-info p   { color: var(--muted); font-size: 0.88rem; line-height: 1.7; }
        .social-links     { display: flex; flex-direction: column; gap: 0.55rem; margin-top: 1.35rem; }
        .social-link {
          display: flex; align-items: center; gap: 0.55rem;
          font-size: 0.85rem; color: var(--muted);
          text-decoration: none; transition: color 0.2s;
          word-break: break-all;
        }
        .social-link:hover { color: var(--accent); }

        /* ── CONTACT FORM ── */
        .contact-form { display: flex; flex-direction: column; gap: 0.9rem; }
        .form-group   { display: flex; flex-direction: column; gap: 0.35rem; }
        .form-group label {
          font-size: 0.72rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--muted);
        }
        .form-group input,
        .form-group textarea {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          color: var(--text); font-size: 0.9rem;
          outline: none; transition: border-color 0.2s;
          resize: vertical; width: 100%;
          -webkit-appearance: none;
        }
        .form-group input:focus,
        .form-group textarea:focus { border-color: var(--accent); }

        /* feedback banners */
        .form-banner {
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          font-size: 0.875rem; text-align: center;
        }
        .form-banner.success {
          background: rgba(0,191,166,0.1);
          border: 1px solid rgba(0,191,166,0.3);
          color: var(--accent2);
        }
        .form-banner.error {
          background: rgba(255,107,107,0.1);
          border: 1px solid rgba(255,107,107,0.3);
          color: #ff6b6b;
        }

        /* ── FOOTER ── */
        footer {
          padding: 1.75rem var(--px);
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.75rem;
          font-size: 0.78rem; color: var(--muted);
        }

        /* ════════════════════════════════════
           RESPONSIVE — TABLET  (≤ 900px)
        ════════════════════════════════════ */
        @media (max-width: 900px) {
          :root { --px: clamp(1.25rem, 5vw, 3rem); }
          .hero-grid      { grid-template-columns: 1fr; }
          .hero-text      { order: 2; text-align: center; }
          .hero-avatar    { order: 1; }
          .hero-tagline   { margin-left: auto; margin-right: auto; }
          .btn-group      { justify-content: center; }
          .contact-wrap   { grid-template-columns: 1fr; }
          .skills-grid    { grid-template-columns: repeat(2, 1fr); }
          .projects-grid  { grid-template-columns: 1fr; }
          .nav-links      { display: none; }
          .hamburger      { display: flex; }
        }

        /* ════════════════════════════════════
           RESPONSIVE — MOBILE  (≤ 540px)
        ════════════════════════════════════ */
        @media (max-width: 540px) {
          :root { --px: 1.1rem; --nav-h: 56px; }
          .section       { padding-top: clamp(3.5rem, 8vw, 5rem); padding-bottom: clamp(3rem, 8vw, 5rem); }
          #about         { padding-top: calc(var(--nav-h) + 2rem); }
          .hero-name     { font-size: clamp(2rem, 11vw, 2.8rem); }
          h2             { font-size: clamp(1.5rem, 7vw, 2.2rem); }
          .avatar-ring   { width: clamp(110px, 38vw, 170px); height: clamp(110px, 38vw, 170px); }
          .btn-group     { flex-direction: column; align-items: center; }
          .btn           { width: 100%; max-width: 240px; justify-content: center; }
          .skills-grid   { grid-template-columns: 1fr; }
          .timeline-item { padding-left: 1.4rem; }
          .social-link   { font-size: 0.78rem; }
          footer         { flex-direction: column; align-items: flex-start; gap: 0.4rem; }
          .blob          { display: none; }
        }

        /* ════════════════════════════════════
           RESPONSIVE — LANDSCAPE PHONES
        ════════════════════════════════════ */
        @media (max-width: 812px) and (orientation: landscape) {
          #about        { min-height: auto; padding-top: calc(var(--nav-h) + 1.5rem); padding-bottom: 3rem; }
          .hero-grid    { grid-template-columns: 1fr 1fr; }
          .hero-text    { order: 1; text-align: left; }
          .hero-avatar  { order: 2; }
          .btn-group    { justify-content: flex-start; }
          .hero-tagline { margin-left: 0; }
        }

        /* ════════════════════════════════════
           TOUCH + ACCESSIBILITY
        ════════════════════════════════════ */
        @media (hover: none) {
          .skill-card:hover,
          .project-card:hover,
          .btn-primary:hover,
          .btn-outline:hover { transform: none; box-shadow: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .section { transition: none; opacity: 1; transform: none; }
          .btn     { transition: none; }
          @keyframes slideDown { from { opacity: 1; transform: none; } }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav>
        <div className="logo">Hariharan<span>.</span>palanivel</div>
        <ul className="nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l}>
              <button
                className={active === l ? "nav-active" : ""}
                onClick={() => scrollTo(l)}
              >
                {l}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" role="navigation" aria-label="Mobile navigation">
          {NAV_LINKS.map((l) => (
            <button
              key={l}
              className={active === l ? "mob-active" : ""}
              onClick={() => scrollTo(l)}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── DECORATIVE BLOBS ── */}
      <div className="blob blob1" aria-hidden="true" />
      <div className="blob blob2" aria-hidden="true" />

      {/* ── HERO ── */}
      <Section id="about">
        <div className="hero-grid">
          <div className="hero-avatar">
            <div className="avatar-ring">
              <div className="avatar-inner">
                <img
                  src="/black and white.png"
                  alt="Hariharan Palanivel"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const p = e.target.parentNode;
                    p.style.fontSize    = "clamp(2rem, 5vw, 4.5rem)";
                    p.style.fontWeight  = "800";
                    p.style.color       = "var(--accent)";
                    p.style.fontFamily  = "var(--heading)";
                    p.textContent       = "HP";
                  }}
                />
              </div>
            </div>
          </div>
          <div className="hero-text">
            <p className="section-label">Available for opportunities</p>
            <h1 className="hero-name">
              Hariharan<br /><span className="line2">Palanivel</span>
            </h1>
            <p className="hero-tagline">
              Full-Stack Engineer &amp; DevOps enthusiast building scalable
              products deployed on AWS — from concept to production.
            </p>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => scrollTo("Projects")}>
                View Projects
              </button>
              <button className="btn btn-outline" onClick={() => scrollTo("Contact")}>
                Hire Me
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SKILLS ── */}
      <Section id="skills">
        <p className="section-label">What I work with</p>
        <h2>Skills &amp; Stack</h2>
        <div className="skills-grid">
          {SKILLS.map((s) => (
            <div className="skill-card" key={s.category}>
              <p className="skill-cat">{s.category}</p>
              <div className="skill-tags">
                {s.items.map((item) => <span className="tag" key={item}>{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PROJECTS ── */}
      <Section id="projects">
        <p className="section-label">Things I've built</p>
        <h2>Projects</h2>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <div className="project-card" key={p.title}>
              <style>{`.project-card:nth-child(${i + 1})::before { background: ${p.accent}; }`}</style>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((t) => <span className="project-tag" key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── EXPERIENCE ── */}
      <Section id="experience">
        <p className="section-label">Where I've worked</p>
        <h2>Experience</h2>
        <div className="timeline">
          {EXPERIENCE.map((exp) => (
            <div className="timeline-item" key={exp.company}>
              <div className="timeline-dot" aria-hidden="true" />
              <p className="timeline-period">{exp.period}</p>
              <p className="timeline-role">{exp.role}</p>
              <p className="timeline-company">{exp.company}</p>
              <ul className="timeline-points">
                {exp.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CONTACT ── */}
      <Section id="contact">
        <p className="section-label">Let's connect</p>
        <h2>Get In Touch</h2>
        <div className="contact-wrap">

          {/* Left — info */}
          <div className="contact-info">
            <h3>Open to work</h3>
            <p>
              I'm currently open to full-time roles and freelance projects.
              If you have something in mind, drop me a message and I'll get
              back within 24 hours.
            </p>
            <div className="social-links">
              <a className="social-link" href="mailto:hariharanp1912@gmail.com">
                📧 hariharanp1912@gmail.com
              </a>
              <a className="social-link" href="https://github.com/Hariharan1908" target="_blank" rel="noopener noreferrer">
                🐙 github.com/Hariharan1908
              </a>
              <a className="social-link" href="https://www.linkedin.com/in/hariharan-palani/" target="_blank" rel="noopener noreferrer">
                💼 linkedin.com/in/hariharan-palani
              </a>
              <a className="social-link" href="tel:+918489911622">
                📱 +91 84899 11622
              </a>
            </div>
          </div>

          {/* Right — form (single, clean, no nesting) */}
          <form className="contact-form" onSubmit={handleSubmit} noValidate>

            {formState === "sent" && (
              <p className="form-banner success" role="status">
                ✅ Message sent! I'll reply soon.
              </p>
            )}
            {formState === "error" && (
              <p className="form-banner error" role="alert">
                ❌ Failed to send. Please try again or email me directly.
              </p>
            )}

            <div className="form-group">
              <label htmlFor="cf-name">Name</label>
              <input
                id="cf-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
                autoComplete="name"
                disabled={formState === "sending"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cf-email">Email</label>
              <input
                id="cf-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoComplete="email"
                inputMode="email"
                disabled={formState === "sending"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell me about your project..."
                required
                disabled={formState === "sending"}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={formState === "sending"}
              style={{
                alignSelf: "flex-start",
                opacity: formState === "sending" ? 0.65 : 1,
              }}
            >
              {formState === "sending" ? "Sending…" : "Send Message →"}
            </button>

          </form>
        </div>
      </Section>

      <footer>
        <span>© 2026 Hariharan Palanivel. Built with React, deployed on AWS EC2.</span>
        <span>Chennai, India 🇮🇳</span>
      </footer>
    </>
  );
}
