/* state module for koshat */

/* state prelude */

/* Legacy category logic extracted from pages/category-koshat.html */

let allProducts = [];
        let currentFilter = 'all';
        let selectedCitiesContainer = null;
        let currentPage = 1;
        const productsPerPage = 18;
        const sliderState = new Map();
        let sortOption = 'latest';
        let extrasText = '';
        let priceMin = null;
        let priceMax = null;

        let activeFilters = {
            subcategory: [],
            governorate: [],
            cities: [],
            price: ''
        };

        // قراءة معلمات الاستعلام وتطبيقها على الفلاتر

