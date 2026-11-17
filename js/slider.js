/**
 * Lens & Light Studio — Hero Slideshow
 * Custom auto-playing, hover-pausing, smooth fade slider
 */
(function () {
  'use strict';

  function initHeroSlider() {
    const sliderSection = document.querySelector('.hero-slider-section');
    if (!sliderSection) return;

    const slides = Array.from(sliderSection.querySelectorAll('.hero-slide'));
    const dots = Array.from(sliderSection.querySelectorAll('.slider-dot'));
    const prevBtn = sliderSection.querySelector('.slider-arrow-prev');
    const nextBtn = sliderSection.querySelector('.slider-arrow-next');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let autoPlayInterval = null;
    const intervalDuration = 5500;
    let isPaused = false;

    function goToSlide(index) {
      if (index < 0) {
        index = slides.length - 1;
      } else if (index >= slides.length) {
        index = 0;
      }

      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.classList.remove('active');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });

      currentIndex = index;
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
      if (autoPlayInterval) clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(() => {
        if (!isPaused) {
          nextSlide();
        }
      }, intervalDuration);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Pause on mouse enter, resume on mouse leave
    sliderSection.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    sliderSection.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    // Arrow navigation
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      });
    }

    // Dots navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(index);
        startAutoPlay();
      });
    });

    // Touch swipe support on slider
    let touchStartX = 0;
    let touchEndX = 0;

    sliderSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        startAutoPlay();
      }
    }

    // Start playback
    startAutoPlay();
  }

  // Initialize once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlider);
  } else {
    initHeroSlider();
  }
})();
