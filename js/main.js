/* ============================================================
   SCIVANTIS — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- Sticky header ---- */
  const header = document.getElementById('site-header');
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Hero animated particles ---- */
  (function buildParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = 22;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      const size = 4 + Math.random() * 10;
      dot.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'background:rgba(255,255,255,' + (0.05 + Math.random() * 0.12) + ')',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'top:' + Math.random() * 100 + '%',
        'left:' + Math.random() * 100 + '%',
        'animation:float ' + (6 + Math.random() * 10) + 's ease-in-out ' + (Math.random() * 4) + 's infinite alternate',
      ].join(';');
      container.appendChild(dot);
    }

    // Inject keyframes once
    if (!document.getElementById('particle-kf')) {
      const style = document.createElement('style');
      style.id = 'particle-kf';
      style.textContent = '@keyframes float { from { transform:translateY(0) scale(1); } to { transform:translateY(-30px) scale(1.15); } }';
      document.head.appendChild(style);
    }
  }());

  /* ---- Animated counters in hero ---- */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('.stat__number[data-target]');
  let countersStarted = false;

  function maybeStartCounters() {
    if (countersStarted) return;
    const heroStats = document.querySelector('.hero__stats');
    if (!heroStats) return;
    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      countersStarted = true;
      counters.forEach(animateCounter);
    }
  }

  window.addEventListener('scroll', maybeStartCounters, { passive: true });
  // also check on load (visible immediately on large screens)
  maybeStartCounters();

  /* ---- Scroll-reveal for [data-reveal] and specific cards ---- */
  const revealTargets = document.querySelectorAll(
    '[data-reveal], .service-card, .team-card, .process-step'
  );

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---- Testimonials slider ---- */
  var TESTIMONIAL_AUTOPLAY_MS = 6000;

  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testimonial-dots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (track && dotsContainer) {
    const slides = track.querySelectorAll('.testimonial');
    const total = slides.length;
    let current = 0;
    let autoplayTimer;

    // Build dots
    slides.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dotsContainer.querySelectorAll('.testimonials__dot').forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
      resetAutoplay();
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(function () { goTo(current + 1); }, TESTIMONIAL_AUTOPLAY_MS);
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    // Swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) goTo(current + (delta > 0 ? 1 : -1));
    });

    resetAutoplay();
  }

  /* ---- Contact form validation ---- */
  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    function showError(fieldId, msg) {
      const el = document.getElementById(fieldId + '-error');
      const input = document.getElementById(fieldId);
      if (el) el.textContent = msg;
      if (input) input.classList.toggle('error', Boolean(msg));
    }

    function clearErrors() {
      ['name', 'email', 'service', 'message'].forEach(function (id) {
        showError(id, '');
      });
    }

    function validate() {
      clearErrors();
      let valid = true;

      const name = form.elements['name'].value.trim();
      if (!name) { showError('name', 'Please enter your full name.'); valid = false; }

      const email = form.elements['email'].value.trim();
      if (!email) {
        showError('email', 'Please enter your email address.'); valid = false;
      } else if (!EMAIL_REGEX.test(email)) {
        showError('email', 'Please enter a valid email address.'); valid = false;
      }

      const service = form.elements['service'].value;
      if (!service) { showError('service', 'Please select an area of interest.'); valid = false; }

      const message = form.elements['message'].value.trim();
      if (!message) { showError('message', 'Please tell us about your project.'); valid = false; }

      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      // Simulate async submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        form.reset();
        clearErrors();
        formSuccess.hidden = false;
        setTimeout(function () { formSuccess.hidden = true; }, 6000);
      }, 1400);
    });

    // Live validation on blur
    ['name', 'email', 'service', 'message'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', function () {
          validate();
        });
      }
    });
  }

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

}());
