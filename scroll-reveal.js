// ScrollReveal — Word-by-word progressive reveal with blur, rotation and opacity
// Vanilla JS implementation of the React ScrollReveal component

(function () {
    const CONFIG = {
        baseOpacity: 0.1,
        enableBlur: true,
        baseRotation: 3,
        blurStrength: 4,
    };

    function initScrollReveal() {
        const elements = document.querySelectorAll('[data-scroll-reveal]');

        elements.forEach(el => {
            const text = el.textContent.trim();
            if (!text) return;

            // Split into words, wrap each in a span
            const words = text.split(/\s+/);
            el.innerHTML = '';
            el.style.lineHeight = el.dataset.lineHeight || '1.6';

            words.forEach((word, i) => {
                const wordWrap = document.createElement('span');
                wordWrap.className = 'sr-word';
                wordWrap.textContent = word;
                wordWrap.style.setProperty('--sr-index', i);
                wordWrap.style.opacity = CONFIG.baseOpacity;
                wordWrap.style.filter = CONFIG.enableBlur ? `blur(${CONFIG.blurStrength}px)` : 'none';
                wordWrap.style.transform = `rotateX(${CONFIG.baseRotation}deg) translateY(6px)`;
                el.appendChild(wordWrap);

                // Add space between words
                if (i < words.length - 1) {
                    el.appendChild(document.createTextNode(' '));
                }
            });

            // Track scroll progress for this element
            trackScroll(el);
        });
    }

    function trackScroll(el) {
        function update() {
            const rect = el.getBoundingClientRect();
            const viewH = window.innerHeight;

            // Calculate how far through the viewport this element has scrolled
            // Start revealing when element enters bottom 85% of viewport
            // Fully revealed when element reaches top 35% of viewport
            const start = viewH * 0.92;
            const end = viewH * 0.25;
            const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

            const words = el.querySelectorAll('.sr-word');
            const total = words.length;

            words.forEach((word, i) => {
                // Stagger: each word reveals slightly after the previous
                const wordStart = i / total;
                const wordEnd = (i + 1) / total;
                const wordProgress = Math.min(1, Math.max(0, (progress - wordStart) / (wordEnd - wordStart)));

                // Ease out cubic
                const eased = 1 - Math.pow(1 - wordProgress, 3);

                const opacity = CONFIG.baseOpacity + (1 - CONFIG.baseOpacity) * eased;
                const blur = CONFIG.enableBlur ? CONFIG.blurStrength * (1 - eased) : 0;
                const rotation = CONFIG.baseRotation * (1 - eased);
                const translateY = 6 * (1 - eased);

                word.style.opacity = opacity;
                word.style.filter = blur > 0.1 ? `blur(${blur}px)` : 'none';
                word.style.transform = `rotateX(${rotation}deg) translateY(${translateY}px)`;
            });
        }

        // Use both scroll and intersection observer for performance
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    update();
                    ticking = false;
                });
                ticking = true;
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', onScroll, { passive: true });
                    update(); // Initial calculation
                } else {
                    window.removeEventListener('scroll', onScroll);
                }
            });
        }, { rootMargin: '100px 0px' });

        observer.observe(el);
        // Initial calculation in case element is already visible
        update();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollReveal);
    } else {
        initScrollReveal();
    }
})();
