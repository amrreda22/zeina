/* state module for mirr */

/* state prelude */

/* Legacy category logic extracted from pages/category-mirr.html */

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

        // Load products on page load
        document.addEventListener('DOMContentLoaded', async function() {
            // قراءة رقم الصفحة من URL
            const urlParams = new URLSearchParams(window.location.search);
            currentPage = parseInt(urlParams.get('page')) || 1;
            
            // التمرير لأعلى إذا كانت الصفحة ليست الأولى
            if (currentPage > 1) {
                setTimeout(() => {
                    scrollToTop();
                }, 100);
            }
            
            // تهيئة الفلاتر من URL (قادمة من صفحة الفلاتر)
            initializeFiltersFromURL();
            
            await loadCategoryProducts();
            
            // تحديث عداد المفضلة عند تحميل الصفحة
            updateFavoritesCountBadge();
        });

        // تهيئة الفلاتر من URL

