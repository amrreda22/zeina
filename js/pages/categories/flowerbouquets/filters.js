/* filters module for flowerbouquets */

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



        // Apply all active filters

function applyFilters(resetPage = true) {
            // Start with all products
            let filtered = [...allProducts];
            
            // Use global activeFilters if available
            const filters = window.activeFilters || activeFilters;
            
            console.log('applyFilters called with filters:', filters);
            console.log('Total products before filtering:', filtered.length);
            
            // Apply subcategory filter
            if (filters.subcategory.length > 0) {
                filtered = filtered.filter(product => {
                    // خريطة تحويل النصوص العربية إلى أكواد
                    const arabicToCodeMap = {
                        'بوكيهات طبيعية': 'flowerbouquets-natural',
                        'بوكيهات صناعية': 'flowerbouquets-artificial',
                        'بوكيهات استاند': 'flowerbouquets-stand',
                        'بوكيهات مجففة': 'flowerbouquets-dried',
                        'بوكيهات مشكلة': 'flowerbouquets-arranged'
                    };
                    
                    // خريطة تحويل الأكواد إلى نصوص عربية
                    const codeToArabicMap = {
                        'flowerbouquets-natural': 'بوكيهات طبيعية',
                        'flowerbouquets-artificial': 'بوكيهات صناعية',
                        'flowerbouquets-stand': 'بوكيهات استاند',
                        'flowerbouquets-dried': 'بوكيهات مجففة',
                        'flowerbouquets-arranged': 'بوكيهات مشكلة'
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
                        return filters.subcategory.some(selectedCode => {
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
            
            // Apply color filter
            if (filters.colors && filters.colors.length > 0) {
                const colorMap = { 'أحمر': 'red', 'وردي': 'pink', 'أبيض': 'white', 'أصفر': 'yellow', 'برتقالي': 'orange', 'بنفسجي': 'purple', 'أزرق': 'blue', 'أخضر': 'green', 'متعدد الألوان': 'mixed' };
                filtered = filtered.filter(product => {
                    const rawColors = (product.colors || '').split(',').map(s => s.trim()).filter(Boolean);
                    if (rawColors.length === 0) return false;
                    const normalized = new Set();
                    rawColors.forEach(c => {
                        const lc = c.toLowerCase();
                        normalized.add(lc);
                        if (colorMap[c]) normalized.add(colorMap[c]);
                    });
                    return filters.colors.some(sel => {
                        const lcSel = String(sel).toLowerCase();
                        const eng = colorMap[sel] || lcSel;
                        return normalized.has(lcSel) || normalized.has(eng);
                    });
                });
            }
            
            // Apply governorate filter
            if (filters.governorates.length > 0) {
                console.log('Applying governorate filter with:', filters.governorates);
                filtered = filtered.filter(product => {
                    if (product.governorate) {
                        const productGovernorates = product.governorate.split(',').map(g => g.trim());
                        console.log('Product governorates:', productGovernorates, 'for product:', product.id);
                        const match = filters.governorates.some(selected =>
                            productGovernorates.some(productGov =>
                                productGov.toLowerCase().includes(selected.toLowerCase()) ||
                                selected.toLowerCase().includes(productGov.toLowerCase())
                            )
                        );
                        if (match) console.log('Match found for product:', product.id);
                        return match;
                    }
                    return false;
                });
                console.log('Products after governorate filter:', filtered.length);
            }

            // Apply cities filter
            if (filters.cities.length > 0) {
                console.log('Applying cities filter with:', filters.cities);
                filtered = filtered.filter(product => {
                    if (product.cities) {
                        const productCities = product.cities.split(',').map(c => c.trim());
                        console.log('Product cities:', productCities, 'for product:', product.id);
                        const match = filters.cities.some(selected =>
                            productCities.some(productCity =>
                                productCity.toLowerCase().includes(selected.toLowerCase()) ||
                                selected.toLowerCase().includes(productCity.toLowerCase())
                            )
                        );
                        if (match) console.log('City match found for product:', product.id);
                        return match;
                    }
                    return false;
                });
                console.log('Products after cities filter:', filtered.length);
            }

                        // Apply price filter
            if (filters.price) {
                console.log('Applying price filter with:', filters.price);
                filtered = filtered.filter(product => {
                    const price = parseFloat(product.price) || 0;
                    console.log('Product price:', price, 'for product:', product.id);

                    // Handle price range from URL parameters
                    if (typeof filters.price === 'object' && filters.price.min !== undefined) {
                        const min = parseFloat(filters.price.min) || 0;
                        const max = parseFloat(filters.price.max) || Infinity;

                        if (min === 0 && max === 0) {
                            return price === 0 || !product.price;
                        } else if (max === Infinity) {
                            return price > min;
                        } else {
                            return price >= min && price <= max;
                        }
                    }

                    // Handle price range from filter selection
                    switch (filters.price) {
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
                console.log('Products after price filter:', filtered.length);
            }
            
            // Update filtered products and display
            filteredProducts = filtered;
            console.log('Filtered products count:', filteredProducts.length);
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
            const toggleIcon = document.getElementById('toggle-icon');
            const toggleText = document.getElementById('toggle-text');
            const closeFiltersBtn = document.getElementById('close-filters-btn');
            const filterSection = document.querySelector('.filter-section');
            
            console.log('setupToggleFilters called');
            console.log('toggleBtn found:', !!toggleBtn);
            
            if (!toggleBtn) {
                console.log('toggleBtn not found, returning early');
                return;
            }
            
            let filtersOpen = false;
            
            // الانتقال إلى صفحة الفلاتر عند الضغط على أي مكان في قسم الفلاتر
            filterSection.addEventListener('click', function(event) {
                // تجاهل النقر على الأزرار الموجودة داخل الفلاتر
                if (event.target.closest('.filter-btn') || 
                    event.target.closest('.dropdown-btn') || 
                    event.target.closest('.governorate-checkbox') ||
                    event.target.closest('.city-checkbox') ||
                    event.target.closest('#price-filter') ||
                    event.target.closest('#cities-search-input') ||
                    event.target.closest('.action-btn') ||
                    event.target.closest('.clear-filters-btn') ||
                    event.target.closest('.close-filters-btn') ||
                    event.target.closest('.remove-filter') ||
                    event.target.closest('.active-filter-tag') ||
                    event.target.closest('#active-filters') ||
                    event.target.closest('.subcategory-checkbox') ||
                    event.target.closest('.subcategory-dropdown-btn') ||
                    event.target.closest('#toggle-filters-btn')) {
                    return;
                }
                
                // الانتقال إلى صفحة الفلاتر
                const params = new URLSearchParams();
                const filters = window.activeFilters || activeFilters;
                if (filters?.subcategory?.length) filters.subcategory.forEach(v=>params.append('subcat', v));
                if (filters?.governorates?.length) filters.governorates.forEach(v=>params.append('gov', v));
                if (filters?.cities?.length) filters.cities.forEach(v=>params.append('city', v));
                if (filters?.colors?.length) filters.colors.forEach(v=>params.append('color', v));
                switch (filters?.price) {
                    case '0-200': params.set('pmin','0'); params.set('pmax','200'); break;
                    case '200-500': params.set('pmin','201'); params.set('pmax','500'); break;
                    case '500-1000': params.set('pmin','501'); params.set('pmax','1000'); break;
                    case '1000+': params.set('pmin','1001'); break;
                    case 'negotiable': params.set('pmin','0'); params.set('pmax','0'); break;
                }
                const qs = params.toString();
                window.location.href = `../filters/flowerbouquets-filters.html${qs ? '?' + qs : ''}`;
            });
            
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Toggle filters button clicked');
                const params = new URLSearchParams();
                const filters = window.activeFilters || activeFilters;
                console.log('Current filters:', filters);
                if (filters?.subcategory?.length) filters.subcategory.forEach(v=>params.append('subcat', v));
                if (filters?.governorates?.length) filters.governorates.forEach(v=>params.append('gov', v));
                if (filters?.cities?.length) filters.cities.forEach(v=>params.append('city', v));
                if (filters?.colors?.length) filters.colors.forEach(v=>params.append('color', v));
                switch (filters?.price) {
                    case '0-200': params.set('pmin','0'); params.set('pmax','200'); break;
                    case '200-500': params.set('pmin','201'); params.set('pmax','500'); break;
                    case '500-1000': params.set('pmin','501'); params.set('pmax','1000'); break;
                    case '1000+': params.set('pmin','1001'); break;
                    case 'negotiable': params.set('pmin','0'); params.set('pmax','0'); break;
                }
                const qs = params.toString();
                console.log('Navigating to:', `../filters/flowerbouquets-filters.html${qs ? '?' + qs : ''}`);
                window.location.href = `../filters/flowerbouquets-filters.html${qs ? '?' + qs : ''}`;
            });
            
            // إضافة وظيفة زر الإغلاق
            if (closeFiltersBtn) {
                closeFiltersBtn.addEventListener('click', function() {
                    // إغلاق الفلاتر
                    if (toggleIcon) toggleIcon.classList.remove('rotated');
                    // إخفاء زر الإغلاق
                    closeFiltersBtn.classList.add('hidden');
                    filtersOpen = false;
                });
            }
            
            // إغلاق الفلاتر عند الضغط خارجها
            document.addEventListener('click', function(event) {
                const filterSection = document.querySelector('.filter-section');
                
                // إذا كانت الفلاتر مفتوحة والنقر خارج منطقة الفلاتر
                if (filtersOpen && filterSection && !filterSection.contains(event.target)) {
                    if (toggleIcon) toggleIcon.classList.remove('rotated');
                    if (closeFiltersBtn) closeFiltersBtn.classList.add('hidden');
                    filtersOpen = false;
                }
            });
            
            // مراقبة تغيير حجم النافذة
            window.addEventListener('resize', function() {
                if (window.innerWidth >= 640) {
                    // في الشاشات الكبيرة، إخفاء زر الإغلاق
                    if (closeFiltersBtn) {
                        closeFiltersBtn.classList.add('hidden');
                    }
                } else if (filtersOpen && window.innerWidth < 640) {
                    // في الشاشات الصغيرة، إظهار زر الإغلاق إذا كانت الفلاتر مفتوحة
                    if (closeFiltersBtn) {
                        closeFiltersBtn.classList.remove('hidden');
                    }
                }
            });
        }

















        // Clear all filters

function clearAllFilters() {
            // Reset active filters
            window.activeFilters = {
                subcategory: [],
                governorates: [],
                cities: [],
                price: '',
                colors: []
            };
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Update active filters display

function updateActiveFiltersDisplay() {
            const activeFiltersContainer = document.getElementById('active-filters');
            const filters = [];
            
            // Use global activeFilters if available
            const activeFilters = window.activeFilters || {
                subcategory: [],
                governorates: [],
                cities: [],
                price: '',
                colors: []
            };

            // Add subcategory filters
            activeFilters.subcategory.forEach(sub => {
                const subcategoryLabels = {
                    'flowerbouquets-natural': 'بوكيهات طبيعية',
                    'flowerbouquets-artificial': 'بوكيهات صناعية',
                    'flowerbouquets-stand': 'بوكيهات استاند',
                    'flowerbouquets-dried': 'بوكيهات مجففة',
                    'flowerbouquets-arranged': 'بوكيهات مشكلة'
                };
                filters.push({
                    type: 'subcategory',
                    text: subcategoryLabels[sub] || sub,
                    value: sub
                });
            });

            // Add governorate filters
            activeFilters.governorates.forEach(gov => {
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

            // Add color filters
            if (activeFilters.colors && activeFilters.colors.length > 0) {
                activeFilters.colors.forEach(color => {
                    const colorLabels = {
                        'red': 'أحمر',
                        'pink': 'وردي',
                        'white': 'أبيض',
                        'yellow': 'أصفر',
                        'purple': 'بنفسجي',
                        'orange': 'برتقالي',
                        'blue': 'أزرق',
                        'mixed': 'مختلط'
                    };
                    filters.push({
                        type: 'color',
                        text: colorLabels[color] || color,
                        value: color
                    });
                });
            }

            // Add price filter
            if (activeFilters.price) {
                let priceValue = activeFilters.price;
                let priceText = '';

                // Handle price range from URL parameters (object format)
                if (typeof activeFilters.price === 'object' && activeFilters.price.min !== undefined) {
                    const min = parseFloat(activeFilters.price.min) || 0;
                    const max = parseFloat(activeFilters.price.max) || Infinity;

                    if (min === 0 && max === 0) {
                        priceValue = 'negotiable';
                        priceText = 'السعر عند الطلب';
                    } else if (max === Infinity) {
                        priceValue = '1000+';
                        priceText = 'أكثر من 1000 ج.م';
                    } else if (min === 0 && max === 200) {
                        priceValue = '0-200';
                        priceText = 'حتى 200 ج.م';
                    } else if (min === 201 && max === 500) {
                        priceValue = '200-500';
                        priceText = '200 - 500 ج.م';
                    } else if (min === 501 && max === 1000) {
                        priceValue = '500-1000';
                        priceText = '500 - 1000 ج.م';
                    } else {
                        priceText = `${min} - ${max} ج.م`;
                    }
                } else {
                    // Handle price range from filter selection (string format)
                    const priceLabels = {
                        '0-200': 'حتى 200 ج.م',
                        '200-500': '200 - 500 ج.م',
                        '500-1000': '500 - 1000 ج.م',
                        '1000+': 'أكثر من 1000 ج.م',
                        'negotiable': 'السعر عند الطلب'
                    };
                    priceText = priceLabels[activeFilters.price] || activeFilters.price;
                }

                filters.push({
                    type: 'price',
                    text: priceText,
                    value: priceValue
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

                 // Get category label
         function getCategoryLabel(category) {
             const labels = {
                 'flowerbouquets-natural': 'بوكيهات طبيعية',
                 'flowerbouquets-artificial': 'بوكيهات صناعية',
                 'flowerbouquets-stand': 'بوكيهات استاند',
                 'flowerbouquets-dried': 'بوكيهات مجففة',
                 'flowerbouquets-arranged': 'بوكيهات مشكلة'
             };
             return labels[category] || category;
         }

        // Get price label

function removeFilter(type, value) {
            const activeFilters = window.activeFilters || {
                subcategory: [],
                governorates: [],
                cities: [],
                price: '',
                colors: []
            };
            
            switch (type) {
                case 'subcategory':
                    activeFilters.subcategory = activeFilters.subcategory.filter(s => s !== value);
                    break;
                case 'governorate':
                    activeFilters.governorates = activeFilters.governorates.filter(g => g !== value);
                    break;
                case 'city':
                    activeFilters.cities = activeFilters.cities.filter(c => c !== value);
                    break;
                case 'color':
                    if (activeFilters.colors) {
                        activeFilters.colors = activeFilters.colors.filter(c => c !== value);
                    }
                    break;
                case 'price':
                    activeFilters.price = '';
                    break;
            }
            
            // Update global activeFilters
            window.activeFilters = activeFilters;
            applyFilters();
        }

        // Remove governorate filter

function removeGovernorate(governorate) {
            if (window.activeFilters && window.activeFilters.governorates) {
                window.activeFilters.governorates = window.activeFilters.governorates.filter(g => g !== governorate);
            }
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Remove city filter

function removeCity(city) {
            if (window.activeFilters && window.activeFilters.cities) {
                window.activeFilters.cities = window.activeFilters.cities.filter(c => c !== city);
            }
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Function to scroll to product request section (placeholder)

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


