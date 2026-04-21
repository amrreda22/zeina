/* filters module for invitations */

function sortProductsByCriteria() {
            if (allProducts && allProducts.length > 0) {
                allProducts.sort((a, b) => {
                    const priceA = parseFloat(a.price);
                    const priceB = parseFloat(b.price);
                    const hasValidPriceA = !isNaN(priceA) && priceA > 0;
                    const hasValidPriceB = !isNaN(priceB) && priceB > 0;
                    
                    // إذا كان أحدهما له سعر والآخر لا، المنتج الذي له سعر يأتي أولاً
                    if (hasValidPriceA && !hasValidPriceB) {
                        return -1; // A يأتي قبل B
                    }
                    if (!hasValidPriceA && hasValidPriceB) {
                        return 1; // B يأتي قبل A
                    }
                    
                    // إذا كان كلاهما له سعر، ترتيب تصاعدي حسب السعر
                    if (hasValidPriceA && hasValidPriceB) {
                        return priceA - priceB;
                    }
                    
                    // إذا كان كلاهما بدون سعر، ترتيب حسب تاريخ الإنشاء
                    return new Date(b.created_at) - new Date(a.created_at);
                });
            }
        }

        // إظهار حالة التحميل

function filterCities(searchTerm) {
            const citiesOptions = document.querySelector('.cities-options');
            const cities = citiesOptions.querySelectorAll('.city-option');
            
            cities.forEach(city => {
                const cityName = city.querySelector('span').textContent;
                if (cityName.toLowerCase().includes(searchTerm.toLowerCase())) {
                    city.style.display = 'flex';
                } else {
                    city.style.display = 'none';
                }
            });
        }

        // Initialize filters when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // إنشاء كائن CitiesService للتأكد من توفره
            if (window.CitiesService && !window.citiesServiceInstance) {
                window.citiesServiceInstance = new window.CitiesService();
    
            }
            
            // Initialize other filters
            setupAdvancedFilters();
            setupToggleFilters();

            // Initialize filters from URL
            initializeFiltersFromURL();
        });

        // Apply all active filters

