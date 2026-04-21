        // إخفاء الزر العائم في صفحة إضافة المنتج
        function hideFloatingButtonOnAddProductPage() {
            // التحقق من أننا في الصفحة الرئيسية
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
                // إظهار الزر العائم في الصفحة الرئيسية
                const floatingBtn = document.getElementById('floating-add-product-btn');
                if (floatingBtn) {
                    floatingBtn.style.display = 'block';
                }
            } else {
                // إخفاء الزر العائم في الصفحات الأخرى
                const floatingBtn = document.getElementById('floating-add-product-btn');
                if (floatingBtn) {
                    floatingBtn.style.display = 'none';
                }
            }
        }

        // تشغيل الدالة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', hideFloatingButtonOnAddProductPage);
        
        // تشغيل الدالة أيضاً عند تغيير الصفحة (للصفحات التي تستخدم JavaScript routing)
        window.addEventListener('popstate', hideFloatingButtonOnAddProductPage);
    

