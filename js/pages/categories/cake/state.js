/* state module for cake */

/* state prelude */

/* Legacy category logic extracted from pages/category-cake.html */

let allProducts = [];
        const sliderState = new Map();
        let filteredProducts = [];
        let currentFilter = 'all';
        let governorateFilter;
        let subcategoryFilter;
        let selectedCitiesContainer = null;
        let activeFilters = {
            subcategory: [],
            governorate: [],
            cities: [],
            price: ''
        };
        
        // إعدادات ترقيم الصفحات
        const PRODUCTS_PER_PAGE = 18;
        let currentPage = 1;
        let totalPages = 1;

        // Global functions for cities filter

