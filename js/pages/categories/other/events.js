/* events module for other */

function cleanLocationData(data) {
            if (!data || typeof data !== 'string') return '';
            const cleaned = data.trim();
            return cleaned !== '' && cleaned !== 'null' && cleaned !== 'undefined' && cleaned !== 'جميع المدن' ? cleaned : '';
        }

        // دالة مساعدة لتنظيف بيانات المدن

function cleanCitiesData(cities) {
            if (!cities || typeof cities !== 'string') return '';
            const cleaned = cities.trim();
            if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined' || cleaned === 'جميع المدن') return '';
            
            // تنظيف كل مدينة على حدة
            const cityArray = cities.split(',').map(city => city.trim()).filter(city => 
                city !== '' && city !== 'null' && city !== 'undefined'
            );
            
            return cityArray.length > 0 ? cityArray[0] : '';
        }

        // دالة مساعدة للتحقق من صحة البيانات

function validateLocationData(data) {
            if (!data) return false;
            if (typeof data !== 'string') return false;
            const cleaned = data.trim();
            return cleaned !== '' && cleaned !== 'null' && cleaned !== 'undefined' && cleaned !== 'جميع المدن';
        }

        // دالة مساعدة لتنظيف البيانات قبل العرض

function sanitizeDisplayData(data) {
            if (!validateLocationData(data)) return '';
            return data.trim();
        }

        // Load products on page load
        document.addEventListener('DOMContentLoaded', async function() {
            // قراءة رقم الصفحة من URL
            const urlParams = new URLSearchParams(window.location.search);
            currentPage = parseInt(urlParams.get('page')) || 1;
            
            // التمرير لأعلى إذا كانت الصفحة ليست الأولى
            if (currentPage > 1) {
                setTimeout(() => {
                    scrollToTop();
                }, 100);
            }
            

            
            // Initialize filters from URL (subcategory, governorate, cities, price)
            initializeFiltersFromURL();
            
            await loadCategoryProducts();
            setupAdvancedFilters();
            setupToggleFilters();
        });

        // Load products by category

function updateAllFavoriteIcons() {
            const productCards = document.querySelectorAll('.product-card');
            if (productCards.length > 0) {
                productCards.forEach(card => {
                    const productId = card.getAttribute('data-product-id');
                    if (productId) {
                        updateFavoriteIcon(productId);
                    }
                });
            } else {
                // إعادة المحاولة بعد نصف ثانية
                setTimeout(updateAllFavoriteIcons, 500);
            }
        }

        // مراقبة التغييرات في DOM للتأكد من تحميل المنتجات
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // التحقق من إضافة بطاقات منتجات جديدة
                    const hasNewProducts = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && node.classList && node.classList.contains('product-card')
                    );
                    
                    if (hasNewProducts) {
                        setTimeout(updateAllFavoriteIcons, 100);
                    }
                }
            });
        });

        // تحميل وعرض الإعلانات المميزة في التصنيف

function setupScrollingFilter() {
            const filterSection = document.querySelector('.filter-section');
            const originalPosition = filterSection.offsetTop;
            let filterHeight = filterSection.offsetHeight;
            
            window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > originalPosition) {
                    filterSection.classList.add('scrolled');
                    // إضافة مساحة لتجنب القفز
                    document.body.style.paddingTop = filterHeight + 'px';
                } else {
                    filterSection.classList.remove('scrolled');
                    document.body.style.paddingTop = '0';
                }
            });
            
            // تحديث الارتفاع عند تغيير حجم النافذة
            window.addEventListener('resize', function() {
                filterHeight = filterSection.offsetHeight;
                if (filterSection.classList.contains('scrolled')) {
                    document.body.style.paddingTop = filterHeight + 'px';
                }
            });
        }

        // بدء المراقبة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            // إعداد فلتر التمرير
            setupScrollingFilter();
            
            // تحميل الإعلانات المميزة في التصنيف
            loadCategoryFeaturedAds();
            
            // مراقبة المراقبة في حاوية المنتجات
            const productsContainer = document.getElementById('products-container');
            if (productsContainer) {
                observer.observe(productsContainer, {
                    childList: true,
                    subtree: true
                });
            }
            
            // محاولة تحديث أيقونات المفضلة بعد تحميل الصفحة
            setTimeout(updateAllFavoriteIcons, 500);
            
            // تحديث عداد المفضلة عند تحميل الصفحة
            updateFavoritesCountBadge();
            
            // مراقبة التغييرات في localStorage (المفضلة)
            window.addEventListener('storage', function(e) {
                if (e.key === 'favorites') {
                    updateFavoritesCountBadge();
                }
            });
            // تهيئة السلايدر بعد أول عرض
            setTimeout(initCardSliders, 300);
        });

function displayPagination(totalProducts) {
            const totalPages = Math.ceil(totalProducts / productsPerPage);
            const paginationContainer = document.getElementById('pagination-container');
            console.log('displayPagination:', { totalProducts, totalPages, currentPage, productsPerPage });
            
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
            console.log('goToPage called with:', pageNumber);
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
                    console.log('Clicking on page:', pageNumber);
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

