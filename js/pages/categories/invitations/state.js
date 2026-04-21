/* state module for invitations */

/* state prelude */

/* Legacy category logic extracted from pages/category-invitations.html */

// Mobile menu functionality
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // تحميل وعرض المنتجات
        let allProducts = [];
        let filteredProducts = [];
        let currentPage = 1;
        const productsPerPage = 18;

        // تحميل المنتجات من Supabase

