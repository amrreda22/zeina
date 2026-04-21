/* filters module for mirr */

function initializeFiltersFromURL() {
            const params = new URLSearchParams(window.location.search);
            const subcats = params.getAll('subcat');
            const govs = params.getAll('gov');
            const cities = params.getAll('city');
            const priceParam = params.get('price');
            const pminParam = params.get('pmin');
            const pmaxParam = params.get('pmax');

            function normalizeSubcatCode(x){
                const arToCode={
                    'مرآة زفاف':'mirr-wedding','مرايا زفاف':'mirr-wedding',
                    'مرآة خطوبة':'mirr-engagement','مرايا خطوبة':'mirr-engagement',
                    'مرآة ديكور':'mirr-decorative','مرايا ديكور':'mirr-decorative',
                    'مرآة مخصصة':'mirr-custom','مرآة كلاسيكية':'mirr-classic',
                    'مرآة عصرية':'mirr-modern','مرآة فاخرة':'mirr-luxury'
                };
                if (arToCode[x]) return arToCode[x];
                if (typeof x==='string' && x.startsWith('mirror-')) return x.replace('mirror-','mirr-');
                return x;
            }
            if (subcats && subcats.length) activeFilters.subcategory = subcats.map(normalizeSubcatCode);
            if (govs && govs.length) activeFilters.governorate = govs;
            if (cities && cities.length) activeFilters.cities = cities;

            function mapToMirrorPrice(mi, ma) {
                if (mi === 0 && ma === 0) return 'negotiable';
                if (ma != null) {
                    if (ma <= 300) return '0-300';
                    if (ma <= 800) return '300-800';
                    if (ma <= 1500) return '800-1500';
                    return '1500+';
                }
                if (mi != null) {
                    if (mi > 1500) return '1500+';
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
                    priceValue = mapToMirrorPrice(mi, ma);
                }
            } else if (pminParam !== null || pmaxParam !== null) {
                const mi = pminParam !== null && pminParam !== '' ? parseFloat(pminParam) : null;
                const ma = pmaxParam !== null && pmaxParam !== '' ? parseFloat(pmaxParam) : null;
                priceValue = mapToMirrorPrice(mi, ma);
            }

            if (priceValue) {
                activeFilters.price = priceValue;
            }

            // تحديث واجهة أزرار التصنيف الفرعي
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                const category = btn.getAttribute('data-category');
                if (category === 'all') {
                    if (!activeFilters.subcategory || activeFilters.subcategory.length === 0) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                } else {
                    if (activeFilters.subcategory && activeFilters.subcategory.includes(category)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });

            // تحديث حالات مربعات المحافظات والمدن إن وجدت
            const govCheckboxes = document.querySelectorAll('.governorate-checkbox');
            govCheckboxes.forEach(cb => { cb.checked = !!(activeFilters.governorate && activeFilters.governorate.includes(cb.value)); });
            const cityCheckboxes = document.querySelectorAll('.city-checkbox');
            cityCheckboxes.forEach(cb => { cb.checked = !!(activeFilters.cities && activeFilters.cities.includes(cb.value)); });
        }

        // بناء معايير الفلاتر في QueryString لنقلها لصفحة الفلاتر

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
            // تحويل السعر الحالي إلى pmin/pmax
            switch (activeFilters?.price) {
                case '0-300':
                    params.set('pmin', '0'); params.set('pmax', '300');
                    break;
                case '300-800':
                    params.set('pmin', '301'); params.set('pmax', '800');
                    break;
                case '800-1500':
                    params.set('pmin', '801'); params.set('pmax', '1500');
                    break;
                case '1500+':
                    params.set('pmin', '1501');
                    break;
                case 'negotiable':
                    params.set('pmin', '0'); params.set('pmax', '0');
                    break;
            }
            return params.toString();
        }

        // Load products by category

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










        // Clear filters button
        document.getElementById('clear-filters-btn').addEventListener('click', function() {
            clearAllFilters();
        });

        // Apply all filters

