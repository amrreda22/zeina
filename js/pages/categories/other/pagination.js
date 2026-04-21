/* pagination module for other */

function scrollToTop() {
            // التمرير الفوري أولاً
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            
            // محاولة التمرير السلس للشاشات الكبيرة
            try {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                // في حالة عدم دعم التمرير السلس، استخدم التمرير العادي
                window.scrollTo(0, 0);
            }
            
            // فحص إضافي مع تأخير للتأكد من النجاح
            setTimeout(() => {
                // التأكد من الوصول لأعلى الصفحة
                if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
                    // إجبار التمرير إذا لم ينجح
                    window.scrollTo(0, 0);
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    
                    // محاولة أخرى بطريقة مختلفة
                    try {
                        document.querySelector('body').scrollIntoView({ 
                            behavior: 'auto', 
                            block: 'start' 
                        });
                    } catch (e) {
                        // محاولة أخيرة
                        window.location.hash = '';
                        window.scrollTo(0, 0);
                    }
                }
            }, 100);
            
            // فحص نهائي بعد فترة أطول للأجهزة البطيئة
            setTimeout(() => {
                if (window.pageYOffset > 50) {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                }
            }, 300);
        }

