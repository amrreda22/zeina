/* filters module for koshat */

function sortProductsByCriteria() {
            if (allProducts && allProducts.length > 0) {
                if (sortOption === 'price_asc') {
                    allProducts.sort((a,b)=>{
                        const pa = parseFloat(a.price); const pb = parseFloat(b.price);
                        const va = isNaN(pa)||pa===0 ? Infinity : pa;
                        const vb = isNaN(pb)||pb===0 ? Infinity : pb;
                        return va - vb;
                    });
                } else if (sortOption === 'price_desc') {
                    allProducts.sort((a,b)=>{
                        const pa = parseFloat(a.price); const pb = parseFloat(b.price);
                        const va = isNaN(pa)||pa===0 ? -1 : pa;
                        const vb = isNaN(pb)||pb===0 ? -1 : pb;
                        return vb - va;
                    });
                } else if (sortOption === 'rating_desc') {
                    allProducts.sort((a,b)=> (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0));
                } else {
                    allProducts.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
                }
                

            }
        }

        // Setup toggle filters functionality

function setupToggleFilters() {
            const toggleBtn = document.getElementById('toggle-filters-btn');
            const filterSection = document.getElementById('filter-section');

            // الانتقال إلى صفحة الفلاتر المستقلة مع تمرير الحالة الحالية كمعلمات رابط
            function buildFiltersQueryString() {
                const params = new URLSearchParams();
                if (activeFilters && Array.isArray(activeFilters.subcategory)) {
                    activeFilters.subcategory.forEach(v => params.append('subcat', v));
                }
                if (activeFilters && Array.isArray(activeFilters.governorate)) {
                    activeFilters.governorate.forEach(v => params.append('gov', v));
                }
                if (activeFilters && Array.isArray(activeFilters.cities)) {
                    activeFilters.cities.forEach(v => params.append('city', v));
                }
                // تحويل فلتر السعر الحالي إلى حد أدنى/أقصى متوافق مع صفحة الفلاتر
                switch (activeFilters?.price) {
                    case '0-500':
                        params.set('pmin', '0'); params.set('pmax', '500');
                        break;
                    case '500-1000':
                        params.set('pmin', '501'); params.set('pmax', '1000');
                        break;
                    case '1000-2000':
                        params.set('pmin', '1001'); params.set('pmax', '2000');
                        break;
                    case '2000+':
                        params.set('pmin', '2001');
                        break;
                    case 'negotiable':
                        params.set('pmin', '0'); params.set('pmax', '0');
                        break;
                }
                return params.toString();
            }
            
            function navigateToFilters() {
                const qs = buildFiltersQueryString();
                window.location.href = `../filters/koshat-filters.html${qs ? '?' + qs : ''}`;
            }
            
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateToFilters();
            });
            
            filterSection.addEventListener('click', function(e) {
                // منع الانتقال عند النقر على زر مسح الفلاتر أو الفلاتر النشطة
                if (e.target.id === 'clear-filters-btn' || 
                    e.target.closest('#clear-filters-btn') ||
                    e.target.closest('#active-filters') ||
                    e.target.closest('.active-filter-tag') ||
                    e.target.closest('.remove-filter')) {
                    return;
                }
                navigateToFilters();
            });
        }















        // Setup advanced filters

function setupAdvancedFilters() {
            // Clear filters button
            document.getElementById('clear-filters-btn').addEventListener('click', function() {
                clearAllFilters();
            });
        }

        // Apply all filters

function applyFilters(resetPage = true) {
            console.log('applyFilters called with resetPage:', resetPage, 'currentPage:', currentPage);
            let filteredProducts = allProducts;

            // Apply subcategory filter
            if (activeFilters.subcategory.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    // خريطة تحويل النصوص العربية إلى أكواد
                    const arabicToCodeMap = {
                        'كوشات زفاف': 'koshat-wedding',
                        'كوشات خطوبة': 'koshat-engagement'
                    };
                    
                    // خريطة تحويل الأكواد إلى نصوص عربية
                    const codeToArabicMap = {
                        'koshat-wedding': 'كوشات زفاف',
                        'koshat-engagement': 'كوشات خطوبة'
                    };
                    
                    // Handle different subcategory formats
                    let productSubcategories = [];
                    
                    if (product.subcategory) {
                        if (Array.isArray(product.subcategory)) {
                            productSubcategories = product.subcategory;
                        } else if (typeof product.subcategory === 'string') {
                            try {
                                const parsed = JSON.parse(product.subcategory);
                                if (Array.isArray(parsed)) {
                                    productSubcategories = parsed;
                                }
                            } catch (error) {
                                // If it's not JSON, treat as single value
                                productSubcategories = [product.subcategory];
                            }
                        }
                    }
                    
                    // Check if any of the selected subcategories match the product's subcategories
                    return activeFilters.subcategory.some(selectedCode => {
                        // Check direct match with code
                        if (productSubcategories.includes(selectedCode)) {
                            return true;
                        }
                        
                        // Check match with Arabic text
                        const selectedArabic = codeToArabicMap[selectedCode];
                        if (selectedArabic && productSubcategories.includes(selectedArabic)) {
                            return true;
                        }
                        
                        // Check if product has Arabic text that matches the selected code
                        return productSubcategories.some(productSub => {
                            const productCode = arabicToCodeMap[productSub];
                            return productCode === selectedCode;
                        });
                    });
                });
            }

            // Apply governorate filter
            if (activeFilters.governorate.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    if (product.governorate) {
                        const productGovernorates = product.governorate.split(',').map(g => g.trim());
                        return activeFilters.governorate.some(selected => 
                            productGovernorates.some(productGov => 
                                productGov.includes(selected)
                            )
                        );
                    }
                    return false;
                });
            }

            // Apply cities filter
            if (activeFilters.cities.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    if (product.cities) {
                        const productCities = product.cities.split(',').map(c => c.trim());
                        return activeFilters.cities.some(selected => 
                            productCities.some(productCity => 
                                productCity.includes(selected)
                            )
                        );
                    }
                    return false;
                });
            }

            // Apply price filter
            if (activeFilters.price) {
                filteredProducts = filteredProducts.filter(product => {
                    const price = parseFloat(product.price) || 0;
                    
                    switch (activeFilters.price) {
                        case '0-500':
                            return price > 0 && price <= 500;
                        case '500-1000':
                            return price > 500 && price <= 1000;
                        case '1000-2000':
                            return price > 1000 && price <= 2000;
                        case '2000+':
                            return price > 2000;
                        case 'negotiable':
                            return price === 0 || !product.price;
                        default:
                            return true;
                    }
                });
            }

            // نطاق سعر مخصص من معلمات الاستعلام
            if (!activeFilters.price && (priceMin !== null || priceMax !== null)) {
                filteredProducts = filteredProducts.filter(product => {
                    const price = parseFloat(product.price) || 0;
                    if (priceMin !== null && price < priceMin) return false;
                    if (priceMax !== null && price > priceMax) return false;
                    return true;
                });
            }

            // نص مزايا/بحث إضافي
            if (extrasText && extrasText.trim() !== '') {
                const q = extrasText.toLowerCase();
                filteredProducts = filteredProducts.filter(product => {
                    const t = ((product.title||'') + ' ' + (product.description||'')).toLowerCase();
                    return t.includes(q);
                });
            }

            // Reset to first page when filters change (only if resetPage is true)
            if (resetPage) {
                currentPage = 1;
                updateURL();
            }

            displayProducts(filteredProducts);
            updateActiveFiltersDisplay();
            
            // Update URL to reflect current page
            updateURL();
        }

        // Clear all filters