function applyFilters(resetPage = true) {
            let filteredProducts = allProducts;

            // Apply subcategory filter
            if (activeFilters.subcategory.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    // خريطة تحويل النصوص العربية إلى أكواد
                    const arabicToCodeMap = {
                        'مرايا زفاف': 'mirr-wedding',
                        'مرايا خطوبة': 'mirr-engagement',
                        'مرايا ديكور': 'mirr-decorative',
                        'مرآة زفاف': 'mirr-wedding',
                        'مرآة خطوبة': 'mirr-engagement',
                        'مرآة ديكور': 'mirr-decorative',
                        // إضافة التنسيقات المباشرة من قاعدة البيانات
                        'mirror-wedding': 'mirr-wedding',
                        'mirror-engagement': 'mirr-engagement',
                        'mirror-decorative': 'mirr-decorative',
                        'mirror-custom': 'mirr-custom',
                        'mirror-classic': 'mirr-classic',
                        'mirror-modern': 'mirr-modern',
                        'mirror-luxury': 'mirr-luxury',
                        'mirr-wedding': 'mirr-wedding',
                        'mirr-engagement': 'mirr-engagement',
                        'mirr-decorative': 'mirr-decorative',
                        'mirr-custom': 'mirr-custom',
                        'mirr-classic': 'mirr-classic',
                        'mirr-modern': 'mirr-modern',
                        'mirr-luxury': 'mirr-luxury'
                    };

                    // خريطة تحويل الأكواد إلى نصوص عربية
                    const codeToArabicMap = {
                        'mirr-wedding': 'مرايا زفاف',
                        'mirr-engagement': 'مرايا خطوبة',
                        'mirr-decorative': 'مرايا ديكور',
                        'mirror-wedding': 'مرايا زفاف',
                        'mirror-engagement': 'مرايا خطوبة',
                        'mirror-decorative': 'مرايا ديكور'
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
                                } else {
                                    productSubcategories = [product.subcategory];
                                }
                            } catch (error) {
                                // If it's not JSON, treat as single value
                                productSubcategories = [product.subcategory];
                            }
                        }
                    } else {
                        // محاولة استخراج من الاسم أو الوصف
                        if (product.title) {
                            const title = product.title.toLowerCase();
                            if (title.includes('زفاف') || title.includes('عرس') || title.includes('wedding')) {
                                productSubcategories = ['mirr-wedding'];
                            } else if (title.includes('خطوبة') || title.includes('engagement')) {
                                productSubcategories = ['mirr-engagement'];
                            } else if (title.includes('ديكور') || title.includes('decorative')) {
                                productSubcategories = ['mirr-decorative'];
                            }
                        }
                    }

                    // Check if any of the selected subcategories match the product's subcategories
                    const matches = activeFilters.subcategory.some(selectedCode => {
                        // Check direct match with code
                        if (productSubcategories.includes(selectedCode)) {
                            return true;
                        }

                        // Check match with Arabic text
                        const selectedArabic = codeToArabicMap[selectedCode];
                        if (selectedArabic && productSubcategories.includes(selectedArabic)) {
                            return true;
                        }

                        // Check if product has text that matches the selected code
                        const productCodeMatch = productSubcategories.some(productSub => {
                            // التحقق من التطابق المباشر
                            if (productSub === selectedCode) {
                                return true;
                            }

                            // التحقق من التطابق عبر الخريطة
                            const productCode = arabicToCodeMap[productSub];
                            if (productCode === selectedCode) {
                                return true;
                            }

                            // التحقق من التطابق العكسي (من كود إلى كود آخر)
                            const reverseCode = arabicToCodeMap[selectedCode];
                            if (productSub === reverseCode) {
                                return true;
                            }

                            return false;
                        });

                        if (productCodeMatch) {
                            return true;
                        }

                        return false;
                    });

                    return matches;
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

            // Apply price filter
            if (activeFilters.price) {
                filteredProducts = filteredProducts.filter(product => {
                    const price = parseFloat(product.price) || 0;
                    
                    switch (activeFilters.price) {
                        case '0-300':
                            return price > 0 && price <= 300;
                        case '300-800':
                            return price > 300 && price <= 800;
                        case '800-1500':
                            return price > 800 && price <= 1500;
                        case '1500+':
                            return price > 1500;
                        case 'negotiable':
                            return price === 0 || !product.price;
                        default:
                            return true;
                    }
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



            // Update filtered products and display
            filteredProducts = filteredProducts;
            if (resetPage) {
                currentPage = 1;
                updateURL();
            }
            displayProducts(filteredProducts);
            updateActiveFiltersDisplay();
            updateURL();
            console.log('applyFilters called with resetPage:', resetPage, 'currentPage:', currentPage);
        }

        // Clear all filters

function clearAllFilters() {
            // Reset simple filter buttons
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activate "all" button
            const allButton = document.querySelector('[data-category="all"]');
            if (allButton) {
                allButton.classList.add('active');
            }
            
            // Reset price filter
            activeFilters.price = '';
            
            // Reset governorate filter
            const checkboxes = document.querySelectorAll('.governorate-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Reset active filters object
            activeFilters = {
                subcategory: [],
                governorate: [],
                cities: [],
                price: ''
            };

            // Clear active filters display
            document.getElementById('active-filters').innerHTML = '';

            // Update governorate display
            document.getElementById('governorate-placeholder').textContent = 'اختر المحافظات';
            document.getElementById('selected-governorates').innerHTML = '';

            // Reset cities filter
            const cityCheckboxes = document.querySelectorAll('.city-checkbox');
            cityCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            document.getElementById('cities-placeholder').textContent = 'اختر المدن/المناطق';
            document.getElementById('selected-cities').innerHTML = '';

            // Hide close filters button
            const closeFiltersBtn = document.getElementById('close-filters-btn');
            closeFiltersBtn.classList.add('hidden');

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
                    'mirr-wedding': 'مرايا زفاف',
                    'mirr-engagement': 'مرايا خطوبة',
                    'mirr-decorative': 'مرايا ديكور',
                    'mirror-wedding': 'مرآة زفاف',
                    'mirror-engagement': 'مرآة خطوبة',
                    'mirror-decorative': 'مرآة ديكور',
                    'mirror-custom': 'مرآة مخصصة',
                    'mirror-classic': 'مرآة كلاسيكية',
                    'mirror-modern': 'مرآة عصرية',
                    'mirror-luxury': 'مرآة فاخرة'
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
                    '0-300': 'حتى 300 ج.م',
                    '300-800': '300 - 800 ج.م',
                    '800-1500': '800 - 1500 ج.م',
                    '1500+': 'أكثر من 1500 ج.م',
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

function displaySelectedCities() {
            const selectedCitiesContainer = document.getElementById('selected-cities');
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
                if (cityName.includes(searchTerm.toLowerCase())) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        }

function removeCity(cityName) {
            const checkbox = document.querySelector(`.city-checkbox[value="${cityName}"]`);
            if (checkbox) {
                checkbox.checked = false;
                updateSelectedCities();
                applyFilters();
            }
        }

        // Setup simple cities filter






        // تحديث أيقونة القلب


        // عرض إشعار

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

function setupToggleFilters() {
            const toggleBtn = document.getElementById('toggle-filters-btn');
            const filterSection = document.getElementById('filter-section');
            
            if (!toggleBtn) return;
            
            function navigateToFilters() {
                window.location.href = '../filters/mirr-filters.html';
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

        // استدعاء الدالة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            setupToggleFilters();
        });


