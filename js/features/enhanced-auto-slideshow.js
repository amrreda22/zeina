// نظام العرض المتحرك التلقائي المحسن للمنتجات
class EnhancedAutoSlideshow {
    constructor() {
        this.slideInterval = 3000; // 3 ثواني بين كل صورة (أسرع للمنتجات مع 3+ صور)
        this.fadeDuration = 600; // 0.6 ثانية للانتقال (أسرع)
        this.supabase = window.supabaseClient || null;
        this.init();
    }

    init() {
        this.addEnhancedStyles();
        this.setupSlideshows();
        this.observeDOMChanges();
    }

    addEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* حاوية الصور المحسنة */
            .enhanced-slideshow-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                border-radius: 8px;
                background: #f8f8f8;
            }
            
            /* الصور في العرض التلقائي المحسن */
            .enhanced-slideshow-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.8s ease-in-out;
                transform: scale(1.05);
            }
            
            .enhanced-slideshow-image.active {
                opacity: 1;
                transform: scale(1);
            }
            
            /* تأثيرات انتقالية محسنة */
            .enhanced-fade-in {
                animation: enhancedFadeIn 0.8s ease-in-out;
            }
            
            @keyframes enhancedFadeIn {
                from { 
                    opacity: 0;
                    transform: scale(1.1);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .enhanced-slide-in {
                animation: enhancedSlideIn 0.8s ease-in-out;
            }
            
            @keyframes enhancedSlideIn {
                from { 
                    opacity: 0;
                    transform: translateX(30px) scale(1.05);
                }
                to { 
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }
            
            .enhanced-zoom-in {
                animation: enhancedZoomIn 0.8s ease-in-out;
            }
            
            @keyframes enhancedZoomIn {
                from { 
                    opacity: 0;
                    transform: scale(0.9);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* تحسين حجم الصور في بطاقات المنتجات */
            .product-card .relative {
                height: 280px !important;
                min-height: 280px;
            }
            
            .product-card .relative img,
            .product-card .enhanced-slideshow-container {
                height: 280px !important;
                min-height: 280px;
            }
            
            /* تحسين جودة الصور */
            .enhanced-slideshow-image {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }
            
            /* تأثيرات إضافية للبطاقات */
            .product-card {
                transition: all 0.4s ease;
            }
            
            .product-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 12px 30px rgba(0,0,0,0.15);
            }
            
            /* تحسين عرض الصور المتعددة */
            .multiple-images-badge {
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                backdrop-filter: blur(10px);
                z-index: 5;
            }
            
            /* تحسين حالة التحميل */
            .slideshow-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #d4af37;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                z-index: 10;
            }
            
            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setupSlideshows() {
        // البحث عن بطاقات المنتجات
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, cardIndex) => {
            const imageContainer = card.querySelector('.relative');
            if (!imageContainer) return;
            
            const mainImage = imageContainer.querySelector('img');
            if (!mainImage) return;
            
            // الحصول على معرف المنتج من البطاقة
            const productId = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (!productId) return;
            
            // البحث عن المنتج في البيانات المحلية
            this.getProductImages(productId).then(imageUrls => {
                if (imageUrls && imageUrls.length > 1) {
                    this.createEnhancedSlideshow(imageContainer, mainImage, imageUrls, cardIndex);
                }
            });
        });
    }

    async getProductImages(productId) {
        try {
            // محاولة الحصول من البيانات المحلية أولاً
            if (window.allProducts) {
                const product = window.allProducts.find(p => p.id === productId);
                if (product && product.image_urls) {
                    return product.image_urls;
                }
            }
            
            // إذا لم تكن متاحة محلياً، جلب من قاعدة البيانات
            const { data, error } = await this.supabase
                .from('products')
                .select('image_urls')
                .eq('id', productId)
                .single();
            
            if (error) {
                console.error('خطأ في جلب صور المنتج:', error);
                return null;
            }
            
            return data.image_urls || [];
        } catch (error) {
            console.error('خطأ في جلب صور المنتج:', error);
            return null;
        }
    }

    createEnhancedSlideshow(container, mainImage, imageUrls, index) {
        // إنشاء حاوية العرض المتحرك المحسنة
        const slideshowContainer = document.createElement('div');
        slideshowContainer.className = 'enhanced-slideshow-container';
        slideshowContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        // إضافة مؤشر التحميل
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'slideshow-loading';
        slideshowContainer.appendChild(loadingIndicator);
        
        // إنشاء جميع الصور
        imageUrls.forEach((url, imgIndex) => {
            const slideImage = document.createElement('img');
            slideImage.src = url;
            slideImage.alt = mainImage.alt;
            slideImage.className = `enhanced-slideshow-image ${imgIndex === 0 ? 'active' : ''}`;
            slideImage.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            
            // إضافة معالج حدث لتحميل الصورة
            slideImage.onload = () => {
                if (imgIndex === 0) {
                    loadingIndicator.style.display = 'none';
                }
            };
            
            slideImage.onerror = () => {
                slideImage.src = 'https://placehold.co/300x200/EEE/31343C?text=خطأ+في+تحميل+الصورة';
            };
            
            slideshowContainer.appendChild(slideImage);
        });
        
        // إضافة شارة الصور المتعددة (محسنة للمنتجات مع 3+ صور)
        if (imageUrls.length > 1) {
            const multipleImagesBadge = document.createElement('div');
            multipleImagesBadge.className = 'multiple-images-badge';
            multipleImagesBadge.textContent = `${imageUrls.length} صور`;
            multipleImagesBadge.style.cssText = `
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                backdrop-filter: blur(10px);
                z-index: 5;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            slideshowContainer.appendChild(multipleImagesBadge);
        }
        
        // إضافة الحاوية للصورة الرئيسية
        container.appendChild(slideshowContainer);
        
        // إخفاء الصورة الأصلية
        mainImage.style.opacity = '0';
        
        // بدء العرض المتحرك التلقائي
        this.startEnhancedSlideshow(slideshowContainer, imageUrls, index);
    }

    startEnhancedSlideshow(container, images, index) {
        let currentSlide = 0;
        const slideImages = container.querySelectorAll('.enhanced-slideshow-image');
        
        if (slideImages.length <= 1) return;
        
        const showSlide = (slideIndex) => {
            // إخفاء جميع الصور
            slideImages.forEach(img => {
                img.classList.remove('active', 'enhanced-fade-in', 'enhanced-slide-in', 'enhanced-zoom-in');
            });
            
            // إظهار الصورة الحالية
            if (slideImages[slideIndex]) {
                slideImages[slideIndex].classList.add('active');
                
                // إضافة تأثير عشوائي محسن للمنتجات مع 3+ صور
                const effects = ['enhanced-fade-in', 'enhanced-slide-in', 'enhanced-zoom-in'];
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                slideImages[slideIndex].classList.add(randomEffect);
                
                // تحسين الأداء للصور المتعددة
                slideImages[slideIndex].style.willChange = 'opacity, transform';
            }
            
            currentSlide = slideIndex;
        };
        
        const nextSlide = () => {
            const next = (currentSlide + 1) % slideImages.length;
            showSlide(next);
        };
        
        // بدء العرض التلقائي مع توقيت عشوائي محسن للمنتجات مع 3+ صور
        const baseInterval = this.slideInterval;
        const randomInterval = () => {
            const min = baseInterval - 500; // 2.5 ثانية
            const max = baseInterval + 1000; // 4 ثواني
            return Math.random() * (max - min) + min;
        };
        
        const startNextSlide = () => {
            nextSlide();
            const nextInterval = randomInterval();
            container.dataset.nextSlideTimeout = setTimeout(startNextSlide, nextInterval);
        };
        
        // بدء العرض التلقائي
        const initialInterval = randomInterval();
        container.dataset.nextSlideTimeout = setTimeout(startNextSlide, initialInterval);
        
        // إضافة معالج أحداث لإيقاف العرض عند عدم رؤية البطاقة (محسن للمنتجات مع 3+ صور)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // إعادة تشغيل العرض التلقائي
                    if (container.dataset.nextSlideTimeout) {
                        clearTimeout(parseInt(container.dataset.nextSlideTimeout));
                    }
                    const nextInterval = randomInterval();
                    container.dataset.nextSlideTimeout = setTimeout(startNextSlide, nextInterval);
                } else {
                    // إيقاف العرض التلقائي
                    if (container.dataset.nextSlideTimeout) {
                        clearTimeout(parseInt(container.dataset.nextSlideTimeout));
                    }
                }
            });
        }, { threshold: 0.2, rootMargin: '50px' });
        
        observer.observe(container);
        
        console.log(`تم بدء العرض المتحرك التلقائي المحسن للمعرض ${index} مع ${slideImages.length} صور (محسن للمنتجات مع 3+ صور)`);
    }

    observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const newProductCards = node.querySelectorAll ? 
                                node.querySelectorAll('.product-card') : 
                                (node.matches && node.matches('.product-card') ? [node] : []);
                            
                            if (newProductCards.length > 0) {
                                setTimeout(() => {
                                    this.setupSlideshows();
                                }, 200);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// تهيئة العرض المتحرك التلقائي المحسن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedAutoSlideshow = new EnhancedAutoSlideshow();
});

// تصدير الكلاس للاستخدام الخارجي
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAutoSlideshow;
} 