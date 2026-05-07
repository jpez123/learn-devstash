// ── Year ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Navbar scroll opacity ─────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile menu ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── Scroll fade-in ────────────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => observer.observe(el));

// ── Chaos icon animation ──────────────────────────────────────
(function initChaos() {
  const arena = document.getElementById('chaosArena');
  if (!arena) return;

  const ICON_SIZE = 48;
  const PADDING = 4;
  let mouseX = -999, mouseY = -999;
  let arenaRect = arena.getBoundingClientRect();

  const icons = Array.from(arena.querySelectorAll('.chaos-icon'));

  // Place each icon at a random position
  const states = icons.map((el) => {
    const maxX = arenaRect.width - ICON_SIZE - PADDING;
    const maxY = arenaRect.height - ICON_SIZE - PADDING;
    const x = PADDING + Math.random() * maxX;
    const y = PADDING + Math.random() * maxY;
    const speed = 0.4 + Math.random() * 0.5;
    const angle = Math.random() * Math.PI * 2;
    const rotSpeed = (Math.random() - 0.5) * 0.6;
    return {
      el,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * 360,
      rotSpeed,
      scale: 1,
    };
  });

  // Update arena rect on resize
  window.addEventListener('resize', () => {
    arenaRect = arena.getBoundingClientRect();
  }, { passive: true });

  arena.addEventListener('mousemove', (e) => {
    const r = arena.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  arena.addEventListener('mouseleave', () => {
    mouseX = -999; mouseY = -999;
  });

  let last = 0;
  function tick(ts) {
    const dt = Math.min((ts - last) / 16, 3); // cap at 3x to avoid big jumps
    last = ts;

    const W = arenaRect.width;
    const H = arenaRect.height;

    states.forEach(s => {
      // Mouse repulsion
      const cx = s.x + ICON_SIZE / 2;
      const cy = s.y + ICON_SIZE / 2;
      const dx = cx - mouseX;
      const dy = cy - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const REPEL_RADIUS = 90;

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * 1.8;
        s.vx += (dx / dist) * force * dt;
        s.vy += (dy / dist) * force * dt;
      }

      // Dampen velocity
      s.vx *= 0.995;
      s.vy *= 0.995;

      // Clamp speed
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const MAX_SPEED = 2.5;
      if (speed > MAX_SPEED) {
        s.vx = (s.vx / speed) * MAX_SPEED;
        s.vy = (s.vy / speed) * MAX_SPEED;
      }
      // Keep minimum drift
      const MIN_SPEED = 0.2;
      if (speed < MIN_SPEED && speed > 0) {
        s.vx = (s.vx / speed) * MIN_SPEED;
        s.vy = (s.vy / speed) * MIN_SPEED;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Bounce off walls
      const maxX = W - ICON_SIZE - PADDING;
      const maxY = H - ICON_SIZE - PADDING;

      if (s.x < PADDING) { s.x = PADDING; s.vx = Math.abs(s.vx); }
      if (s.x > maxX)     { s.x = maxX;   s.vx = -Math.abs(s.vx); }
      if (s.y < PADDING)  { s.y = PADDING; s.vy = Math.abs(s.vy); }
      if (s.y > maxY)     { s.y = maxY;    s.vy = -Math.abs(s.vy); }

      // Subtle rotation
      s.rot += s.rotSpeed * dt;

      s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`;
    });

    requestAnimationFrame(tick);
  }

  // Initialize positions
  states.forEach(s => {
    s.el.style.position = 'absolute';
    s.el.style.top = '0';
    s.el.style.left = '0';
    s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
  });

  requestAnimationFrame(tick);
})();

// ── Pricing toggle ────────────────────────────────────────────
const billingToggle = document.getElementById('billingToggle');
const proPrice = document.getElementById('proPrice');
const proPeriod = document.getElementById('proPeriod');
const priceNote = document.getElementById('priceNote');

billingToggle.addEventListener('change', () => {
  if (billingToggle.checked) {
    proPrice.textContent = '$72';
    proPeriod.textContent = '/ year';
    priceNote.textContent = '$6/mo billed annually — save $24';
  } else {
    proPrice.textContent = '$8';
    proPeriod.textContent = '/ month';
    priceNote.textContent = ' ';
  }
});
