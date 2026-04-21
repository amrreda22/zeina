// تحسين التمرير ومنع scroll snap-back/jank
// إضافة CSS لتعطيل scroll-snap غير المقصود

function addScrollOptimizationStyles() {
    // تجنب إضافة CSS مكرر
    if (document.getElementById('scroll-optimization-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'scroll-optimization-styles';
    style.textContent = `
        /* تعطيل scroll-snap غير المقصود لمنع scroll snap-back/jank */
        html, body, .wrapper, .sections, [class*="section"] {
            scroll-snap-type: none !important;
            scroll-snap-align: none !important;
            scroll-snap-stop: normal !important;
        }
        
        /* تعطيل scroll-behavior: smooth العام لمنع التعارض */
        :root {
            scroll-behavior: auto !important;
        }
        
        html, body {
            scroll-behavior: auto !important;
        }
        
        /* تحسين التمرير على الأجهزة المحمولة */
        @media (max-width: 768px) {
            html, body {
                scroll-behavior: auto !important;
                -webkit-overflow-scrolling: touch;
            }
        }
        
        /* تحسين overscroll-behavior */
        * {
            overscroll-behavior: auto;
        }
        
        /* تحسين التمرير في الحاويات */
        .overflow-container, [class*="overflow"] {
            overscroll-behavior: contain;
        }
        
        /* تحسين التمرير في النوافذ المنبثقة */
        .modal, .popup, .dropdown {
            overscroll-behavior: contain;
        }
    `;
    document.head.appendChild(style);
}

// تحسين مستمعات التمرير
function optimizeScrollListeners() {
    let ticking = false;
    
    // إضافة مستمع التمرير المحسن
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                // تحديث UI فقط هنا، بدون scrollTo/scrollBy
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // إضافة مستمع للعجلة
    window.addEventListener('wheel', (e) => {
        // لا نستخدم preventDefault() إلا للضرورة القصوى
    }, { passive: true });
    
    // إضافة مستمع لللمس
    window.addEventListener('touchmove', (e) => {
        // لا نستخدم preventDefault() إلا للضرورة القصوى
    }, { passive: true });
}

// تحسين ملف smooth-scroll.js
function optimizeSmoothScroll() {
    // تعديل دالة performSmoothScroll لتجنب التعارض
    if (window.performSmoothScroll) {
        const originalPerformSmoothScroll = window.performSmoothScroll;
        window.performSmoothScroll = function(targetPosition) {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            try {
                // استخدام التمرير الفوري لتجنب المشاكل
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'auto'
                });
                console.log('✅ Instant scroll completed (optimized)');
            } catch (error) {
                console.warn('Scroll failed:', error);
                // fallback
                window.scrollTo(0, targetPosition);
            }
        };
    }
}

// إزالة CSS المسبب للمشاكل
function removeProblematicCSS() {
    // البحث عن عناصر تحتوي على scroll-snap
    const elementsWithScrollSnap = document.querySelectorAll('[style*="scroll-snap"]');
    elementsWithScrollSnap.forEach(el => {
        const style = el.getAttribute('style');
        if (style) {
            // إزالة scroll-snap properties
            const newStyle = style
                .replace(/scroll-snap-type:\s*[^;]+;?/g, '')
                .replace(/scroll-snap-align:\s*[^;]+;?/g, '')
                .replace(/scroll-snap-stop:\s*[^;]+;?/g, '');
            el.setAttribute('style', newStyle);
        }
    });
    
    // البحث عن عناصر تحتوي على scroll-behavior: smooth
    const elementsWithSmoothScroll = document.querySelectorAll('[style*="scroll-behavior: smooth"]');
    elementsWithSmoothScroll.forEach(el => {
        const style = el.getAttribute('style');
        if (style) {
            // تغيير scroll-behavior إلى auto
            const newStyle = style.replace(/scroll-behavior:\s*smooth/g, 'scroll-behavior: auto');
            el.setAttribute('style', newStyle);
        }
    });
}

// تهيئة التحسينات
function initScrollOptimization() {
    // console.log('🚀 Initializing scroll optimization...');
    
    // إضافة CSS المحسن
    addScrollOptimizationStyles();
    
    // تحسين مستمعات التمرير
    optimizeScrollListeners();
    
    // تحسين smooth scroll
    optimizeSmoothScroll();
    
    // إزالة CSS المسبب للمشاكل
    removeProblematicCSS();
    
    // console.log('✅ Scroll optimization completed');
}

// تشغيل التحسينات عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollOptimization);
} else {
    initScrollOptimization();
}

// تشغيل التحسينات عند تحميل الصفحة بالكامل
window.addEventListener('load', () => {
    // تأخير إضافي للتأكد من اكتمال تحميل جميع العناصر
    setTimeout(removeProblematicCSS, 1000);
});

// تصدير الدوال للاستخدام الخارجي
window.initScrollOptimization = initScrollOptimization;
window.removeProblematicCSS = removeProblematicCSS;
