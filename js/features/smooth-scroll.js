// حل شامل لمشكلة التمرير السلس لجميع الأجهزة
// يعمل من أي صفحة إلى نموذج "أضف منتجك" في الصفحة الرئيسية

// الدالة الرئيسية للتمرير
function scrollToProductRequestSection() {
    console.log('🎯 Scrolling to product request section...');
    
    // التحقق من أننا في الصفحة الرئيسية
    if (isMainPage()) {
        // نحن في الصفحة الرئيسية، يمكننا التمرير مباشرة
        console.log('📍 Already on main page, scrolling directly...');
        scrollToSectionInCurrentPage();
    } else {
        // نحن في صفحة أخرى، نحتاج للتوجيه إلى الصفحة الرئيسية
        console.log('🔄 Redirecting to main page...');
        redirectToMainPage();
    }
}

// التحقق من أننا في الصفحة الرئيسية
function isMainPage() {
    const path = window.location.pathname;
    return path.endsWith('index.html') || path.endsWith('/') || path === '';
}

// التوجيه إلى الصفحة الرئيسية مع hash
function redirectToMainPage() {
    // حفظ معلومات التمرير في sessionStorage
    sessionStorage.setItem('scrollToSection', 'product-request-section');
    
    // التوجيه إلى الصفحة الرئيسية
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// التمرير إلى القسم في الصفحة الحالية
function scrollToSectionInCurrentPage() {
    const productRequestSection = document.getElementById('product-request-section');
    if (!productRequestSection) {
        console.error('❌ Product request section not found!');
        return;
    }
    
    // إغلاق القائمة المتحركة إذا كانت مفتوحة
    closeMobileMenu();
    
    // حساب الإزاحة الصحيحة مع مراعاة الهيدر اللاصق
    const targetPosition = calculateTargetPosition(productRequestSection);
    console.log(`🎯 Target scroll position: ${targetPosition}px`);
    
    // التمرير السلس
    performSmoothScroll(targetPosition);
}

// إغلاق القائمة المتحركة
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        console.log('📱 Closed mobile menu');
    }
}

// حساب الموضع المستهدف مع مراعاة الهيدر
function calculateTargetPosition(section) {
    const header = document.querySelector('header.sticky, header');
    const headerHeight = header ? header.offsetHeight : 0;
    const sectionTop = section.offsetTop;
    const offset = 20; // هامش إضافي
    
    return Math.max(0, sectionTop - headerHeight - offset);
}

// تنفيذ التمرير السلس - محسن لمنع scroll snap-back/jank
function performSmoothScroll(targetPosition) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    try {
        // استخدام التمرير الفوري دائماً لتجنب مشاكل scroll snap-back/jank
        window.scrollTo({
            top: targetPosition,
            behavior: 'auto'
        });
        console.log('✅ Instant scroll completed (optimized to prevent jank)');
        
        // التأكد من الوصول للموضع الصحيح
        verifyScrollPosition(targetPosition);
    } catch (error) {
        console.warn('Scroll failed, using fallback:', error);
        // fallback
        window.scrollTo(0, targetPosition);
    }
}

// التحقق من الوصول للموضع الصحيح
function verifyScrollPosition(targetPosition) {
    setTimeout(() => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const difference = Math.abs(currentScroll - targetPosition);
        
        if (difference > 10) {
            console.log('⚠️ Scroll position not accurate, correcting...');
            window.scrollTo({
                top: targetPosition,
                behavior: 'auto'
            });
        }
        
        console.log('✅ Smooth scroll completed');
    }, 800);
}

// إضافة CSS لتحسين التمرير
function addScrollStyles() {
    // تجنب إضافة CSS مكرر
    if (document.getElementById('smooth-scroll-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'smooth-scroll-styles';
    style.textContent = `
        /* تحسين التمرير السلس - محسن لمنع scroll snap-back/jank */
        html {
            scroll-behavior: auto; /* تغيير من smooth إلى auto */
            scroll-padding-top: 80px;
        }
        
        /* تحسين التمرير على الأجهزة المحمولة */
        @media (max-width: 768px) {
            html {
                scroll-padding-top: 70px;
                scroll-behavior: auto; /* تأكيد على auto */
            }
        }
        
        /* تأثير بصري للقسم المستهدف */
        #product-request-section {
            scroll-margin-top: 80px;
        }
        
        @media (max-width: 768px) {
            #product-request-section {
                scroll-margin-top: 70px;
            }
        }
        
        /* تحسين التمرير على iOS */
        @supports (-webkit-overflow-scrolling: touch) {
            html {
                -webkit-overflow-scrolling: touch;
            }
        }
    `;
    document.head.appendChild(style);
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {

    
    addScrollStyles();
    
    // إضافة event listeners لجميع أزرار "أضف منتجك"
    setupAddProductButtons();
    
    // التحقق من الحاجة للتمرير عند تحميل الصفحة
    checkForScrollOnLoad();
});

// إعداد أزرار "أضف منتجك"
function setupAddProductButtons() {
    const addProductButtons = document.querySelectorAll('[onclick*="scrollToProductRequestSection"]');

    
    addProductButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            scrollToProductRequestSection();
        });
    });
}

// التحقق من الحاجة للتمرير عند تحميل الصفحة
function checkForScrollOnLoad() {
    // التحقق من وجود hash في URL
    if (window.location.hash === '#product-request-section') {

        setTimeout(() => {
            scrollToSectionInCurrentPage();
        }, 500);
        return;
    }
    
    // التحقق من sessionStorage
    const scrollToSection = sessionStorage.getItem('scrollToSection');
    if (scrollToSection === 'product-request-section') {

        sessionStorage.removeItem('scrollToSection'); // تنظيف
        
        setTimeout(() => {
            scrollToSectionInCurrentPage();
        }, 300);
    }
}

// معالجة التغييرات في hash
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#product-request-section') {

        setTimeout(() => {
            scrollToSectionInCurrentPage();
        }, 100);
    }
});

// معالجة التمرير عند تحميل الصفحة
window.addEventListener('load', function() {
    // تأخير إضافي للتأكد من اكتمال تحميل الصفحة
    setTimeout(() => {
        if (window.location.hash === '#product-request-section') {

            scrollToSectionInCurrentPage();
        }
    }, 200);
});

// تصدير الدالة للاستخدام العام
window.scrollToProductRequestSection = scrollToProductRequestSection;
