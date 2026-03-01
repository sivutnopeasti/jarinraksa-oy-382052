/* =========================================
   JARINRAKSA OY – MAIN.JS
   ========================================= */

'use strict';

/* =========================================
   1. NAVIGAATIO – HAMPURILAISVALIKKO
   ========================================= */
(function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.getElementById('main-nav');

  if (!hamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Sulje valikko kun linkkiä klikataan
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Sulje valikko kun klikataan ulkopuolelle
  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Sulje Escape-näppäimellä
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();

/* =========================================
   2. HEADER – SCROLL-VARJO
   ========================================= */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
})();

/* =========================================
   3. SCROLL-ANIMAATIOT (IntersectionObserver)
   ========================================= */
(function initScrollAnimations() {
  // Lisää fade-in-luokka animoitaviin elementteihin
  const targets = document.querySelectorAll(
    '.service-card, .gallery-item, .about-badge, .trust-item, ' +
    '.contact-form-wrapper, .about-content, .about-visual, ' +
    '.section-header, .contact-info'
  );

  targets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback – näytä kaikki suoraan
    targets.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Staggered delay korttilistoille
          const siblings = entry.target.parentElement
            ? Array.from(entry.target.parentElement.children).filter(function (c) {
                return c.classList.contains('fade-in');
              })
            : [];
          const index = siblings.indexOf(entry.target);
          const delay = index >= 0 ? Math.min(index * 80, 400) : 0;

          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();

/* =========================================
   4. AKTIIVINEN NAVIGOINTILINKKI SCROLLATESSA
   ========================================= */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navItems.length) return;

  let ticking = false;

  function updateActiveLink() {
    const scrollY = window.scrollY;
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70',
      10
    );

    let current = '';

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - navHeight - 60;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateActiveLink);
      ticking = true;
    }
  }, { passive: true });

  updateActiveLink();
})();

/* =========================================
   5. TARJOUSPYYNTÖLOMAKE
   ========================================= */
(function initContactForm() {
  const form       = document.getElementById('tarjouspyynto-form');
  const statusEl   = document.getElementById('form-status');
  const submitBtn  = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !statusEl || !submitBtn) return;

  const btnText = submitBtn.querySelector('.btn-text');

  function setStatus(type, message) {
    statusEl.textContent  = message;
    statusEl.className    = 'form-status ' + type;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className   = 'form-status';
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (btnText) {
      btnText.textContent = loading ? 'Lähetetään...' : 'Lähetä tarjouspyyntö';
    }
    submitBtn.style.opacity = loading ? '0.7' : '1';
  }

  // Reaaliaikainen kenttävalidointi
  form.querySelectorAll('input[required], textarea[required]').forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });

    field.addEventListener('input', function () {
      if (field.classList.contains('field-error')) {
        validateField(field);
      }
    });
  });

  function validateField(field) {
    const value = field.value.trim();
    let valid = true;

    if (!value) {
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false;
    } else if (field.type === 'tel' && !/^[\d\s\+\-\(\)]{6,}$/.test(value)) {
      valid = false;
    }

    if (!valid) {
      field.classList.add('field-error');
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('field-error');
      field.setAttribute('aria-invalid', 'false');
    }

    return valid;
  }

  function validateForm() {
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    let firstInvalid = null;

    requiredFields.forEach(function (field) {
      if (!validateField(field)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return allValid;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    if (!validateForm()) {
      setStatus('error', 'Täytä kaikki pakolliset kentät ennen lähettämistä.');
      return;
    }

    setLoading(true);

    const data     = new FormData(form);
    const action   = form.getAttribute('action');

    try {
      const response = await fetch(action, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus(
          'success',
          'Tarjouspyyntösi on lähetetty. Otamme yhteyttä yleensä saman päivän aikana.'
        );
        form.reset();
        form.querySelectorAll('.field-error').forEach(function (f) {
          f.classList.remove('field-error');
          f.removeAttribute('aria-invalid');
        });
      } else {
        const json = await response.json().catch(function () { return {}; });
        if (json.errors && json.errors.length) {
          setStatus('error', 'Lähetys epäonnistui: ' + json.errors.map(function (err) {
            return err.message;
          }).join(', '));
        } else {
          setStatus(
            'error',
            'Lähetys epäonnistui. Soita suoraan numeroon 040 0450902.'
          );
        }
      }
    } catch (err) {
      setStatus(
        'error',
        'Verkkovirhe. Tarkista internetyhteys tai soita numeroon 040 0450902.'
      );
    } finally {
      setLoading(false);
    }
  });
})();

/* =========================================
   6. GALLERIA – KEYBOARD-NAVIGAATIO
   ========================================= */
(function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  galleryItems.forEach(function (item) {
    // Tee elementistä fokusoitava
    if (!item.getAttribute('tabindex')) {
      item.setAttribute('tabindex', '0');
    }

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
})();

/* =========================================
   7. FOOTER – KULUVA VUOSI
   ========================================= */
(function initYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

/* =========================================
   8. CSS-MUUTTUJA: LOMAKEKENTÄN VIRHETYYLI
   ========================================= */
(function injectFieldErrorStyle() {
  const style = document.createElement('style');
  style.textContent = [
    '.field-error {',
    '  border-color: #c62828 !important;',
    '  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.12) !important;',
    '}',
    '.nav-links a.active {',
    '  color: var(--navy);',
    '}',
    '.nav-links a.active::after {',
    '  width: 100%;',
    '}'
  ].join('\n');
  document.head.appendChild(style);
})();

/* =========================================
   9. SMOOTH SCROLL ANKKURILINKEILLE
   ========================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });

      // Siirrä fokus kohde-elementtiin saavutettavuuden kannalta
      setTimeout(function () {
        if (!target.getAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: true });
      }, 500);
    });
  });
})();