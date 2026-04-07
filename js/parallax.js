/**
 * parallax.js — Lost Among Stars
 * Parallax scrolling + rich entrance animations.
 */

(function () {
  'use strict';

  // ── Nav scroll state ──────────────────────────────────────────────────────
  const nav = document.getElementById('nav');

  function updateNav(scrollY) {
    nav.classList.toggle('is-scrolled', scrollY > 50);
  }

  // ── Parallax elements ─────────────────────────────────────────────────────
  const parallaxItems = [];

  function collectParallaxItems() {
    parallaxItems.length = 0;
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      const speed = parseFloat(el.getAttribute('data-parallax'));
      if (isNaN(speed)) return;
      const rect      = el.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset;
      parallaxItems.push({ el, speed, offsetTop });
    });
  }

  function applyParallax(scrollY) {
    const vh = window.innerHeight;
    parallaxItems.forEach(function (item) {
      const { el, speed, offsetTop } = item;
      if (offsetTop + 800 < scrollY || offsetTop - vh - 400 > scrollY) return;
      const delta = (scrollY + vh * 0.5) - (offsetTop + vh * 0.5);
      const shift = delta * speed * -1;
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

  // ── Resize ────────────────────────────────────────────────────────────────
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      collectParallaxItems();
      applyParallax(window.pageYOffset);
    }, 120);
  }

  // ── Smooth anchor scrolling ───────────────────────────────────────────────
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

  // ── Entrance animations ───────────────────────────────────────────────────
  function setupEntranceAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      /* Base hidden state — direction set via data-anim attribute */
      [data-anim] {
        opacity: 0;
        will-change: opacity, transform;
      }

      /* Directional origins */
      [data-anim="up"]    { transform: translateY(40px); }
      [data-anim="left"]  { transform: translateX(-52px); }
      [data-anim="right"] { transform: translateX(52px); }
      [data-anim="scale"] { transform: scale(0.88) translateY(20px); }
      [data-anim="pop"]   { transform: scale(0.75); }

      /* Shared transition — override duration/delay inline */
      [data-anim].is-visible {
        opacity: 1;
        transform: none;
        transition:
          opacity  0.72s cubic-bezier(0.22, 0.61, 0.36, 1),
          transform 0.72s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
    `;
    document.head.appendChild(style);

    // ── Section labels ──────────────────────────────────────────────────
    document.querySelectorAll('.section-label').forEach(function (el) {
      el.setAttribute('data-anim', 'pop');
      el.style.transitionDuration = '0.5s';
    });

    // ── Headings ────────────────────────────────────────────────────────
    document.querySelectorAll('.section h2, .theme-inner h2, .contact-text h2').forEach(function (el) {
      el.setAttribute('data-anim', 'up');
      el.style.transitionDelay = '0.08s';
    });

    // ── Two-col: text slides from the side opposite the illustration ─────
    document.querySelectorAll('.two-col--text-left .two-col__text').forEach(function (el) {
      el.setAttribute('data-anim', 'left');
      el.style.transitionDelay = '0.14s';
    });
    document.querySelectorAll('.two-col--text-left .two-col__illustration').forEach(function (el) {
      el.setAttribute('data-anim', 'right');
      el.style.transitionDelay = '0.22s';
    });
    document.querySelectorAll('.two-col--text-right .two-col__text').forEach(function (el) {
      el.setAttribute('data-anim', 'right');
      el.style.transitionDelay = '0.22s';
    });
    document.querySelectorAll('.two-col--text-right .two-col__illustration').forEach(function (el) {
      el.setAttribute('data-anim', 'left');
      el.style.transitionDelay = '0.14s';
    });

    // ── Theme section body paragraphs ────────────────────────────────────
    document.querySelectorAll('.theme-inner p, .theme-inner .lead').forEach(function (el, i) {
      el.setAttribute('data-anim', 'up');
      el.style.transitionDelay = (0.18 + i * 0.1) + 's';
    });

    // ── Contact text + badge ─────────────────────────────────────────────
    const contactText = document.querySelector('.contact-text');
    if (contactText) {
      contactText.setAttribute('data-anim', 'right');
      contactText.style.transitionDelay = '0.1s';
    }
    const badge = document.querySelector('.bologna-badge');
    if (badge) {
      badge.setAttribute('data-anim', 'left');
      badge.style.transitionDelay = '0.2s';
    }

    // ── About portrait ───────────────────────────────────────────────────
    const portrait = document.querySelector('.about-portrait-wrap');
    if (portrait) {
      portrait.setAttribute('data-anim', 'left');
      portrait.style.transitionDelay = '0.1s';
    }
    const aboutText = document.querySelector('#about .two-col__text');
    if (aboutText) {
      aboutText.setAttribute('data-anim', 'right');
      aboutText.style.transitionDelay = '0.2s';
    }

    // ── Chapters: section header ─────────────────────────────────────────
    const chapHeader = document.querySelector('.section-header');
    if (chapHeader) {
      chapHeader.setAttribute('data-anim', 'up');
    }

    // ── Chapter cards: scale-in with stagger ────────────────────────────
    document.querySelectorAll('.chapter-card').forEach(function (el, i) {
      el.setAttribute('data-anim', 'scale');
      el.style.transitionDelay = (i * 0.09) + 's';
    });

    // ── Observe everything ───────────────────────────────────────────────
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-anim]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-anim]').forEach(function (el) {
      observer.observe(el);
    });
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
