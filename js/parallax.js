/**
 * parallax.js — Lost Among Stars
 * Smooth parallax scrolling for background layers.
 *
 * Elements with [data-parallax="0.3"] move at 30% of scroll speed,
 * creating a depth effect where slower elements feel further away.
 */

(function () {
  'use strict';

  // ── Nav scroll state ──────────────────────────────────────────────────────
  const nav = document.getElementById('nav');

  function updateNav(scrollY) {
    if (scrollY > 50) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  // ── Parallax elements ─────────────────────────────────────────────────────
  // Collect all elements that have a data-parallax attribute.
  // Each entry stores the element and its cached section offset so we only
  // hit the DOM for layout data once (on init and on resize).
  const parallaxItems = [];

  function collectParallaxItems() {
    parallaxItems.length = 0;

    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      const speed = parseFloat(el.getAttribute('data-parallax'));
      if (isNaN(speed)) return;

      // Absolute top of the element relative to the document
      const rect      = el.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset;

      parallaxItems.push({ el, speed, offsetTop });
    });
  }

  // ── Apply transforms ──────────────────────────────────────────────────────
  function applyParallax(scrollY) {
    const vh = window.innerHeight;

    parallaxItems.forEach(function (item) {
      const { el, speed, offsetTop } = item;

      // Only animate when the element is near the viewport for performance
      if (offsetTop + 800 < scrollY || offsetTop - vh - 400 > scrollY) return;

      // How far has the viewport scrolled past the element's origin?
      // We offset by half the viewport so the effect is centred.
      const delta = (scrollY + vh * 0.5) - (offsetTop + vh * 0.5);
      const shift = delta * speed * -1; // negative = moves up (background retreats)

      el.style.transform = `translateY(${shift.toFixed(2)}px)`;
    });
  }

  // ── Scroll loop ───────────────────────────────────────────────────────────
  let ticking = false;
  let lastScrollY = window.pageYOffset;

  function onScroll() {
    lastScrollY = window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateNav(lastScrollY);
        applyParallax(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  // ── Resize: recache element positions ────────────────────────────────────
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      collectParallaxItems();
      applyParallax(window.pageYOffset);
    }, 120);
  }

  // ── Smooth anchor scrolling (respects fixed nav height) ──────────────────
  function setupSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = link.getAttribute('href').slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        const navHeight = nav.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }

  // ── Entrance animations (Intersection Observer) ───────────────────────────
  function setupEntranceAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.65s ease, transform 0.65s ease;
      }
      .animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    // Tag elements we want to animate in
    const targets = document.querySelectorAll(
      '.two-col__text, .two-col__illustration, .chapter-card, .about-portrait-wrap, .section-header, .contact-text, .bologna-badge'
    );

    targets.forEach(function (el) {
      el.classList.add('animate-on-scroll');
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Stagger sibling cards
              const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll:not(.is-visible)');
              if (entry.target.classList.contains('chapter-card')) {
                let delay = 0;
                siblings.forEach(function (sibling) {
                  setTimeout(function () {
                    sibling.classList.add('is-visible');
                  }, delay);
                  delay += 80;
                });
              } else {
                entry.target.classList.add('is-visible');
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      targets.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show everything immediately
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    collectParallaxItems();
    updateNav(window.pageYOffset);
    applyParallax(window.pageYOffset);
    setupSmoothAnchors();
    setupEntranceAnimations();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
