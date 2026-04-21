/* state module for other */

/* state prelude */

/* Legacy category logic extracted from pages/category-other.html */

/*
        ========================================
        تحسين عرض المدن والمحافظات في البطاقات
        ========================================
        
        المشكلة: كانت البطاقات تعرض "جميع المدن" عند عدم اختيار مدينة
        الحل: إخفاء خانة المدينة عند عدم الاختيار أو عند وجود قيم فارغة
        
        التعديلات المطبقة:
        1. إخفاء خانة المدينة عند عدم الاختيار
        2. إخفاء خانة المحافظة عند عدم الاختيار
        3. تنظيف البيانات من القيم الفارغة مثل 'null', 'undefined', 'جميع المدن'
        4. دعم جميع الأجهزة (هواتف، ألواح، شاشات كبيرة)
        5. تحسين الفلاتر لتعمل مع البيانات النظيفة فقط
        
        تاريخ التعديل: 2024
        ========================================
        */
        
        let allProducts = [];
        let filteredProducts = [];
        let currentPage = 1;
        const productsPerPage = 18;
        let currentFilter = 'all';
        let governorateFilter;
        let subcategoryFilter;
        let activeFilters = {
            subcategory: [],
            governorate: [],
            cities: [],
            price: ''
        };

        // دالة مساعدة لتنظيف بيانات الموقع

