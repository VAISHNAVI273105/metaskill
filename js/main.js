/**
 * Lens & Light Studio — Main Interactive Engine
 * Controls header behavior, mobile navigation, category filtering,
 * blur-up lazy loading transitions, and contact form handling.
 */
(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. HEADER SCROLL & MOBILE NAVIGATION
     -------------------------------------------------------------------------- */
  function initHeaderAndNav() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Sticky glass header on scroll
    function handleHeaderScroll() {
      if (!header) return;
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // Mobile hamburger toggle
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('open');
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
      });

      // Close mobile menu when clicking outside or clicking any nav link
      navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          mobileToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Active nav link highlight based on current path
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. SOFT BLUR-UP PLACEHOLDER EFFECT
     Smoothly fades in images once they have loaded
     -------------------------------------------------------------------------- */
  function initBlurUpLoading() {
    const blurContainers = document.querySelectorAll('.blur-load');

    blurContainers.forEach((container) => {
      const img = container.querySelector('img');
      if (!img) return;

      function onImageLoad() {
        container.classList.add('loaded');
        img.classList.add('loaded');
      }

      if (img.complete) {
        onImageLoad();
      } else {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad);
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. PORTFOLIO MASONRY CATEGORY FILTER
     Filters items by data-category: Wedding, Portrait, Fashion, Product, Travel
     -------------------------------------------------------------------------- */
  function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const masonryItems = document.querySelectorAll('.masonry-item');

    if (!filterButtons.length || !masonryItems.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Toggle active button state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedFilter = btn.getAttribute('data-filter');

        masonryItems.forEach((item) => {
          const category = item.getAttribute('data-category');
          if (selectedFilter === 'all' || category === selectedFilter) {
            item.classList.remove('hidden');
            item.style.display = 'block';
            item.style.opacity = '1';
          } else {
            item.classList.add('hidden');
            item.style.display = 'none';
            item.style.opacity = '0';
          }
        });

        // Notify custom lightbox to refresh its collection of visible items
        if (window.customLightboxInstance && typeof window.customLightboxInstance.refreshItems === 'function') {
          window.customLightboxInstance.refreshItems();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. CONTACT & BOOKING FORM VALIDATION / FEEDBACK
     -------------------------------------------------------------------------- */
  function initBookingForm() {
    const bookingForm = document.getElementById('studio-booking-form');
    if (!bookingForm) return;

    const feedback = document.getElementById('booking-feedback');

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const shootType = document.getElementById('shoot-type')?.value;
      const shootDate = document.getElementById('shoot-date')?.value;
      const clientName = document.getElementById('client-name')?.value;
      const clientEmail = document.getElementById('client-email')?.value;

      if (!shootType || !shootDate || !clientName || !clientEmail) {
        if (feedback) {
          feedback.textContent = 'Please fill in all required fields marked with an asterisk (*).';
          feedback.style.borderColor = '#ff4d4d';
          feedback.style.color = '#ff6b6b';
          feedback.classList.add('show');
        }
        return;
      }

      // Simulate successful inquiry submission
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Inquiry';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Submitting...';
      }

      setTimeout(() => {
        bookingForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        if (feedback) {
          feedback.textContent = 'Thank you, ' + clientName + '! Your booking inquiry has been received. Julian Vance will review your dates and details and get back to you within 24 hours.';
          feedback.style.borderColor = 'var(--color-accent)';
          feedback.style.color = 'var(--color-text-primary)';
          feedback.classList.add('show');
        }
      }, 1000);
    });
  }

  /* --------------------------------------------------------------------------
     INITIALIZATION ON DOM LOAD
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderAndNav();
    initBlurUpLoading();
    initPortfolioFilter();
    initBookingForm();
  });
})();
