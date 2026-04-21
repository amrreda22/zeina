/* sliders module for koshat */

function initCardSliders() {
            document.querySelectorAll('#products-container .image-container, #featured-ads-container .image-container').forEach(container => {
                if (container.__sliderInit) return;
                attachSwipe(container);
                container.addEventListener('keydown', onSliderKeyDown);
                container.__sliderInit = true;
            });
        }

function onSliderKeyDown(e) {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const id = this.getAttribute('data-product-id');
            const curr = sliderState.get(id) || 0;
            const delta = e.key === 'ArrowLeft' ? -1 : 1;
            updateCardSlide(this, curr + delta);
        }

function attachSwipe(container) {
            let startX = 0; let deltaX = 0;
            container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; deltaX = 0; }, { passive: true });
            container.addEventListener('touchmove', e => { deltaX = e.touches[0].clientX - startX; }, { passive: true });
            container.addEventListener('touchend', () => {
                if (Math.abs(deltaX) > 30) {
                    const id = container.getAttribute('data-product-id');
                    const curr = sliderState.get(id) || 0;
                    const delta = deltaX > 0 ? -1 : 1;
                    updateCardSlide(container, curr + delta);
                }
            });
        }

function updateCardSlide(container, newIndex) {
            const id = container.getAttribute('data-product-id');
            const imgs = container.querySelectorAll('.slider-image');
            if (!imgs.length) return;
            const total = imgs.length;
            const idx = ((newIndex % total) + total) % total;
            imgs.forEach((img, i) => { if (i === idx) { img.classList.remove('hidden'); } else { img.classList.add('hidden'); } });
            const dots = container.querySelectorAll('.slider-dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            sliderState.set(id, idx);
        }

function handleSliderClick(button, direction) {
            const container = button.closest('.image-container');
            const id = container.getAttribute('data-product-id');
            const curr = sliderState.get(id) || 0;
            updateCardSlide(container, direction === 'prev' ? curr - 1 : curr + 1);
        }

function handleDotClick(dot) {
            const container = dot.closest('.image-container');
            const index = parseInt(dot.getAttribute('data-index')) || 0;
            updateCardSlide(container, index);
        }

        document.addEventListener('click', function(e) {
            const prev = e.target.closest('.slider-prev');
            if (prev) {
                const container = prev.closest('.image-container');
                const id = container.getAttribute('data-product-id');
                const curr = sliderState.get(id) || 0;
                updateCardSlide(container, curr - 1);
                return;
            }
            const next = e.target.closest('.slider-next');
            if (next) {
                const container = next.closest('.image-container');
                const id = container.getAttribute('data-product-id');
                const curr = sliderState.get(id) || 0;
                updateCardSlide(container, curr + 1);
                return;
            }
            const dot = e.target.closest('.slider-dot');
            if (dot) {
                const container = dot.closest('.image-container');
                const index = parseInt(dot.getAttribute('data-index')) || 0;
                updateCardSlide(container, index);
            }
        });

        // Update URL with current page

