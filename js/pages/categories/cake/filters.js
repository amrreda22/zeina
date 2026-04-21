/* filters module for cake */

function displaySelectedCities() {
            if (!selectedCitiesContainer) {
                selectedCitiesContainer = document.getElementById('selected-cities');
            }
            if (activeFilters.cities.length === 0) {
                selectedCitiesContainer.innerHTML = '';
                return;
            }
            selectedCitiesContainer.innerHTML = activeFilters.cities.map(city => `
                <div class="selected-city-tag">
                    ${city}
                    <button class="remove-city" onclick="removeCity('${city}')">×</button>
                </div>
            `).join('');
        }

function filterCities(searchTerm) {
            const cityOptions = document.querySelectorAll('.city-option');
            cityOptions.forEach(option => {
                const cityName = option.querySelector('span').textContent.toLowerCase();
                const matches = cityName.includes(searchTerm.toLowerCase());
                option.style.display = matches ? 'block' : 'none';
            });
        }

        // تهيئة ترقيم الصفحات من URL

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

function initializeFiltersFromURL() {
            const params = new URLSearchParams(window.location.search);
            const subcats = params.getAll('subcat');
            const govs = params.getAll('gov');
            const cities = params.getAll('city');
            const priceParam = params.get('price');
            const pminParam = params.get('pmin');
            const pmaxParam = params.get('pmax');

            console.log('تهيئة الفلاتر من URL:', {
                subcats, govs, cities, priceParam, pminParam, pmaxParam
            });

            if (subcats && subcats.length) activeFilters.subcategory = subcats;
            if (govs && govs.length) activeFilters.governorate = govs;
            if (cities && cities.length) activeFilters.cities = cities;

            function mapToCakePrice(mi, ma) {
                if (mi === 0 && ma === 0) return 'negotiable';
                if (ma != null) {
                    if (ma <= 200) return '0-200';
                    if (ma <= 500) return '200-500';
                    if (ma <= 1000) return '500-1000';
                    return '1000+';
                }
                if (mi != null) {
                    if (mi > 1000) return '1000+';
                }
                return '';
            }

            let priceValue = '';
            if (priceParam) {
                if (priceParam === 'negotiable') {
                    priceValue = 'negotiable';
                } else {
                    const parts = String(priceParam).split('-');
                    const mi = parts[0] !== undefined && parts[0] !== '' ? parseFloat(parts[0]) : null;
                    const ma = parts[1] !== undefined && parts[1] !== '' ? parseFloat(parts[1]) : null;
                    priceValue = mapToCakePrice(mi, ma);
                }
            } else if (pminParam !== null || pmaxParam !== null) {
                const mi = pminParam !== null && pminParam !== '' ? parseFloat(pminParam) : null;
                const ma = pmaxParam !== null && pmaxParam !== '' ? parseFloat(pmaxParam) : null;
                priceValue = mapToCakePrice(mi, ma);
            }

            if (priceValue) {
                activeFilters.price = priceValue;
            }

            console.log('الفلاتر النهائية بعد التهيئة:', activeFilters);
        }

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
            // تحويل فلتر السعر الحالي إلى pmin/pmax لصفحة الفلاتر
            switch (activeFilters?.price) {
                case '0-200':
                    params.set('pmin', '0'); params.set('pmax', '200');
                    break;
                case '200-500':
                    params.set('pmin', '201'); params.set('pmax', '500');
                    break;
                case '500-1000':
                    params.set('pmin', '501'); params.set('pmax', '1000');
                    break;
                case '1000+':
                    params.set('pmin', '1001');
                    break;
                case 'negotiable':
                    params.set('pmin', '0'); params.set('pmax', '0');
                    break;
            }
            return params.toString();
        }

        // Setup toggle filters functionality

