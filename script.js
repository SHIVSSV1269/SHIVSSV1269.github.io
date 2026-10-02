(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  /* ---------- theme ---------- */
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
    else if (matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";
  } catch {}
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => { root.dataset.theme = next; try { localStorage.setItem("theme", next); } catch {} };
    document.startViewTransition && !reduced ? document.startViewTransition(apply) : apply();
  });

  /* ---------- split hero title into chars ---------- */
  let ci = 0;
  $$(".split").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    const chars = [...text];
    chars.forEach((c, k) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      s.style.transitionDelay = `${0.15 + ci++ * 0.04}s`;
      if (el.classList.contains("grad")) {
        s.style.backgroundSize = `${chars.length * 100}% 100%`;
        s.style.backgroundPosition = `${(k / (chars.length - 1)) * 100}% 50%`;
      }
      el.appendChild(s);
    });
  });

  /* ---------- loader ---------- */
  document.body.classList.add("loading");
  const finishLoad = () => {
    $("#loader").classList.add("done");
    document.body.classList.remove("loading");
    setTimeout(() => document.body.classList.add("ready"), 200);
    setTimeout(startTyping, 900);
  };
  window.addEventListener("load", () => setTimeout(finishLoad, reduced ? 0 : 1300));

  /* ---------- typing roles ---------- */
  const roles = ["AI Engineer", "LLM agent builder", "Voice AI tinkerer", "Full-stack developer", "Automation nerd", "2027 CSBS grad"];
  const typed = $("#typed");
  function startTyping() {
    let r = 0, i = 0, del = false;
    const tick = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, i);
      if (!del && i === word.length) { del = true; return setTimeout(tick, 1600); }
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
      i += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    };
    tick();
  }

  /* ---------- particle network ---------- */
  const cvs = $("#particles");
  const ctx = cvs.getContext("2d");
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cvs.offsetWidth; H = cvs.offsetHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(110, Math.floor((W * H) / 14000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }));
  };
  resize();
  addEventListener("resize", resize);
  $(".hero").addEventListener("pointermove", (e) => { const b = cvs.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; });
  $(".hero").addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  let heroVisible = true;
  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(cvs);
  const accent = () => getComputedStyle(root).getPropertyValue("--accent").trim();
  const draw = () => {
    requestAnimationFrame(draw);
    if (!heroVisible) return;
    ctx.clearRect(0, 0, W, H);
    const col = accent();
    for (const p of pts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 130) { p.x += (dx / d) * 1.4; p.y += (dy / d) * 1.4; }
      if (!reduced) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = col; ctx.globalAlpha = 0.7; ctx.fill();
    }
    ctx.strokeStyle = col;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) { ctx.globalAlpha = (1 - d / 120) * 0.25; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const m = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
      if (m < 180) { ctx.globalAlpha = (1 - m / 180) * 0.5; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  };
  draw();

  /* ---------- custom cursor ---------- */
  if (finePointer) {
    const dot = $("#cursorDot"), ring = $("#cursorRing");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; dot.style.translate = `${x}px ${y}px`; });
    const loop = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.translate = `${rx}px ${ry}px`; requestAnimationFrame(loop); };
    loop();
    $$("a, button, .tilt").forEach((el) => {
      el.addEventListener("pointerenter", () => ring.classList.add("hover"));
      el.addEventListener("pointerleave", () => ring.classList.remove("hover"));
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.25}px, ${(e.clientY - b.top - b.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 600);
      });
    });
  }

  /* ---------- 3D tilt + spotlight ---------- */
  if (finePointer && !reduced) {
    $$("[data-tilt]").forEach((el) => {
      const max = el.classList.contains("featured") ? 4 : el.classList.contains("photo-wrap") ? 14 : 8;
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        el.style.transition = "transform .12s ease-out";
        const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 700);
      });
    });
  }
  $$(".spotlight").forEach((el) => el.addEventListener("pointermove", (e) => {
    const b = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - b.left}px`);
    el.style.setProperty("--my", `${e.clientY - b.top}px`);
  }));

  /* ---------- scroll reveal (staggered) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const sibs = $$(".reveal:not(.in)", e.target.parentElement);
      e.target.style.setProperty("--d", `${Math.max(0, sibs.indexOf(e.target)) * 0.08}s`);
      e.target.classList.add("in");
      io.unobserve(e.target);
      const el = e.target, delay = parseFloat(el.style.getPropertyValue("--d")) * 1000;
      setTimeout(() => el.classList.remove("reveal"), 1100 + delay); // hand transitions back to the element
      $$(".count", e.target).forEach(countUp);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- counters ---------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, dur = 1600, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- project filter ---------- */
  $$(".filter").forEach((btn) => btn.addEventListener("click", () => {
    $$(".filter").forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    $$(".project").forEach((p) => {
      const show = f === "all" || p.dataset.cat.split(" ").includes(f);
      p.classList.toggle("hidden", !show);
      p.classList.remove("fade-in");
      if (show) { void p.offsetWidth; p.classList.add("fade-in", "in"); }
    });
  }));

  /* ---------- scroll-driven: progress, nav, timeline, active link ---------- */
  const nav = $("#nav"), prog = $("#progress"), toTop = $("#toTop"), tlFill = $("#tlFill"), tl = $(".timeline");
  const links = $$(".nav-links a"), sections = links.map((a) => $(a.getAttribute("href")));
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 30);
    nav.classList.toggle("hide", y > lastY && y > 400 && !$("#navLinks").classList.contains("open"));
    toTop.classList.toggle("show", y > 700);
    lastY = y;
    const tb = tl.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (innerHeight * 0.6 - tb.top) / tb.height));
    tlFill.style.height = `${pct * 100}%`;
    let cur = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === cur));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- mobile menu ---------- */
  const burger = $("#burger"), menu = $("#navLinks");
  burger.addEventListener("click", () => { burger.classList.toggle("open"); menu.classList.toggle("open"); });
  links.forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); menu.classList.remove("open"); }));

  /* ---------- copy email ---------- */
  const toast = $("#toast");
  $("#copyEmail").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("shivaselvamssv@gmail.com"); toast.textContent = "Email copied ✓"; }
    catch { toast.textContent = "shivaselvamssv@gmail.com"; }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });

  $("#year").textContent = new Date().getFullYear();
})();
