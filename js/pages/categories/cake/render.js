/* render module for cake */

function displayProductsWithPagination() {
            // حساب إجمالي عدد الصفحات
            totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
            
            // التأكد من أن الصفحة الحالية في النطاق الصحيح
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
                updateURL();
            }
            
            // حساب المنتجات للصفحة الحالية
            const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
            const endIndex = startIndex + PRODUCTS_PER_PAGE;
            const currentPageProducts = filteredProducts.slice(startIndex, endIndex);
            
            // عرض المنتجات
            displayProducts(currentPageProducts);
            
            // تحديث ترقيم الصفحات
            updatePaginationUI();
        }

        // تحديث واجهة ترقيم الصفحات

function updateProductsCount() {
            const productsCount = document.getElementById('products-count');
            productsCount.textContent = `${filteredProducts.length} منتج`;
        }

        // Update active filters display

function displayProducts(products) {
            const container = document.getElementById('products-container');
            const loadingState = document.getElementById('loading-state');
            const emptyState = document.getElementById('empty-state');
            
            // Hide loading state
            loadingState.classList.add('hidden');
            
            if (!products || products.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            container.innerHTML = products.map(product => {
                const imageUrl = product.image_urls && product.image_urls.length > 0 
                    ? product.image_urls[0] 
                    : 'https://placehold.co/400x300/EEE/31343C?text=لا+توجد+صورة';
                
                // Get subcategory display name
                let subcategoryNames = [];
                let subcategoryColors = [];
                

                
                if (product.subcategory && Array.isArray(product.subcategory) && product.subcategory.length > 0) {
                    const subcategoryMap = {
                        'cake-wedding': { name: 'تورتة زفاف', color: 'bg-pink-500' },
                        'cake-engagement': { name: 'تورتة خطوبة', color: 'bg-purple-500' },
                        'cake-birthday': { name: 'تورتة عيد ميلاد', color: 'bg-yellow-500' },
                        'cake-chocolate': { name: 'تورتة شوكولاتة', color: 'bg-amber-500' },
                        'cake-fruit': { name: 'تورتة فواكه', color: 'bg-green-500' },
                        'cake-chocolate-tray': { name: 'صينية شوكولاتة', color: 'bg-orange-500' }
                    };
                    
                    // معالجة جميع التصنيفات الفرعية
                    product.subcategory.forEach(subcat => {
                        const subcategoryInfo = subcategoryMap[subcat];
                        if (subcategoryInfo) {
                            subcategoryNames.push(subcategoryInfo.name);
                            subcategoryColors.push(subcategoryInfo.color);
                        }
                    });
                } else if (product.subcategory && typeof product.subcategory === 'string') {
                    // Handle case where subcategory is a JSON string or Arabic text
                    
                    // خريطة للنصوص العربية المباشرة
                    const arabicToCodeMap = {
                        'تورتة زفاف': 'cake-wedding',
                        'تورتة زواج': 'cake-wedding',
                        'تورتة الزفاف': 'cake-wedding',
                        'تورتة خطوبة': 'cake-engagement',
                        'تورتة الخطوبة': 'cake-engagement',
                        'تورتة عيد ميلاد': 'cake-birthday',
                        'تورتة عيد الميلاد': 'cake-birthday',
                        'تورتة شوكولاتة': 'cake-chocolate',
                        'تورتة فواكه': 'cake-fruit',
                        'تورتة الفواكه': 'cake-fruit',
                        'صينية شوكولاتة': 'cake-chocolate-tray',
                        'صينية الشوكولاتة': 'cake-chocolate-tray'
                    };
                    
                    try {
                        let subcategoryArray = [];
                        
                        // محاولة تحليل JSON أولاً
                        try {
                            subcategoryArray = JSON.parse(product.subcategory);
                        } catch (parseError) {
                            // إذا فشل JSON، تحقق من النص العربي المباشر
                            const subcategoryCode = arabicToCodeMap[product.subcategory];
                            if (subcategoryCode) {
                                subcategoryArray = [subcategoryCode];
                            } else {
                                // استخدم النص كما هو
                                subcategoryArray = [product.subcategory];
                            }
                        }
                        
                        if (Array.isArray(subcategoryArray) && subcategoryArray.length > 0) {
                            const subcategoryMap = {
                                'cake-wedding': { name: 'تورتة زفاف', color: 'bg-pink-500' },
                                'cake-engagement': { name: 'تورتة خطوبة', color: 'bg-purple-500' },
                                'cake-birthday': { name: 'تورتة عيد ميلاد', color: 'bg-yellow-500' },
                                'cake-chocolate': { name: 'تورتة شوكولاتة', color: 'bg-amber-500' },
                                'cake-fruit': { name: 'تورتة فواكه', color: 'bg-green-500' },
                                'cake-chocolate-tray': { name: 'صينية شوكولاتة', color: 'bg-orange-500' }
                            };
                            
                            // معالجة جميع التصنيفات الفرعية
                            subcategoryArray.forEach(subcat => {
                                const subcategoryInfo = subcategoryMap[subcat];
                                if (subcategoryInfo) {
                                    subcategoryNames.push(subcategoryInfo.name);
                                    subcategoryColors.push(subcategoryInfo.color);
                                } else {
                                    // إذا لم يتم العثور على ترجمة، استخدم النص كما هو
                                    subcategoryNames.push(subcat);
                                    subcategoryColors.push('bg-gray-500');
                                }
                            });
                        }
                    } catch (error) {
                        console.error('🔍 Error processing subcategory:', error);
                    }
                } else if (product.subcategory) {
                    // محاولة أخيرة لمعالجة أي تنسيق آخر
                    console.log('🔍 Fallback subcategory processing:', product.subcategory);
                    const subcategoryMap = {
                        'cake-wedding': { name: 'تورتة زفاف', color: 'bg-pink-500' },
                        'cake-engagement': { name: 'تورتة خطوبة', color: 'bg-purple-500' },
                        'cake-birthday': { name: 'تورتة عيد ميلاد', color: 'bg-yellow-500' },
                        'cake-chocolate': { name: 'تورتة شوكولاتة', color: 'bg-amber-500' },
                        'cake-fruit': { name: 'تورتة فواكه', color: 'bg-green-500' },
                        'cake-chocolate-tray': { name: 'صينية شوكولاتة', color: 'bg-orange-500' }
                    };
                    
                    const subcategoryInfo = subcategoryMap[product.subcategory];
                    if (subcategoryInfo) {
                        subcategoryNames.push(subcategoryInfo.name);
                        subcategoryColors.push(subcategoryInfo.color);
                    }
                }
                

                

                
                const images = (Array.isArray(product.image_urls) && product.image_urls.length > 0) ? product.image_urls : [imageUrl];
                const initialIndex = Math.min(sliderState.get(product.id) || 0, images.length - 1);
                return `
                    <div class="product-card bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300" data-product-id="${product.id}">
                        <div class="image-container" tabindex="0" data-product-id="${product.id}">
                            ${images.map((url, idx) => `<img src="${url}" alt="${product.title || 'منتج'}" class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105 cursor-pointer slider-image ${idx === initialIndex ? '' : 'hidden'}" loading="${idx === initialIndex ? 'eager' : 'lazy'}" onclick="viewProduct('${product.id}')">`).join('')}
                            ${images.length > 1 ? `<button class="slider-btn slider-prev" aria-label="السابق">‹</button><button class="slider-btn slider-next" aria-label="التالي">›</button>` : ''}
                            <div class="slider-dots">${images.map((_, i) => `<button class="slider-dot ${i === initialIndex ? 'active' : ''}" aria-label="الصورة ${i + 1}" data-index="${i}"></button>`).join('')}</div>
                            <div class="absolute top-3 left-3">
                                <button class="favorite-btn bg-white rounded-full p-2 shadow-lg hover:bg-pink-50 transition-all duration-200" onclick="toggleFavorite(event, '${product.id}', '${product.title || 'منتج'}', '${imageUrl}', '${product.price || 0}', '${product.governorate || ''}', '${product.cities || ''}', '${subcategoryNames.join(',')}')">
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
                    </div>
                `;
            }).join('');
            initCardSliders();
        }

        // View product details

function viewProduct(productId) {
            window.location.href = `../products/product-details.html?id=${productId}`;
        }

        // عرض تفاصيل المنتج

function viewProductDetails(productId) {
            // البحث عن المنتج في القائمة
            let product = allProducts.find(p => p.id === productId);
            
            // إذا لم يتم العثور على المنتج، قد يكون منتج مميز
            if (!product) {
                // البحث في المنتجات المميزة
                const featuredAdsContainer = document.getElementById('featured-ads-container');
                if (featuredAdsContainer) {
                    const featuredAd = featuredAdsContainer.querySelector(`[data-ad-id="${productId}"]`);
                    if (featuredAd) {
                        // استخراج بيانات المنتج المميز من العنصر
                        const adData = JSON.parse(featuredAd.getAttribute('data-ad-info') || '{}');
                        if (adData.id) {
                            product = adData;
                            
                            // تسجيل النقر على الإعلان إذا كان موجوداً
                            if (product.ad_id && window.advertisingService) {
                                try {
                                    window.advertisingService.recordClick(product.ad_id);
                                } catch (error) {
                                    console.error('❌ خطأ في تسجيل النقر:', error);
                                }
                            }
                        }
                    }
                }
            }
            
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                return;
            }

            // إنشاء نافذة منبثقة لعرض التفاصيل
            showProductDetailsModal(product);
        }

        // عرض نافذة تفاصيل المنتج

function showProductDetailsModal(product) {
            // إزالة النوافذ المنبثقة السابقة
            const existingModal = document.querySelector('.product-details-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // إنشاء النافذة المنبثقة
            const modal = document.createElement('div');
            modal.className = 'product-details-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
            
            // الحصول على الصورة الأولى
            const imageUrl = product.image_urls && product.image_urls.length > 0 
                ? product.image_urls[0] 
                : '../assets/images/cake.jpg';

            modal.innerHTML = `
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                    <!-- Header -->
                    <div class="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                        <h2 class="text-xl font-bold text-gray-800">تفاصيل المنتج</h2>
                        <button onclick="closeProductDetailsModal()" class="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                            ×
                        </button>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <!-- Main Image -->
                        <div class="mb-4">
                            <img id="modal-main-image" src="${imageUrl}" alt="${product.name || 'منتج'}" 
                                 class="w-55 h-48 object-cover rounded-lg mx-auto">
                        </div>
                        
                        <!-- Image Gallery -->
                        ${product.image_urls && product.image_urls.length > 1 ? `
                            <div class="mb-6">
                                <h4 class="text-sm font-medium text-gray-700 mb-3">معرض الصور</h4>
                                <div class="flex space-x-2 space-x-reverse overflow-x-auto pb-2">
                                    ${product.image_urls.map((url, index) => `
                                        <img src="${url}" 
                                             alt="صورة ${index + 1}" 
                                             class="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-yellow-400 transition-colors"
                                             onclick="changeModalMainImage('${url}')"
                                             loading="lazy">
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Product Info -->
                        <div class="space-y-4">
                            <!-- Price -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">السعر</h3>
                                <p class="text-2xl font-bold text-yellow-600">
                                    ${product.price > 0 ? product.price + ' ج.م' : 'السعر عند الطلب'}
                                </p>
                            </div>
                            
                            <!-- Description -->
                            ${product.description ? `
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">الوصف</h3>
                                    <p class="text-gray-600">${product.description}</p>
                                </div>
                            ` : ''}
                            
                            <!-- Location -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">الموقع</h3>
                                <div class="space-y-2">
                                    ${product.governorate ? `<p class="text-gray-600">المحافظة: ${product.governorate}</p>` : ''}
                                    ${product.cities ? `<p class="text-gray-600">المدينة: ${product.cities}</p>` : ''}
                                </div>
                            </div>
                            
                            <!-- Category -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">التصنيف</h3>
                                <p class="text-gray-600">${product.category || 'غير محدد'}</p>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex gap-3 mt-6 pt-6 border-t">
                            <!-- Favorite Button -->
                            <button onclick="toggleFavoriteFromModal('${product.id}')" 
                                    class="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                                ${isFavorite(product.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                            </button>
                        </div>
                                                <!-- التواصل مع البائع -->
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <h4 class="text-lg font-semibold text-gray-800 mb-2">تواصل مع البائع</h4>
                            <p class="text-sm text-gray-600 mb-4">جميع وسائل التواصل التالية تخص البائع لهذا المنتج.</p>
                            <div class="space-y-3">
                                ${product.whatsapp ? `
                                    <button onclick="openWhatsAppChat('${product.id}', '${product.name || 'منتج'}', '${product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : ''}', '${product.price || 0}', '${product.governorate || ''}', '${product.cities || ''}', '${product.subcategories ? product.subcategories.join(',') : ''}', '${product.whatsapp}')"
                                       class="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.86 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                                        </svg>
                                        راسل البائع عبر واتساب
                                    </button>
                                ` : ''}

                                ${product.facebook ? `
                                    <a href="${product.facebook}" target="_blank"
                                       class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        صفحة البائع على فيسبوك
                                    </a>
                                ` : ''}

                                ${product.instagram ? `
                                    <a href="${(() => {
                                        let instagramUrl = product.instagram;
                                        if (!instagramUrl.startsWith('http://') && !instagramUrl.startsWith('https://')) {
                                            if (instagramUrl.includes('instagram.com')) {
                                                instagramUrl = 'https://' + instagramUrl;
                                            } else {
                                                instagramUrl = 'https://www.instagram.com/' + instagramUrl;
                                            }
                                        }
                                        return instagramUrl;
                                    })()}" target="_blank"
                                       class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                                        </svg>
                                        تابع البائع على إنستجرام
                                    </a>
                                ` : ''}

                                ${!product.facebook && !product.instagram && !product.whatsapp ? `
                                    <div class="text-center text-gray-500 text-sm py-3 w-full">
                                        لا توجد وسائل تواصل متاحة للبائع
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <!-- رسالة التنويه -->
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div class="flex items-start gap-3">
                                    <div class="flex-shrink-0 mt-1">
                                        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5 class="text-sm font-semibold text-blue-800 mb-1">تنويه مهم</h5>
                                        <p class="text-sm text-blue-700 leading-relaxed">
                                            نحن منصة لعرض المنتجات فقط، ولسنا طرفًا في البيع أو التوصيل. جميع التعاملات تتم بين البائع والمشتري بشكل مباشر.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // إغلاق النافذة عند النقر خارجها
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeProductDetailsModal();
                }
            });
        }

        // إغلاق نافذة تفاصيل المنتج

function closeProductDetailsModal() {
            const modal = document.querySelector('.product-details-modal');
            if (modal) {
                modal.remove();
            }
        }

        // تبديل المفضلة من النافذة المنبثقة

function showError(message) {
            alert(message);
        }

        // Global functions for cities filter












        // ===== وظائف إدارة المفضلة =====
        
        // التحقق من وجود منتج في المفضلة

function showNotification(message, type = 'info') {
            // إزالة الإشعارات السابقة
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            const notification = document.createElement('div');
            notification.className = `notification fixed top-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-300 translate-x-0`;
            
            // تحديد لون الإشعار حسب النوع
            if (type === 'success') {
                notification.style.backgroundColor = '#10b981'; // أخضر
            } else if (type === 'error') {
                notification.style.backgroundColor = '#ef4444'; // أحمر
            } else {
                notification.style.backgroundColor = '#3b82f6'; // أزرق
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);

            // إخفاء الإشعار بعد 3 ثوان
            setTimeout(() => {
                notification.style.transform = 'translateX(-100%)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // تحديث عداد المفضلة

function displayCategoryFeaturedAds(ads) {
            const container = document.getElementById('featured-ads-container');
            const noAdsMessage = document.getElementById('no-featured-ads');
            
            if (!container) return;
            
            if (!ads || ads.length === 0) {
                showNoFeaturedAds();
                return;
            }
            
            // إخفاء رسالة عدم وجود إعلانات
            if (noAdsMessage) {
                noAdsMessage.classList.add('hidden');
            }
            
            const adsHTML = ads.map(ad => {
                const imgs = Array.isArray(ad.image_urls) && ad.image_urls.length>0 ? ad.image_urls : [ad.image_url || '../assets/images/cake.jpg'];
                return `
                <div class="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 flex-shrink-0 cursor-pointer" 
                     style="width: 200px;"
                     data-ad-id="${ad.id}"
                     data-product-id="${ad.id}"
                     data-ad-info='${JSON.stringify(ad)}'
                     onclick="viewProductDetails('${ad.id}')">
                    <div class="relative image-container" data-product-id="${ad.id}" tabindex="0">
                        ${imgs.map((u,i)=>`<img src="${u}" alt="${ad.title}" class="w-full h-40 object-cover slider-image ${i===0?'':'hidden'}" loading="${i===0?'eager':'lazy'}">`).join('')}
                        ${imgs.length>1?`<button class=\"slider-btn slider-prev\" aria-label=\"السابق\" onclick=\"event.stopPropagation(); event.preventDefault(); handleSliderClick(this, 'prev');\">‹</button><button class=\"slider-btn slider-next\" aria-label=\"التالي\" onclick=\"event.stopPropagation(); event.preventDefault(); handleSliderClick(this, 'next');\">›</button>`:''}
                        <div class="slider-dots">${imgs.map((_,i)=>`<button class="slider-dot ${i===0?'active':''}" aria-label="الصورة ${i+1}" data-index="${i}" onclick="event.stopPropagation(); event.preventDefault(); handleDotClick(this);"></button>`).join('')}</div>
                        <div class="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">⭐ مميز</div>
                        <button onclick="toggleFavorite(event, '${ad.id}', '${ad.title}', '${ad.image_url || '../assets/images/cake.jpg'}', ${ad.price || 0}, '${ad.governorate || ''}', '${ad.cities || ''}', '${ad.subcategories ? ad.subcategories.join(',') : ''}')" 
                                class="absolute top-1 left-1 bg-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 favorite-btn border-2 border-white">
                            <svg class="w-4 h-4 ${isFavorite('${ad.id}') ? 'text-pink-500 fill-current' : 'text-gray-400'}" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="p-3">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-bold text-yellow-600">
                                ${ad.price > 0 ? ad.price + ' ج.م' : 'السعر عند الطلب'}
                            </span>
                            <span class="text-xs text-gray-500">${ad.governorate}</span>
                        </div>
                        
                        <div class="flex gap-1">
                        </div>
                    </div>
                </div>`;
            }).join('');
            
            container.innerHTML = adsHTML;
            initCardSliders();
        }

function showNoFeaturedAds() {
            const container = document.getElementById('featured-ads-container');
            const noAdsMessage = document.getElementById('no-featured-ads');
            
            if (container) {
                container.innerHTML = '';
            }
            
            if (noAdsMessage) {
                noAdsMessage.classList.remove('hidden');
            }
        }
        
        // تغيير الصورة الرئيسية في النافذة المنبثقة

function changeModalMainImage(imageUrl) {
            const mainImage = document.getElementById('modal-main-image');
            if (mainImage) {
                mainImage.src = imageUrl;
            }
        }

        // دالة فتح محادثة الواتساب مع رسالة تلقائية

function openWhatsAppChat(productId, title, imageUrl, price, governorate, cities, subcategories, whatsappNumber) {
            // تنظيف رقم الهاتف من جميع الأحرف غير الرقمية
            let phoneNumber = whatsappNumber.replace(/[^0-9]/g, '');
            
            // إزالة الرمز الدولي إذا كان موجوداً في البداية
            if (phoneNumber.startsWith('20')) {
                phoneNumber = phoneNumber.substring(2);
            }
            
            // إضافة الرمز الدولي لمصر إذا لم يكن موجوداً
            if (!phoneNumber.startsWith('20') && !phoneNumber.startsWith('+20')) {
                phoneNumber = '20' + phoneNumber;
            }
            
            // إنشاء رسالة واتساب محسنة
            let message = ``;
            
            // إضافة السعر أولاً
            if (price && price > 0) {
                message += `💰 السعر: ${price} ج.م\n`;
            }
            
            // إضافة رابط الصورة ثانياً
            if (imageUrl && imageUrl !== '../assets/images/cake.jpg') {
                message += `🖼️ رابط الصورة: ${imageUrl}\n`;
            }
            
            // إضافة رابط المنتج ثالثاً
            message += `🔗 رابط المنتج: ${window.location.origin}/pages/products/product-details.html?id=${productId}\n\n`;
            
            // إضافة التحية والاستفسار في النهاية
            message += `مرحباً، أريد الاستفسار عن هذا المنتج`;
            
            // إنشاء رابط الواتساب
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            // التحقق من أن المستخدم على جهاز محمول
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                // محاولة فتح تطبيق الواتساب مباشرة
                window.location.href = whatsappUrl;
            } else {
                // على الكمبيوتر، فتح في تبويب جديد
                window.open(whatsappUrl, '_blank');
            }
        }

        // تحديث جميع أيقونات المفضلة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            // تهيئة خدمة الإعلانات الذكية
            initializeSmartAdvertising();
            
            // تحميل الإعلانات المميزة في التصنيف
            loadCategoryFeaturedAds();
            
            // تحديث أيقونات المفضلة بعد تحميل المنتجات
            setTimeout(() => {
                const productCards = document.querySelectorAll('.product-card');
                productCards.forEach(card => {
                    const productId = card.getAttribute('data-product-id');
                    if (productId) {
                        updateFavoriteIcon(productId);
                    }
                });
                
                // تحديث أيقونات المفضلة في بطاقات المنتجات المميزة
                const featuredAds = document.querySelectorAll('[data-ad-id]');
                featuredAds.forEach(ad => {
                    const adId = ad.getAttribute('data-ad-id');
                    if (adId) {
                        updateFeaturedAdFavoriteIcon(adId);
                    }
                });
            }, 1000);
            
            // تحديث عداد المفضلة عند تحميل الصفحة
            updateFavoritesCountBadge();
            
            // مراقبة التغييرات في localStorage (المفضلة)
            window.addEventListener('storage', function(e) {
                if (e.key === 'favorites') {
                    updateFavoritesCountBadge();
                }
            });
        });