function clearAllFilters() {
            // Reset active filters object
            activeFilters = {
                subcategory: [],
                governorate: [],
                cities: [],
                price: ''
            };

            // Clear active filters display
            document.getElementById('active-filters').innerHTML = '';

            // Reset to first page
            currentPage = 1;
            updateURL();

            // Apply filters
            applyFilters();
        }

        // Update active filters display

function updateActiveFiltersDisplay() {
            const activeFiltersContainer = document.getElementById('active-filters');
            const filters = [];

            // Add subcategory filters
            if (activeFilters.subcategory.length > 0) {
                const subcategoryMap = {
                    'koshat-wedding': 'كوشات زفاف',
                    'koshat-engagement': 'كوشات خطوبة'
                };
                
                activeFilters.subcategory.forEach(subcat => {
                    const displayName = subcategoryMap[subcat] || subcat;
                    filters.push({
                        type: 'subcategory',
                        value: subcat,
                        displayName: displayName
                    });
                });
            }

            // Add governorate filters
            if (activeFilters.governorate.length > 0) {
                activeFilters.governorate.forEach(gov => {
                    filters.push({
                        type: 'governorate',
                        value: gov,
                        displayName: gov
                    });
                });
            }

            // Add cities filters
            if (activeFilters.cities.length > 0) {
                activeFilters.cities.forEach(city => {
                    filters.push({
                        type: 'cities',
                        value: city,
                        displayName: city
                    });
                });
            }

            // Add price filter
            if (activeFilters.price) {
                const priceMap = {
                    '0-500': 'حتى 500 ج.م',
                    '500-1000': '500 - 1000 ج.م',
                    '1000-2000': '1000 - 2000 ج.م',
                    '2000+': 'أكثر من 2000 ج.م',
                    'negotiable': 'السعر عند الطلب'
                };
                
                filters.push({
                    type: 'price',
                    value: activeFilters.price,
                    displayName: priceMap[activeFilters.price] || activeFilters.price
                });
            }

            // Render filters
            if (filters.length > 0) {
                activeFiltersContainer.innerHTML = filters.map(filter => `
                    <div class="active-filter-tag">
                        <span>${filter.displayName}</span>
                        <button class="remove-filter" onclick="removeFilter('${filter.type}', '${filter.value}')">×</button>
                    </div>
                `).join('');
            } else {
                activeFiltersContainer.innerHTML = '';
            }
        }

        // Remove individual filter

function removeFilter(type, value) {
            if (type === 'subcategory') {
                activeFilters.subcategory = activeFilters.subcategory.filter(item => item !== value);
            } else if (type === 'governorate') {
                removeGovernorate(value);
                return; // removeGovernorate already calls applyFilters
            } else if (type === 'cities') {
                removeCity(value);
                return; // removeCity already calls applyFilters
            } else if (type === 'price') {
                activeFilters.price = '';
            }

            currentPage = 1;
            updateURL();
            applyFilters();
            updateActiveFiltersDisplay();
        }

        // Remove governorate filter

function removeGovernorate(governorate) {
            activeFilters.governorate = activeFilters.governorate.filter(g => g !== governorate);
            currentPage = 1;
            updateURL();
            applyFilters();
            updateActiveFiltersDisplay();
        }

        // Remove city filter

function removeCity(city) {
            activeFilters.cities = activeFilters.cities.filter(c => c !== city);
            currentPage = 1;
            updateURL();
            applyFilters();
            updateActiveFiltersDisplay();
        }





        // Display products with pagination

function updateURL() {
            const url = new URL(window.location);
            if (currentPage > 1) {
                url.searchParams.set('page', currentPage);
            } else {
                url.searchParams.delete('page');
            }
            window.history.replaceState({}, '', url);
        }

        // التمرير لأعلى الصفحة - محسنة للأجهزة المحمولة


