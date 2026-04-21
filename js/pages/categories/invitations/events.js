/* events module for invitations */

async function loadProducts() {
            try {
                showLoadingState();
                
                // Wait for ProductService to load
                if (!window.ProductService) {
                    await new Promise((resolve) => {
                        const checkInterval = setInterval(() => {
                            if (window.ProductService) {
                                clearInterval(checkInterval);
                                resolve();
                            }
                        }, 100);
                        
                        setTimeout(() => {
                            clearInterval(checkInterval);
                            resolve();
                        }, 5000);
                    });
                }
                
                if (!window.ProductService) {
                    throw new Error('ProductService not available');
                }
                
                const result = await window.ProductService.getProductsByCategory('invitations');
                
                if (result.success) {
                    allProducts = result.data || [];
                    
                    // Process products
                    if (allProducts.length > 0) {
                        // Process subcategories
                        allProducts.forEach(product => {
                            if (product.subcategory) {
                                // Subcategory processing logic
                            }
                        });
                    }
                    
                    filteredProducts = [...allProducts];
                    
                    // ترتيب المنتجات حسب المعايير المطلوبة
                    sortProductsByCriteria();
                    
                    // تحديث filteredProducts بعد الترتيب
                    filteredProducts = [...allProducts];
                    
                    updateProductsCount();
                    // تطبيق الفلاتر (يشمل العرض والتحديثات)
                    applyFilters();
                    
                    if (allProducts.length === 0) {
                        showEmptyState();
                    }
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                hideLoadingState();
                showEmptyState();
            }
        }

        // عرض المنتجات

function createProductCard(product) {
            
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300';
            card.setAttribute('data-product-id', product.id);
            
            // الحصول على الصورة الأولى من مجموعة الصور
            const imageUrl = product.image_urls && product.image_urls.length > 0 
                ? product.image_urls[0] 
                : 'https://placehold.co/400x300/EEE/31343C?text=لا+توجد+صورة';
            
            // Get subcategory display name
            let subcategoryNames = [];
            let subcategoryColors = [];
            
            // Define subcategoryMap at function level so it's accessible to all blocks
            const subcategoryMap = {
                // دعوات
                'invitation-wedding': { name: 'دعوة زفاف', color: 'bg-pink-500' },
                'invitation-engagement': { name: 'دعوة خطوبة', color: 'bg-purple-500' },
                'invitation-wedding-distribution': { name: 'توزيعات زفاف', color: 'bg-pink-400' },
                'invitation-engagement-distribution': { name: 'توزيعات خطوبة', color: 'bg-purple-400' },
                'invitation-chocolate': { name: 'توزيعات بالشوكولاتة', color: 'bg-yellow-500' },
                'invitation-perfumed': { name: 'توزيعات بالبرفان', color: 'bg-indigo-500' },
                'invitation-gift': { name: 'توزيعات مع هدية صغيرة', color: 'bg-red-500' },
                'invitation-baby-week': { name: 'أسبوع المولود', color: 'bg-blue-500' },
                'invitation-kids': { name: 'دعوات أطفال', color: 'bg-green-500' },
                'invitation-digital': { name: 'دعوة رقمية', color: 'bg-teal-500' }
            };
            

            
            if (product.subcategory && Array.isArray(product.subcategory) && product.subcategory.length > 0) {
                
                // معالجة جميع التصنيفات الفرعية
                product.subcategory.forEach(subcat => {
                    if (subcat && subcat.trim() !== '') { // تأكد من أن القيمة ليست فارغة
                        const subcategoryInfo = subcategoryMap[subcat];
                        if (subcategoryInfo) {
                            subcategoryNames.push(subcategoryInfo.name);
                            subcategoryColors.push(subcategoryInfo.color);
                        } else {
                            // محاولة إصلاح البيانات إذا لم يتم العثور عليها في الخريطة
                            subcategoryNames.push(subcat);
                            subcategoryColors.push('bg-gray-500');
                        }
                    }
                });
            } else if (product.subcategory && typeof product.subcategory === 'string' && product.subcategory.trim() !== '') {
                
                // Check if it's a JSON string first
                if (product.subcategory.startsWith('[') || product.subcategory.startsWith('{')) {
                    try {
                        const subcategoryArray = JSON.parse(product.subcategory);
                        if (Array.isArray(subcategoryArray) && subcategoryArray.length > 0) {
                            subcategoryArray.forEach(subcat => {
                                if (subcat && subcat.trim() !== '') { // تأكد من أن القيمة ليست فارغة
                                    const subcategoryInfo = subcategoryMap[subcat];
                                    if (subcategoryInfo) {
                                        subcategoryNames.push(subcategoryInfo.name);
                                        subcategoryColors.push(subcategoryInfo.color);
                                    } else {
                                        // محاولة إصلاح البيانات إذا لم يتم العثور عليها في الخريطة
                                        subcategoryNames.push(subcat);
                                        subcategoryColors.push('bg-gray-500');
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        // Error parsing subcategory JSON
                    }
                } else {
                    // It's a plain string, check if it's a key in subcategoryMap first
                    
                    // First, try direct key matching
                    const subcategoryInfo = subcategoryMap[product.subcategory];
                    if (subcategoryInfo) {
                        subcategoryNames = [subcategoryInfo.name];
                        subcategoryColors = [subcategoryInfo.color];
                    } else {
                        // If not found as key, try to find by display name
                        const foundKey = Object.keys(subcategoryMap).find(key => 
                            subcategoryMap[key].name === product.subcategory
                        );
                        if (foundKey) {
                            subcategoryNames = [subcategoryMap[foundKey].name];
                            subcategoryColors = [subcategoryMap[foundKey].color];
                        } else {
                            // If still not found, use the original string but format it
                            if (product.subcategory && product.subcategory.trim() !== '') {
                                subcategoryNames = [product.subcategory];
                                subcategoryColors = ['bg-gray-500'];
                            }
                        }
                    }
                }
            } else {
                // No subcategory data found or subcategory is null/undefined
            }
            
            // إذا لم توجد تصنيفات فرعية، استخدم قيم افتراضية
            if (subcategoryNames.length === 0) {
                // محاولة إصلاح البيانات إذا كانت فارغة أو غير صحيحة
                if (product.subcategory && typeof product.subcategory === 'string' && product.subcategory.trim() !== '') {
                    // إذا كان التصنيف الفرعي موجود لكن لم يتم العثور عليه في الخريطة
                    subcategoryNames = [product.subcategory];
                    subcategoryColors = ['bg-gray-500'];
                } else if (product.subcategory && Array.isArray(product.subcategory) && product.subcategory.length > 0) {
                    // إذا كان التصنيف الفرعي مصفوفة لكن لم يتم العثور عليها في الخريطة
                    product.subcategory.forEach(subcat => {
                        if (subcat && subcat.trim() !== '') {
                            subcategoryNames.push(subcat);
                            subcategoryColors.push('bg-gray-500');
                        }
                    });
                } else {
                    subcategoryNames = ['دعوة'];
                    subcategoryColors = ['bg-gray-500'];
                }
            }
            
            // تأكد من أن عدد الألوان يتطابق مع عدد الأسماء
            while (subcategoryColors.length < subcategoryNames.length) {
                subcategoryColors.push('bg-gray-500');
            }
            while (subcategoryColors.length > subcategoryNames.length) {
                subcategoryColors.pop();
            }
            
            const images = (Array.isArray(product.image_urls) && product.image_urls.length > 0) ? product.image_urls : [imageUrl];
            card.innerHTML = `
                <div class="image-container" tabindex="0" data-product-id="${product.id}">
                    ${images.map((url, idx) => `
                        <img src="${url}" alt="${product.name || 'منتج'}" class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105 cursor-pointer slider-image ${idx === 0 ? '' : 'hidden'}" loading="${idx === 0 ? 'eager' : 'lazy'}" onclick="viewProduct('${product.id}')">
                    `).join('')}
                    ${images.length > 1 ? `
                        <button class="slider-btn slider-prev" aria-label="السابق">‹</button>
                        <button class="slider-btn slider-next" aria-label="التالي">›</button>
                    ` : ''}
                    <div class="slider-dots">
                        ${images.map((_, i) => `
                            <button class="slider-dot ${i === 0 ? 'active' : ''}" aria-label="الصورة ${i + 1}" data-index="${i}"></button>
                        `).join('')}
                    </div>
                    <!-- أيقونة المفضلة -->
                    <div class="absolute top-3 left-3">
                        <button class="favorite-btn bg-white rounded-full p-2 shadow-lg hover:bg-pink-50 transition-all duration-200" onclick="toggleFavorite(event, '${product.id}', '${product.name || 'منتج'}', '${imageUrl}', '${product.price || 0}', '${product.governorate || ''}', '${product.cities || ''}', '${subcategoryNames.join(',')}')">
                            <svg class="w-5 h-5 ${isFavorite(product.id) ? 'text-pink-500 fill-current' : 'text-gray-400'}" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-3 sm:p-4">
                    ${subcategoryNames.length > 0 ? `
                        <div class="mb-2 flex flex-wrap gap-1">
                            ${subcategoryNames.map((name, index) => {
                                const color = subcategoryColors[index];
                                const bgColor = color.replace('bg-', 'bg-').replace('-500', '-100');
                                const textColor = color.replace('bg-', 'text-').replace('-500', '-800');
                                // تقسيم النصوص الطويلة على عدة سطور
                                let displayName = name;
                                if (name === 'استقبال المولود بالمستشفى') {
                                    displayName = 'استقبال المولود<br>بالمستشفى';
                                } else if (name.length > 15) {
                                    // تقسيم النصوص الأخرى الطويلة تلقائياً
                                    const words = name.split(' ');
                                    if (words.length > 2) {
                                        const mid = Math.ceil(words.length / 2);
                                        displayName = words.slice(0, mid).join(' ') + '<br>' + words.slice(mid).join(' ');
                                    }
                                }

                                return `
                                    <span class="inline-block ${bgColor} ${textColor} text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                        ${displayName}
                                    </span>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}

                    <div class="flex justify-between items-center">
                        <span class="gold-text font-bold text-sm sm:text-lg">
                            ${product.price > 0 ? product.price + ' ج.م' : 'السعر عند الطلب'}
                        </span>
                        <div class="flex flex-col items-end gap-1">
                            ${product.governorate ? `<span class="text-xs sm:text-sm bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">${product.governorate}</span>` : ''}
                                                                ${product.cities && product.cities.trim() !== '' && product.cities !== 'جميع المدن' ? `<span class="text-xs sm:text-sm bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">${product.cities.split(',')[0].trim()}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            return card;
        }

        // تحديث عداد المنتجات

function showLoadingState() {
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('products-container').classList.add('hidden');
            document.getElementById('empty-state').classList.add('hidden');
        }

        // إخفاء حالة التحميل

function hideLoadingState() {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('products-container').classList.remove('hidden');
        }

        // إظهار حالة عدم وجود منتجات

function showEmptyState() {
            document.getElementById('empty-state').classList.remove('hidden');
            document.getElementById('products-container').classList.add('hidden');
            document.getElementById('loading-state').classList.add('hidden');
        }



        // ترتيب المنتجات

function sortProducts(sortType) {
            switch(sortType) {
                case 'newest':
                    filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'oldest':
                    filteredProducts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    break;
                case 'price-low':
                    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
                    break;
                case 'name':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                    break;
            }
            currentPage = 1;
            displayProducts(filteredProducts);
        }

        // View product details

function updateCitiesFilter(selected) {
            activeFilters.cities = selected;
            const placeholder = document.getElementById('cities-placeholder');
            if (activeFilters.cities.length === 0) {
                placeholder.textContent = 'اختر المدن/المناطق';
            } else if (activeFilters.cities.length === 1) {
                placeholder.textContent = activeFilters.cities[0];
            } else {
                placeholder.textContent = `${activeFilters.cities.length} مدينة مختارة`;
            }
            
            const selectedCitiesContainer = document.getElementById('selected-cities');
            if (activeFilters.cities.length === 0) {
                selectedCitiesContainer.innerHTML = '';
            } else {
                selectedCitiesContainer.innerHTML = activeFilters.cities.map(city => `
                    <span class="selected-tag">
                        ${city}
                        <button class="remove-tag" onclick="removeCity('${city}')">×</button>
                    </span>
                `).join('');
            }
            applyFilters();
        }

function updateCitiesFilter() {
            const selected = [];
            const checkboxes = document.querySelectorAll('.city-checkbox:checked');
            
            checkboxes.forEach(checkbox => {
                selected.push(checkbox.value);
            });
            
            activeFilters.cities = selected;
            
            // Update placeholder
            const placeholder = document.getElementById('cities-placeholder');
            if (selected.length === 0) {
                placeholder.textContent = 'اختر المدن/المناطق';
            } else if (selected.length === 1) {
                placeholder.textContent = selected[0];
            } else {
                placeholder.textContent = `${selected.length} مدينة مختارة`;
            }
            
            // Update selected cities display
            const selectedContainer = document.getElementById('selected-cities');
            if (selected.length === 0) {
                selectedContainer.innerHTML = '';
            } else {
                selectedContainer.innerHTML = selected.map(city => `
                    <span class="selected-tag">
                        ${city}
                        <button class="remove-tag" onclick="removeCity('${city}')">×</button>
                    </span>
                `).join('');
            }
            
            applyFilters();
        }

function getPriceLabel(price) {
            const labels = {
                '0-200': 'حتى 200 ج.م',
                '200-500': '200 - 500 ج.م',
                '500-1000': '500 - 1000 ج.م',
                '1000+': 'أكثر من 1000 ج.م',
                'negotiable': 'السعر عند الطلب'
            };
            return labels[price] || price;
        }

        // Remove specific filter

function removeSubcategory(subcategory) {
            activeFilters.subcategory = activeFilters.subcategory.filter(s => s !== subcategory);
            updateActiveFiltersDisplay();
            applyFilters();
        }

        // Function to scroll to product request section (placeholder)

function scrollToProductRequestSection() {
            alert('سيتم إضافة قسم طلب المنتج قريباً');
        }

        // تحميل وعرض الإعلانات المميزة في التصنيف

function displayPagination(totalProducts) {
            const totalPages = Math.ceil(totalProducts / productsPerPage);
            const paginationContainer = document.getElementById('pagination-container');
            
            if (totalPages <= 1) {
                paginationContainer.classList.add('hidden');
                return;
            }
            
            paginationContainer.classList.remove('hidden');
            
            let paginationHTML = '<div class="flex items-center justify-center space-x-2 space-x-reverse">';
            
            // زر السابق
            if (currentPage > 1) {
                paginationHTML += `<a href="?page=${currentPage - 1}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">السابق</a>`;
            } else {
                paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">السابق</span>`;
            }
            
            // أرقام الصفحات
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            if (startPage > 1) {
                paginationHTML += `<a href="?page=1" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">1</a>`;
                if (startPage > 2) {
                    paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-500">...</span>`;
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-white bg-pink-500 border border-pink-500 rounded-md">${i}</span>`;
                } else {
                    paginationHTML += `<a href="?page=${i}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">${i}</a>`;
                }
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-500">...</span>`;
                }
                paginationHTML += `<a href="?page=${totalPages}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">${totalPages}</a>`;
            }
            
            // زر التالي
            if (currentPage < totalPages) {
                paginationHTML += `<a href="?page=${currentPage + 1}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">التالي</a>`;
            } else {
                paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">التالي</span>`;
            }
            
            paginationHTML += '</div>';
            
            // معلومات الصفحة الحالية
            paginationHTML += `
                <div class="text-center mt-4 text-sm text-gray-600">
                    صفحة ${currentPage} من ${totalPages} • عرض ${Math.min((currentPage - 1) * productsPerPage + 1, totalProducts)} - ${Math.min(currentPage * productsPerPage, totalProducts)} من ${totalProducts} منتج
                </div>
            `;
            
            paginationContainer.innerHTML = paginationHTML;
        }

function goToPage(pageNumber) {
            currentPage = pageNumber;
            updateURL();
            // تأخير صغير للتأكد من تحديث DOM قبل التمرير
            setTimeout(() => {
                scrollToTop();
            }, 50);
            applyFilters(false);
        }

        // مستمع النقر على الترقيم
        document.addEventListener('click', function(event) {
            if (event.target.matches('#pagination-container a[href*="page="]')) {
                event.preventDefault();
                const href = event.target.getAttribute('href');
                const pageMatch = href.match(/page=(\d+)/);
                if (pageMatch) {
                    const pageNumber = parseInt(pageMatch[1]);
                    goToPage(pageNumber);
                }
            }
        });

        // مستمع تغيير التاريخ
        window.addEventListener('popstate', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const newPage = parseInt(urlParams.get('page')) || 1;
            if (newPage !== currentPage) {
                currentPage = newPage;
                applyFilters(false);
            }
        });