function applyFilters(resetPage = true) {
            // Start with all products
            let filtered = [...allProducts];
            
            // Apply subcategory filter
            if (activeFilters.subcategory.length > 0) {
                filtered = filtered.filter(product => {
                    // خريطة تحويل النصوص العربية إلى أكواد
                    const arabicToCodeMap = {
                        'دعوة زفاف': 'invitation-wedding',
                        'دعوة خطوبة': 'invitation-engagement',
                        'توزيعات فرح': 'invitation-wedding-distribution',
                        'توزيعات خطوبة': 'invitation-engagement-distribution',
                        'توزيعات بالشوكولاتة': 'invitation-chocolate',
                        'توزيعات بالعطور / البرفان': 'invitation-perfumed',
                        'توزيعات مع هدية صغيره': 'invitation-gift',
                        'توزيعات سبوع': 'invitation-baby-week',
                        'توزيعات أطفال': 'invitation-kids',
                        'توزيعات ورد': 'invitation-flowers',
                        'توزيعات شموع': 'invitation-candles',
                        'دعوة رقمية': 'invitation-digital'
                    };
                    
                    // خريطة تحويل الأكواد إلى نصوص عربية
                    const codeToArabicMap = {
                        'invitation-wedding': 'دعوة زفاف',
                        'invitation-engagement': 'دعوة خطوبة',
                        'invitation-wedding-distribution': 'توزيعات فرح',
                        'invitation-engagement-distribution': 'توزيعات خطوبة',
                        'invitation-chocolate': 'توزيعات بالشوكولاتة',
                        'invitation-perfumed': 'توزيعات بالعطور / البرفان',
                        'invitation-gift': 'توزيعات مع هدية صغيره',
                        'invitation-baby-week': 'توزيعات سبوع',
                        'invitation-kids': 'توزيعات أطفال',
                        'invitation-flowers': 'توزيعات ورد',
                        'invitation-candles': 'توزيعات شموع',
                        'invitation-digital': 'دعوة رقمية'
                    };
                    
                    if (product.subcategory) {
                        let productSubcategories = [];
                        
                        if (Array.isArray(product.subcategory)) {
                            productSubcategories = product.subcategory;
                        } else if (typeof product.subcategory === 'string') {
                            try {
                                const parsed = JSON.parse(product.subcategory);
                                if (Array.isArray(parsed)) {
                                    productSubcategories = parsed;
                                } else {
                                    productSubcategories = [product.subcategory];
                                }
                            } catch (error) {
                                productSubcategories = [product.subcategory];
                            }
                        } else {
                            productSubcategories = [product.subcategory];
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
                    }
                    return false;
                });
            }
            
            // Apply governorate filter
            if (activeFilters.governorates.length > 0) {
                filtered = filtered.filter(product => {
                    if (product.governorate) {
                        const productGovernorates = product.governorate.split(',').map(g => g.trim());
                        return activeFilters.governorates.some(selected => 
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
                filtered = filtered.filter(product => {
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
                filtered = filtered.filter(product => {
                    const price = parseFloat(product.price) || 0;
                    
                    switch (activeFilters.price) {
                        case '0-200':
                            return price > 0 && price <= 200;
                        case '200-500':
                            return price > 200 && price <= 500;
                        case '500-1000':
                            return price > 500 && price <= 1000;
                        case '1000+':
                            return price > 1000;
                        case 'negotiable':
                            return price === 0 || !product.price;
                        default:
                            return true;
                    }
                });
            }
            
            // Update filtered products and display
            filteredProducts = filtered;
            if (resetPage) {
                currentPage = 1;
                updateURL();
            }
            updateProductsCount();
            displayProducts(filteredProducts);
            updateActiveFiltersDisplay();
            updateURL();
        }

        // Setup toggle filters functionality

function setupToggleFilters() {
            const toggleBtn = document.getElementById('toggle-filters-btn');
            const filterSection = document.getElementById('filter-section');
            
            if (!toggleBtn) return;
            
            function navigateToFilters() {
                const params = new URLSearchParams();
                if (activeFilters?.subcategory?.length) activeFilters.subcategory.forEach(v=>params.append('subcat', v));
                if (activeFilters?.governorates?.length) activeFilters.governorates.forEach(v=>params.append('gov', v));
                if (activeFilters?.cities?.length) activeFilters.cities.forEach(v=>params.append('city', v));
                switch (activeFilters?.price) {
                    case '0-200': params.set('pmin','0'); params.set('pmax','200'); break;
                    case '200-500': params.set('pmin','201'); params.set('pmax','500'); break;
                    case '500-1000': params.set('pmin','501'); params.set('pmax','1000'); break;
                    case '1000+': params.set('pmin','1001'); break;
                    case 'negotiable': params.set('pmin','0'); params.set('pmax','0'); break;
                }
                const qs = params.toString();
                window.location.href = `../filters/invitations-filters.html${qs ? '?' + qs : ''}`;
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
            const clearFiltersBtn = document.getElementById('clear-filters-btn');
            
            // Clear all filters
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', function() {
                    clearAllFilters();
                });
            }
        }

        // Initialize filters from URL

function initializeFiltersFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Initialize subcategory filters
            const subcatParams = urlParams.getAll('subcat');
            if (subcatParams.length > 0) {
                activeFilters.subcategory = subcatParams;
            }
            
            // Initialize governorate filters
            const govParams = urlParams.getAll('gov');
            if (govParams.length > 0) {
                activeFilters.governorates = govParams;
            }
            
            // Initialize city filters
            const cityParams = urlParams.getAll('city');
            if (cityParams.length > 0) {
                activeFilters.cities = cityParams;
            }
            
            // Initialize price filters
            const pmin = urlParams.get('pmin');
            const pmax = urlParams.get('pmax');
            if (pmin !== null || pmax !== null) {
                if (pmin === '0' && pmax === '200') {
                    activeFilters.price = '0-200';
                } else if (pmin === '201' && pmax === '500') {
                    activeFilters.price = '200-500';
                } else if (pmin === '501' && pmax === '1000') {
                    activeFilters.price = '500-1000';
                } else if (pmin === '1001' && (pmax === null || pmax === '' || pmax === undefined)) {
                    activeFilters.price = '1000+';
                } else if (pmin === '0' && pmax === '0') {
                    activeFilters.price = 'negotiable';
                }
            }
            
            // Apply filters if any were found
            if (activeFilters.subcategory.length > 0 || 
                activeFilters.governorates.length > 0 || 
                activeFilters.cities.length > 0 || 
                activeFilters.price) {
                applyFilters();
            }
        }

        // Clear all filters

function clearAllFilters() {
            // Reset active filters
            activeFilters = {
                subcategory: [],
                governorates: [],
                cities: [],
                price: ''
            };
            
            // Apply filters to show all products
            applyFilters();
            
            // Update URL to remove filter parameters
            updateURL();
            filtersOpen = false;
        }

        // Update active filters display

function updateActiveFiltersDisplay() {
            const activeFiltersContainer = document.getElementById('active-filters');
            const allFilters = [];
            
            // Add subcategory filters
            activeFilters.subcategory.forEach(category => {
                allFilters.push({
                    type: 'subcategory',
                    value: category,
                    label: getCategoryLabel(category)
                });
            });
            
            // Add governorate filters
            activeFilters.governorates.forEach(governorate => {
                allFilters.push({
                    type: 'governorate',
                    value: governorate,
                    label: governorate
                });
            });
            
            // Add city filters
            activeFilters.cities.forEach(city => {
                allFilters.push({
                    type: 'city',
                    value: city,
                    label: city
                });
            });
            
            // Add price filter
            if (activeFilters.price) {
                allFilters.push({
                    type: 'price',
                    value: activeFilters.price,
                    label: getPriceLabel(activeFilters.price)
                });
            }
            
            // Display active filters
            if (allFilters.length === 0) {
                activeFiltersContainer.innerHTML = '<p class="text-gray-500 text-sm">لا توجد فلاتر نشطة</p>';
            } else {
                activeFiltersContainer.innerHTML = allFilters.map(filter => `
                    <span class="active-filter-tag">
                        ${filter.label}
                        <button class="remove-filter" onclick="removeFilter('${filter.type}', '${filter.value}')">×</button>
                    </span>
                `).join('');
            }
        }

                 // Get category label
         function getCategoryLabel(category) {
             const labels = {
                 'invitation-wedding': 'دعوة زفاف',
                 'invitation-engagement': 'دعوة خطوبة',
                 'invitation-wedding-distribution': 'توزيعات فرح',
                 'invitation-engagement-distribution': 'توزيعات خطوبة',
                 'invitation-chocolate': 'توزيعات بالشوكولاتة',
                 'invitation-perfumed': 'توزيعات بالعطور / البرفان',
                 'invitation-gift': 'توزيعات مع هدية صغيره',
                 'invitation-baby-week': 'توزيعات سبوع',
                 'invitation-kids': 'توزيعات أطفال',
                 'invitation-flowers': 'توزيعات ورد',
                 'invitation-candles': 'توزيعات شموع',
                 'invitation-digital': 'دعوة رقمية'
             };
             return labels[category] || category;
         }

        // Get price label

function removeFilter(type, value) {
            switch (type) {
                case 'subcategory':
                    removeSubcategory(value);
                    return; // updateSubcategoryFilter() already calls applyFilters()
                case 'governorate':
                    removeGovernorate(value);
                    return; // updateGovernorateFilter() already calls applyFilters()
                case 'city':
                    removeCity(value);
                    return; // updateCitiesFilter() already calls applyFilters()
                case 'price':
                    activeFilters.price = '';
                    updateActiveFiltersDisplay();
                    break;
            }
            applyFilters();
        }

        // Remove governorate filter

function removeGovernorate(governorate) {
            activeFilters.governorates = activeFilters.governorates.filter(g => g !== governorate);
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Remove city filter

function removeCity(city) {
            activeFilters.cities = activeFilters.cities.filter(c => c !== city);
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Remove subcategory filter

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


