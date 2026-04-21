/**
 * إصلاح مشكلة التكرار في هيدارات صفحات التصنيف
 * يزيل التكرار ويحسن تجربة المستخدم في الشاشات المتوسطة
 */

document.addEventListener('DOMContentLoaded', function() {
    // إصلاح مشكلة CSS في space-x
    fixSpaceXIssues();
    
    // إصلاح مشكلة التكرار في الشاشات المتوسطة
    fixMediumScreenDuplication();
});

function fixSpaceXIssues() {
    // إصلاح جميع العناصر التي تحتوي على space-x و space-x-reverse معاً
    const elementsWithSpaceX = document.querySelectorAll('[class*="space-x"][class*="space-x-reverse"]');
    
    elementsWithSpaceX.forEach(element => {
        const classes = element.className.split(' ');
        const hasSpaceX = classes.some(cls => cls.startsWith('space-x-') && !cls.includes('reverse'));
        const hasSpaceXReverse = classes.some(cls => cls.startsWith('space-x-reverse'));
        
        if (hasSpaceX && hasSpaceXReverse) {
            // إزالة space-x وإبقاء space-x-reverse مع إضافة space-x مناسب
            const newClasses = classes.map(cls => {
                if (cls.startsWith('space-x-') && !cls.includes('reverse')) {
                    // استخراج الرقم من space-x-6 مثلاً
                    const match = cls.match(/space-x-(\d+)/);
                    if (match) {
                        return `space-x-reverse space-x-${match[1]}`;
                    }
                }
                return cls;
            });
            
            element.className = newClasses.join(' ');
        }
    });
}

function fixMediumScreenDuplication() {
    // البحث عن عناصر الهيدر
    const desktopNav = document.querySelector('nav.hidden');
    const desktopButtons = document.querySelector('.hidden[class*="space-x"]');
    const mobileMenuBtn = document.querySelector('[id="mobile-menu-btn"]');
    const mobileMenu = document.querySelector('[id="mobile-menu"]');
    
    if (desktopNav) {
        // تغيير Desktop Navigation من lg إلى md
        if (desktopNav.className.includes('lg:flex')) {
            desktopNav.className = desktopNav.className.replace('lg:flex', 'md:flex');
        }
    }
    
    if (desktopButtons) {
        // تغيير Desktop Buttons من md إلى lg
        if (desktopButtons.className.includes('md:flex')) {
            desktopButtons.className = desktopButtons.className.replace('md:flex', 'lg:flex');
        }
    }
    
    if (mobileMenuBtn) {
        // تغيير Mobile Menu Button من lg إلى lg (يبقى كما هو)
        const parent = mobileMenuBtn.closest('div');
        if (parent && parent.className.includes('lg:hidden')) {
            // يبقى lg:hidden لأنه يجب أن يظهر في الشاشات الصغيرة والمتوسطة
        }
    }
    
    if (mobileMenu) {
        // تغيير Mobile Menu من lg إلى lg (يبقى كما هو)
        if (mobileMenu.className.includes('lg:hidden')) {
            // يبقى lg:hidden لأنه يجب أن يظهر في الشاشات الصغيرة والمتوسطة
        }
    }
}

// إضافة CSS مخصص لتحسين العرض في الشاشات المتوسطة
function addCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* تحسين العرض في الشاشات المتوسطة */
        @media (min-width: 768px) and (max-width: 1023px) {
            /* إخفاء الأزرار في الشاشات المتوسطة لتجنب التكرار */
            .desktop-buttons-medium {
                display: none !important;
            }
            
            /* تحسين المسافات في Navigation */
            nav.hidden.md\\:flex {
                gap: 1rem;
            }
        }
        
        /* إصلاح مشكلة space-x-reverse */
        .space-x-reverse > * + * {
            margin-right: var(--tw-space-x-reverse);
            margin-left: 0;
        }
    `;
    document.head.appendChild(style);
}

// تشغيل الإصلاحات
addCustomCSS();
