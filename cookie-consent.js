/**
 * Cookie Consent Manager
 * 
 * Handles GDPR-compliant cookie consent:
 * - First-visit banner display
 * - User preferences (stored in localStorage)
 * - Conditional script loading based on consent categories
 * - Preferences modal for later changes
 * 
 * Categories:
 * - necessary: Always required (not user-configurable)
 * - analytics: Google Analytics, Microsoft Clarity
 * - functional: Enhanced features, preferences
 * - marketing: Third-party marketing pixels
 */

const CookieConsent = (() => {
  // Private variables
  const STORAGE_KEY = 'insighted_cookie_consent';
  const BANNER_SHOWN_KEY = 'insighted_consent_banner_shown';
  
  // Default consent state
  const DEFAULT_CONSENT = {
    necessary: true,      // Always true
    analytics: false,     // Opt-in
    functional: false,    // Opt-in
    marketing: false      // Opt-in
  };

  /**
   * Initialize the cookie consent system
   */
  const init = () => {
    // Setup event listeners
    setupEventListeners();
    
    // Check if user has already made a choice
    const existingConsent = getConsent();
    
    if (!existingConsent) {
      // First visit - show banner after a short delay
      setTimeout(() => {
        showBanner();
      }, 800);
    } else {
      // Consent already exists - load scripts based on saved preferences
      loadScriptsForConsent(existingConsent);
    }
    
    // Add cookie preferences link click handler
    setupPreferencesLink();
  };

  /**
   * Get stored consent from localStorage
   * Returns null if no consent stored, otherwise returns consent object
   */
  const getConsent = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  };

  /**
   * Save consent to localStorage
   */
  const saveConsent = (consentObj) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentObj));
    localStorage.setItem(BANNER_SHOWN_KEY, 'true');
  };

  /**
   * Show the consent banner
   */
  const showBanner = () => {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('visible');
    }
  };

  /**
   * Hide the consent banner
   */
  const hideBanner = () => {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  };

  /**
   * Show the preferences modal
   */
  const showPreferences = () => {
    const modal = document.getElementById('cookie-preferences-modal');
    const backdrop = document.getElementById('cookie-preferences-backdrop');
    if (modal) {
      modal.classList.add('visible');
      if (backdrop) backdrop.classList.add('visible');
    }
  };

  /**
   * Hide the preferences modal
   */
  const closePreferences = () => {
    const modal = document.getElementById('cookie-preferences-modal');
    const backdrop = document.getElementById('cookie-preferences-backdrop');
    if (modal) {
      modal.classList.remove('visible');
      if (backdrop) backdrop.classList.remove('visible');
    }
  };

  /**
   * Handle "Accept All" button click
   */
  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true
    };
    saveConsent(consent);
    loadScriptsForConsent(consent);
    hideBanner();
  };

  /**
   * Handle "Reject Non-Essential" button click
   */
  const handleRejectNonEssential = () => {
    const consent = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false
    };
    saveConsent(consent);
    loadScriptsForConsent(consent);
    hideBanner();
  };

  /**
   * Handle "Save Preferences" from modal
   */
  const handleSavePreferences = () => {
    const consent = {
      necessary: true,  // Always true
      analytics: document.getElementById('cookie-analytics').checked,
      functional: document.getElementById('cookie-functional').checked,
      marketing: document.getElementById('cookie-marketing').checked
    };
    saveConsent(consent);
    loadScriptsForConsent(consent);
    closePreferences();
  };

  /**
   * Update modal checkboxes to reflect current consent state
   */
  const updatePreferencesModal = () => {
    const currentConsent = getConsent() || DEFAULT_CONSENT;
    document.getElementById('cookie-analytics').checked = currentConsent.analytics;
    document.getElementById('cookie-functional').checked = currentConsent.functional;
    document.getElementById('cookie-marketing').checked = currentConsent.marketing;
  };

  /**
   * Load external scripts based on consent categories
   * This function conditionally injects tracking scripts
   */
  const loadScriptsForConsent = (consent) => {
    // Google Analytics - load if analytics consent = true
    if (consent.analytics && !window.gtag) {
      loadGoogleAnalytics();
    }
    
    // Microsoft Clarity - load if analytics or functional consent = true
    if ((consent.analytics || consent.functional) && !window.clarity) {
      loadMicrosoftClarity();
    }
    
    // Marketing pixels - load if marketing consent = true
    if (consent.marketing) {
      loadMarketingPixels();
    }
  };

  /**
   * Load Google Analytics script
   * Injects gtag.js and initializes Google Analytics with the configured ID
   */
  const loadGoogleAnalytics = () => {
    // Don't load twice
    if (window.gtag) return;
    
    // Create and inject the gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-7N94NG5SEZ';
    document.head.appendChild(script);
    
    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', 'G-7N94NG5SEZ');
    
    console.log('Google Analytics loaded (analytics consent given)');
  };

  /**
   * Load Microsoft Clarity script
   * Injects the Clarity tracking script with the configured ID
   */
  const loadMicrosoftClarity = () => {
    // Don't load twice
    if (window.clarity) return;
    
    // Inject Clarity tracking script
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "was8oovxsg");
    
    console.log('Microsoft Clarity loaded (analytics consent given)');
  };

  /**
   * Load marketing pixels
   * Add your marketing/conversion tracking pixels here
   */
  const loadMarketingPixels = () => {
    // Example: Facebook Pixel (customize with your actual pixel ID)
    /*
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
    */
  };

  /**
   * Setup the cookie preferences link in footer
   */
  const setupPreferencesLink = () => {
    const prefsLink = document.getElementById('cookie-preferences-link');
    if (prefsLink) {
      prefsLink.addEventListener('click', (e) => {
        e.preventDefault();
        updatePreferencesModal();
        showPreferences();
      });
    }
  };

  /**
   * Setup all event listeners for banner and modal
   */
  const setupEventListeners = () => {
    // Banner buttons
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectBtn = document.getElementById('cookie-reject-non-essential');
    const manageBtn = document.getElementById('cookie-manage-preferences');
    
    if (acceptAllBtn) acceptAllBtn.addEventListener('click', handleAcceptAll);
    if (rejectBtn) rejectBtn.addEventListener('click', handleRejectNonEssential);
    if (manageBtn) manageBtn.addEventListener('click', () => {
      updatePreferencesModal();
      showPreferences();
    });

    // Modal buttons
    const savePrefsBtn = document.getElementById('cookie-save-preferences');
    const closeModalBtn = document.getElementById('cookie-close-preferences');
    const backdropClose = document.getElementById('cookie-preferences-backdrop');
    
    if (savePrefsBtn) savePrefsBtn.addEventListener('click', handleSavePreferences);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closePreferences);
    if (backdropClose) {
      backdropClose.addEventListener('click', (e) => {
        if (e.target === backdropClose) closePreferences();
      });
    }

    // Keyboard: close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePreferences();
      }
    });
  };

  /**
   * Public API
   */
  return {
    init: init,
    getConsent: getConsent,
    saveConsent: saveConsent,
    showPreferences: showPreferences,
    closePreferences: closePreferences
  };
})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', CookieConsent.init);
} else {
  CookieConsent.init();
}
