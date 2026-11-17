/**
 * Lens & Light Studio — Handcrafted Custom Lightbox
 * Features:
 * - Open from any image with [data-lightbox]
 * - Next / Previous buttons
 * - Keyboard navigation (Left / Right / Esc)
 * - Touch swipe on mobile devices
 * - Real-time image counter (e.g., 3 / 16)
 * - Caption display
 * - Accessibility & focus management
 */
(function () {
  'use strict';

  class CustomLightbox {
    constructor() {
      this.galleryItems = [];
      this.currentIndex = 0;
      this.isOpen = false;
      this.lastFocusedElement = null;

      // Swipe detection variables
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.touchEndX = 0;
      this.touchEndY = 0;
      this.minSwipeDistance = 50;

      this.init();
    }

    init() {
      this.buildDOM();
      this.collectItems();
      this.bindEvents();
    }

    buildDOM() {
      // Check if lightbox DOM already exists
      if (document.getElementById('custom-lightbox')) {
        this.modal = document.getElementById('custom-lightbox');
      } else {
        const modal = document.createElement('div');
        modal.id = 'custom-lightbox';
        modal.className = 'lightbox-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Image Lightbox Preview');
        modal.setAttribute('tabindex', '-1');

        modal.innerHTML = `
          <div class="lightbox-topbar">
            <div class="lightbox-counter" id="lightbox-counter" aria-live="polite">1 / 1</div>
            <button class="lightbox-close-btn" id="lightbox-close" aria-label="Close Lightbox (Esc)">
              <i class="ri-close-line" aria-hidden="true"></i>
            </button>
          </div>
          <div class="lightbox-stage">
            <button class="lightbox-nav-btn lightbox-prev-btn" id="lightbox-prev" aria-label="Previous Image (Left Arrow)">
              <i class="ri-arrow-left-s-line" aria-hidden="true"></i>
            </button>
            <div class="lightbox-image-wrap">
              <img class="lightbox-img" id="lightbox-active-img" src="" alt="" />
            </div>
            <button class="lightbox-nav-btn lightbox-next-btn" id="lightbox-next" aria-label="Next Image (Right Arrow)">
              <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
            </button>
          </div>
          <div class="lightbox-caption-bar">
            <p class="lightbox-caption" id="lightbox-caption"></p>
          </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
      }

      this.counterEl = this.modal.querySelector('#lightbox-counter');
      this.imageEl = this.modal.querySelector('#lightbox-active-img');
      this.captionEl = this.modal.querySelector('#lightbox-caption');
      this.closeBtn = this.modal.querySelector('#lightbox-close');
      this.prevBtn = this.modal.querySelector('#lightbox-prev');
      this.nextBtn = this.modal.querySelector('#lightbox-next');
      this.stageEl = this.modal.querySelector('.lightbox-stage');
    }

    collectItems() {
      // Query all triggerable lightbox items on the page
      const elements = Array.from(document.querySelectorAll('[data-lightbox]'));
      this.galleryItems = elements.map((el) => {
        const fullSrc = el.getAttribute('data-lightbox-src') || el.getAttribute('src') || el.querySelector('img')?.getAttribute('src');
        const caption = el.getAttribute('data-caption') || el.getAttribute('alt') || el.querySelector('img')?.getAttribute('alt') || '';
        return {
          element: el,
          src: fullSrc,
          caption: caption
        };
      });

      // Bind click triggers
      this.galleryItems.forEach((item, index) => {
        item.element.style.cursor = 'pointer';
        item.element.addEventListener('click', (e) => {
          e.preventDefault();
          this.open(index);
        });

        // Keyboard Enter or Space on trigger
        item.element.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.open(index);
          }
        });
      });
    }

    // Refresh collection when items dynamically change or filter
    refreshItems() {
      const visibleElements = Array.from(document.querySelectorAll('[data-lightbox]'))
        .filter(el => !el.closest('.hidden'));

      this.galleryItems = visibleElements.map((el) => {
        const fullSrc = el.getAttribute('data-lightbox-src') || el.getAttribute('src') || el.querySelector('img')?.getAttribute('src');
        const caption = el.getAttribute('data-caption') || el.getAttribute('alt') || el.querySelector('img')?.getAttribute('alt') || '';
        return {
          element: el,
          src: fullSrc,
          caption: caption
        };
      });
    }

    open(index) {
      this.refreshItems();
      if (!this.galleryItems.length) return;

      this.lastFocusedElement = document.activeElement;
      this.currentIndex = index >= 0 && index < this.galleryItems.length ? index : 0;
      this.isOpen = true;

      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      this.updateView();
      this.closeBtn.focus();
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.modal.classList.remove('active');
      document.body.style.overflow = '';

      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
        this.lastFocusedElement.focus();
      }
    }

    next() {
      if (!this.galleryItems.length) return;
      this.currentIndex = (this.currentIndex + 1) % this.galleryItems.length;
      this.updateView();
    }

    prev() {
      if (!this.galleryItems.length) return;
      this.currentIndex = (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
      this.updateView();
    }

    updateView() {
      const item = this.galleryItems[this.currentIndex];
      if (!item) return;

      this.imageEl.classList.remove('loaded');

      const tempImg = new Image();
      tempImg.src = item.src;
      tempImg.onload = () => {
        this.imageEl.src = item.src;
        this.imageEl.alt = item.caption;
        this.imageEl.classList.add('loaded');
      };

      this.counterEl.textContent = `${this.currentIndex + 1} / ${this.galleryItems.length}`;
      this.captionEl.textContent = item.caption;

      // Preload adjacent images
      this.preloadNextAndPrev();
    }

    preloadNextAndPrev() {
      const nextIdx = (this.currentIndex + 1) % this.galleryItems.length;
      const prevIdx = (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
      
      const preloadNext = new Image();
      preloadNext.src = this.galleryItems[nextIdx].src;

      const preloadPrev = new Image();
      preloadPrev.src = this.galleryItems[prevIdx].src;
    }

    bindEvents() {
      // Buttons
      this.closeBtn.addEventListener('click', () => this.close());
      this.nextBtn.addEventListener('click', () => this.next());
      this.prevBtn.addEventListener('click', () => this.prev());

      // Click outside stage/image to close
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.stageEl || e.target === this.modal) {
          this.close();
        }
      });

      // Keyboard navigation (Esc, Arrows)
      window.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        }
      });

      // Mobile Touch Swipe Handling
      this.stageEl.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      this.stageEl.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleTouchGesture();
      }, { passive: true });
    }

    handleTouchGesture() {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;

      // Horizontal swipe dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
        if (deltaX < 0) {
          // Swipe left -> Next
          this.next();
        } else {
          // Swipe right -> Prev
          this.prev();
        }
      } else if (deltaY > 100 && Math.abs(deltaX) < 60) {
        // Swipe down -> Close
        this.close();
      }
    }
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.customLightboxInstance = new CustomLightbox();
    });
  } else {
    window.customLightboxInstance = new CustomLightbox();
  }
})();
