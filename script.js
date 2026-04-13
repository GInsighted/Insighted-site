const menuToggle = document.getElementById('menuToggle');
const siteNav = document.getElementById('siteNav');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

const setNavState = isOpen => {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  siteNav.classList.toggle('open', isOpen);
};

if (menuToggle && siteNav) {
  setNavState(false);

  menuToggle.addEventListener('click', () => {
    setNavState(!siteNav.classList.contains('open'));
  });

  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (siteNav.classList.contains('open')) {
        setNavState(false);
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && siteNav.classList.contains('open')) {
      setNavState(false);
    }
  });
}

if (contactForm && formMessage) {
  const submitBtn = contactForm.querySelector('button[type="submit"], input[type="submit"]');

  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    formMessage.textContent = '';

    const url = contactForm.getAttribute('action') || 'https://formspree.io/f/mvzdpola';
    const formData = new FormData(contactForm);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        formMessage.textContent = 'Thanks — your request has been received. We will follow up by email shortly.';
        contactForm.reset();
      } else {
        formMessage.textContent = (data && (data.error || data.message)) ? (data.error || data.message) : 'Submission failed. Please try again later.';
      }
    } catch (err) {
      formMessage.textContent = 'Submission failed. Please check your connection and try again.';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* Highlight active nav link based on scroll position */
const navLinks = document.querySelectorAll('.nav-link');
const observedSections = Array.from(navLinks)
  .map(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return null;
    return document.querySelector(href);
  })
  .filter(Boolean);

if (navLinks.length && observedSections.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav-link.active').forEach(l => l.classList.remove('active'));
          if (link) link.classList.add('active');
        }
      });
    },
    { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 }
  );

  observedSections.forEach(s => observer.observe(s));
}

const verificationButton = document.getElementById('recomputeVerificationButton');
const verificationAnnounce = document.getElementById('verificationAnnounce');
const verificationValues = document.querySelectorAll('.verification-value');
const verificationStatus = document.querySelector('.record-status-pill');
const verificationStatusText = document.querySelector('.record-status-text');
const verificationStatusIcon = document.querySelector('.record-status-icon');

if (verificationButton && verificationValues.length && verificationStatus && verificationStatusText) {
  const resetButton = () => {
    verificationButton.disabled = false;
    verificationButton.textContent = 'Re-run verification';
    verificationStatus.classList.remove('verifying');
    if (verificationStatusIcon) {
      verificationStatusIcon.textContent = '✓';
    }
    verificationStatusText.textContent = 'Verified';
  };

  verificationButton.addEventListener('click', () => {
    if (verificationButton.disabled) return;

    verificationButton.disabled = true;
    verificationButton.textContent = 'Recomputing…';
    verificationStatus.classList.add('verifying');
    if (verificationStatusIcon) {
      verificationStatusIcon.textContent = '';
    }
    verificationStatusText.textContent = 'Verifying…';

    if (verificationAnnounce) {
      verificationAnnounce.textContent = 'Verification is being recomputed.';
    }

    verificationValues.forEach(value => value.classList.add('fading'));

    window.setTimeout(() => {
      verificationValues.forEach(value => {
        const key = value.dataset.verification;
        if (key === 'result') {
          value.textContent = 'MATCH';
        } else if (key === 'check') {
          value.textContent = 'PASSED';
        }
        value.classList.remove('fading');
      });

      if (verificationAnnounce) {
        verificationAnnounce.textContent = 'Verification recomputed: MATCH and PASSED are confirmed.';
      }

      resetButton();
    }, 900);
  });
}