function setupToggleFilters() {
            const toggleBtn = document.getElementById('toggle-filters-btn');
            const filterSection = document.getElementById('filter-section');
            
            function navigateToFilters() {
                const qs = buildFiltersQueryString();
                window.location.href = `../filters/cake-filters.html${qs ? '?' + qs : ''}`;
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

function applyFilters() {
            filteredProducts = allProducts;
            console.log('بدء تطبيق الفلاتر - عدد المنتجات قبل التصفية:', filteredProducts.length);
            console.log('الفلاتر النشطة:', activeFilters);

            // تطبيق فلاتر التصنيف الفرعي
            if (activeFilters.subcategory && activeFilters.subcategory.length > 0) {
                console.log('تطبيق فلتر التصنيف الفرعي:', activeFilters.subcategory);
                filteredProducts = filteredProducts.filter(product => {
                    if (!product.subcategory) {
                        console.log('منتج بدون تصنيف فرعي:', product.id);
                        return false;
                    }
                    let subcats = [];
                    if (Array.isArray(product.subcategory)) {
                        subcats = product.subcategory;
                    } else if (typeof product.subcategory === 'string') {
                        try {
                            subcats = JSON.parse(product.subcategory);
                        } catch {
                            subcats = [product.subcategory];
                        }
                    }
                    const matches = activeFilters.subcategory.some(filterSubcat => {
                        // التحقق من الكود مباشرة
                        if (subcats.includes(filterSubcat)) return true;

                        // التحقق من النص العربي المقابل للكود
                        const arabicText = {
                            'cake-wedding': 'تورتة زفاف',
                            'cake-engagement': 'تورتة خطوبة',
                            'cake-birthday': 'تورتة عيد ميلاد',
                            'cake-chocolate': 'تورتة شوكولاتة',
                            'cake-fruit': 'تورتة فواكه',
                            'cake-chocolate-tray': 'صينية شوكولاتة'
                        };

                        const arabicVersion = arabicText[filterSubcat];
                        if (arabicVersion && subcats.includes(arabicVersion)) return true;

                        // التحقق من النصوص البديلة الشائعة
                        const alternativeTexts = {
                            'cake-wedding': ['تورتة زواج', 'تورتة الزفاف'],
                            'cake-engagement': ['تورتة الخطوبة'],
                            'cake-birthday': ['تورتة عيد الميلاد'],
                            'cake-fruit': ['تورتة الفواكه'],
                            'cake-chocolate-tray': ['صينية الشوكولاتة']
                        };

                        const alternatives = alternativeTexts[filterSubcat] || [];
                        return alternatives.some(alt => subcats.includes(alt));
                    });
                    if (!matches) {
                        console.log('منتج لا يطابق فلتر التصنيف:', product.id, 'subcats:', subcats);
                    }
                    return matches;
                });
                console.log('عدد المنتجات بعد فلتر التصنيف الفرعي:', filteredProducts.length);
            }

            // تطبيق فلاتر المحافظة
            if (activeFilters.governorate && activeFilters.governorate.length > 0) {
                console.log('تطبيق فلتر المحافظة:', activeFilters.governorate);
                filteredProducts = filteredProducts.filter(product => {
                    if (!product.governorate) return false;
                    const govs = product.governorate.split(',').map(g => g.trim());
                    return activeFilters.governorate.some(filterGov => 
                        govs.some(gov => gov.includes(filterGov))
                    );
                });
                console.log('عدد المنتجات بعد فلتر المحافظة:', filteredProducts.length);
            }

            // تطبيق فلاتر المدن
            if (activeFilters.cities && activeFilters.cities.length > 0) {
                console.log('تطبيق فلتر المدن:', activeFilters.cities);
                filteredProducts = filteredProducts.filter(product => {
                    if (!product.cities) return false;
                    const cities = product.cities.split(',').map(c => c.trim());
                    return activeFilters.cities.some(filterCity => 
                        cities.some(city => city.includes(filterCity))
                    );
                });
                console.log('عدد المنتجات بعد فلتر المدن:', filteredProducts.length);
            }

            // تطبيق فلتر السعر
            if (activeFilters.price) {
                console.log('تطبيق فلتر السعر:', activeFilters.price);
                filteredProducts = filteredProducts.filter(product => {
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
                console.log('عدد المنتجات بعد فلتر السعر:', filteredProducts.length);
            }

            console.log('العدد النهائي للمنتجات المفلترة:', filteredProducts.length);

            // إعادة تعيين الصفحة الحالية إلى 1 عند تطبيق فلاتر جديدة
            currentPage = 1;
            updateURL();
            
            displayProductsWithPagination();
            updateProductsCount();
            updateActiveFiltersDisplay();
            
            // التمرير لأعلى الصفحة عند تطبيق فلاتر جديدة
            setTimeout(() => {
                scrollToTop();
            }, 100);
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

            // Apply filters to show all products
            applyFilters();
        }

        // تحديث URL مع رقم الصفحة

function updateURL() {
            const url = new URL(window.location);
            if (currentPage > 1) {
                url.searchParams.set('page', currentPage);
            } else {
                url.searchParams.delete('page');
            }
            window.history.replaceState({}, '', url);
        }

        // إعداد ترقيم الصفحات

function updateActiveFiltersDisplay() {
            const activeFiltersContainer = document.getElementById('active-filters');
            const filters = [];

            // Add subcategory filters
            activeFilters.subcategory.forEach(sub => {
                const subcategoryLabels = {
                            'cake-wedding': 'تورتة زفاف',
        'cake-engagement': 'تورتة خطوبة',
        'cake-birthday': 'تورتة عيد ميلاد',
        'cake-chocolate': 'تورتة شوكولاتة',
        'cake-fruit': 'تورتة فواكه',
        'cake-chocolate-tray': 'صينية شوكولاتة'
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
                    '0-200': 'السعر: 0 - 200 ج.م',
                    '200-500': 'السعر: 200 - 500 ج.م',
                    '500-1000': 'السعر: 500 - 1000 ج.م',
                    '1000+': 'السعر: أكثر من 1000 ج.م',
                    'negotiable': 'السعر: قابل للتفاوض'
                };
                filters.push({
                    type: 'price',
                    text: priceLabels[activeFilters.price] || activeFilters.price,
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
                    // Update button states
                    const filterButtons = document.querySelectorAll('.filter-btn');
                    filterButtons.forEach(btn => {
                        const category = btn.getAttribute('data-category');
                        if (category === value) {
                            btn.classList.remove('active');
                        }
                    });
                    
                    // If no subcategory is selected, activate "all" button
                    if (activeFilters.subcategory.length === 0) {
                        const allButton = document.querySelector('[data-category="all"]');
                        if (allButton) {
                            allButton.classList.add('active');
                        }
                    }
                    break;
                case 'governorate':
                    removeGovernorate(value);
                    return; // removeGovernorate already calls applyFilters
                case 'city':
                    removeCity(value);
                    return; // removeCity already calls applyFilters
                    break;
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


