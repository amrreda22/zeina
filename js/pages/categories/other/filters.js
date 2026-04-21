/* filters module for other */

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

        // Setup toggle filters functionality

function setupToggleFilters() {
            const toggleBtn = document.getElementById('toggle-filters-btn');
            const filterSection = document.getElementById('filter-section');
            
            function navigateToFilters() {
                const params = new URLSearchParams();
                if (activeFilters?.subcategory?.length) activeFilters.subcategory.forEach(v=>params.append('subcat', v));
                if (activeFilters?.governorate?.length) activeFilters.governorate.forEach(v=>params.append('gov', v));
                if (activeFilters?.cities?.length) activeFilters.cities.forEach(v=>params.append('city', v));
                switch (activeFilters?.price) {
                    case '0-200': params.set('pmin','0'); params.set('pmax','200'); break;
                    case '200-500': params.set('pmin','201'); params.set('pmax','500'); break;
                    case '500-1000': params.set('pmin','501'); params.set('pmax','1000'); break;
                    case '1000+': params.set('pmin','1001'); break;
                    case 'negotiable': params.set('pmin','0'); params.set('pmax','0'); break;
                }
                const qs = params.toString();
                window.location.href = `../filters/other-filters.html${qs ? '?' + qs : ''}`;
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

        // Initialize filters state from URL query params

function initializeFiltersFromURL() {
            const params = new URLSearchParams(window.location.search);

            // Subcategories
            const subcats = params.getAll('subcat').filter(Boolean);
            if (subcats.length > 0) {
                activeFilters.subcategory = Array.from(new Set(subcats));
            }

            // Governorates
            const govs = params.getAll('gov').filter(Boolean);
            if (govs.length > 0) {
                activeFilters.governorate = Array.from(new Set(govs));
            }

            // Cities
            const cities = params.getAll('city').filter(Boolean);
            if (cities.length > 0) {
                activeFilters.cities = Array.from(new Set(cities));
            }

            // Price
            const pmin = params.get('pmin');
            const pmax = params.get('pmax');
            if (pmin !== null || pmax !== null) {
                let val = '';
                const pminNum = pmin ? parseInt(pmin) : null;
                const pmaxNum = pmax ? parseInt(pmax) : null;

                if (pminNum === 0 && pmaxNum === 200) val = '0-200';
                else if (pminNum === 201 && pmaxNum === 500) val = '200-500';
                else if (pminNum === 501 && pmaxNum === 1000) val = '500-1000';
                else if (pminNum === 1001) val = '1000+';
                else if (pminNum === 0 && pmaxNum === 0) val = 'negotiable';

                if (val) {
                    activeFilters.price = val;
                }
            }
        }

        // Apply all filters

function applyFilters(resetPage = true) {
            console.log('Applying filters with activeFilters:', activeFilters);
            let filteredProducts = [...allProducts];
            const initialCount = filteredProducts.length;

            // Apply subcategory filter - فلتر التصنيفات الفرعية
            if (activeFilters.subcategory.length > 0) {
                const codeToAr = {
                    "other-birthday": "ديكور عيد ميلاد",
                    "other-hospital": "استقبال المولود بالمستشفى",
                    "other-bride": "ديكور استقبال عروسة",
                    "other-party": "ديكور حفلات بسيطة",
                    "other-balloons": "بالونات وهدايا",
                    "other-flowers": "زهور وأزهار",
                    "other-lights": "إضاءات ديكور"
                };
                const arToCode = {
                    "ديكور عيد ميلاد": "other-birthday",
                    "استقبال المولود بالمستشفى": "other-hospital",
                    "استقبال مستشفى": "other-hospital",
                    "ديكور استقبال عروسة": "other-bride",
                    "استقبال عروسة": "other-bride",
                    "ديكور حفلات بسيطة": "other-party",
                    "حفلات بسيطة": "other-party",
                    "بالونات وهدايا": "other-balloons",
                    "زهور وأزهار": "other-flowers",
                    "إضاءات ديكور": "other-lights"
                };
                
                filteredProducts = filteredProducts.filter(product => {
                    if (!product.subcategory) return false;
                    
                    let productSubcats = [];
                    if (Array.isArray(product.subcategory)) {
                        productSubcats = product.subcategory;
                    } else if (typeof product.subcategory === 'string') {
                        try {
                            productSubcats = JSON.parse(product.subcategory);
                        } catch {
                            productSubcats = [product.subcategory];
                        }
                    }
                    
                    const mappedSubcats = productSubcats.map(x => arToCode[x] || x);
                    return activeFilters.subcategory.some(selected => 
                        mappedSubcats.includes(selected) || 
                        mappedSubcats.includes(codeToAr[selected] || selected)
                    );
                });
            }

            // Apply governorate filter - فلتر المحافظات
            if (activeFilters.governorate.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    // التحقق من وجود المحافظة وأنها غير فارغة
                    if (cleanLocationData(product.governorate)) {
                        const productGovernorates = product.governorate.split(',').map(g => g.trim()).filter(gov => gov !== '' && gov !== 'null' && gov !== 'undefined');
                        return activeFilters.governorate.some(selected => 
                            productGovernorates.some(productGov => 
                                productGov.includes(selected)
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
                    const priceValue = product.price ? parseFloat(product.price) : 0;
                    const hasPrice = product.price !== null && product.price !== undefined && product.price !== '' && product.price !== '0';

                    switch (activeFilters.price) {
                        case '0-200':
                            return hasPrice && priceValue > 0 && priceValue <= 200;
                        case '200-500':
                            return hasPrice && priceValue > 200 && priceValue <= 500;
                        case '500-1000':
                            return hasPrice && priceValue > 500 && priceValue <= 1000;
                        case '1000+':
                            return hasPrice && priceValue > 1000;
                        case 'negotiable':
                            return !hasPrice || priceValue === 0;
                        default:
                            return true;
                    }
                });
            }

            // Apply cities filter - فلتر المدن
            if (activeFilters.cities.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    // التحقق من وجود المدينة وأنها غير فارغة وليست "جميع المدن"
                    if (cleanCitiesData(product.cities)) {
                        const productCities = product.cities.split(',').map(c => c.trim()).filter(city => city !== '' && city !== 'null' && city !== 'undefined');
                        return activeFilters.cities.some(selected => 
                            productCities.some(productCity => 
                                productCity.includes(selected)
                            )
                        );
                    }
                    return false;
                });
            }



            // Update filtered products and display
            console.log(`Filter results: ${initialCount} -> ${filteredProducts.length} products`);
            if (resetPage) {
                currentPage = 1;
            }
            displayProducts(filteredProducts);
            updateActiveFiltersDisplay();
            updateURL();
            console.log('applyFilters completed, currentPage:', currentPage);
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

            // Apply filters
            applyFilters();
        }

        // Update active filters display

function updateActiveFiltersDisplay() {
            const activeFiltersContainer = document.getElementById('active-filters');
            const filters = [];

            // Add subcategory filter
            activeFilters.subcategory.forEach(sub => {
                const subcategoryLabels = {
                            'other-birthday': 'ديكور عيد ميلاد',
        'other-hospital': 'استقبال المولود بالمستشفى',
        'other-bride': 'ديكور استقبال عروسة',
        'other-party': 'ديكور حفلات بسيطة'
                };
                filters.push({
                    type: 'subcategory',
                    text: subcategoryLabels[sub] || sub,
                    value: sub
                });
            });

            // Add governorate filters
            activeFilters.governorate.forEach(gov => {
                filters.push({
                    type: 'governorate',
                    text: gov,
                    value: gov
                });
            });

            // Add cities filters
            activeFilters.cities.forEach(city => {
                filters.push({
                    type: 'city',
                    text: city,
                    value: city
                });
            });

            // Add price filter
            if (activeFilters.price) {
                const priceLabels = {
                    '0-200': 'حتى 200 ج.م',
                    '200-500': '200 - 500 ج.م',
                    '500-1000': '500 - 1000 ج.م',
                    '1000+': 'أكثر من 1000 ج.م',
                    'negotiable': 'السعر عند الطلب'
                };
                const priceText = priceLabels[activeFilters.price] || activeFilters.price;
                filters.push({
                    type: 'price',
                    text: priceText,
                    value: activeFilters.price
                });
            }

            // Display active filters
            if (filters.length > 0) {
                activeFiltersContainer.innerHTML = filters.map(filter => `
                    <div class="active-filter-tag">
                        ${filter.text}
                        <button class="remove-filter" onclick="removeFilter('${filter.type}', '${filter.value}')">
                            ×
                        </button>
                    </div>
                `).join('');
                activeFiltersContainer.style.display = 'flex';
            } else {
                activeFiltersContainer.style.display = 'none';
            }
        }

        // Remove specific filter

function removeFilter(type, value) {
            switch (type) {
                case 'subcategory':
                    activeFilters.subcategory = activeFilters.subcategory.filter(s => s !== value);
                    break;
                case 'governorate':
                    removeGovernorate(value);
                    return; // removeGovernorate already calls applyFilters
                case 'city':
                    removeCity(value);
                    return; // removeCity already calls applyFilters
                case 'price':
                    activeFilters.price = '';
                    break;
            }
            applyFilters();
        }

        // Remove governorate filter

function removeGovernorate(governorate) {
            activeFilters.governorate = activeFilters.governorate.filter(g => g !== governorate);
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Remove city filter

function removeCity(city) {
            activeFilters.cities = activeFilters.cities.filter(c => c !== city);
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Display products

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


