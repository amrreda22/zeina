/* events module for koshat */

function applyQueryParamsToFilters() {
            const params = new URLSearchParams(window.location.search);
            const subcats = params.getAll('subcat');
            const govs = params.getAll('gov');
            const cities = params.getAll('city');
            const district = params.get('district') || '';
            const pmin = params.get('pmin');
            const pmax = params.get('pmax');
            extrasText = params.get('extras') || '';
            sortOption = params.get('sort') || 'latest';

            if (subcats.length) activeFilters.subcategory = subcats;
            if (govs.length) activeFilters.governorate = govs;
            if (cities.length) activeFilters.cities = cities;
            if (district) activeFilters.cities = [...new Set([...(activeFilters.cities||[]), district])];

            priceMin = (pmin !== null && pmin !== '' && !isNaN(parseFloat(pmin))) ? parseFloat(pmin) : null;
            priceMax = (pmax !== null && pmax !== '' && !isNaN(parseFloat(pmax))) ? parseFloat(pmax) : null;

            if (priceMin === 0 && priceMax === 500) activeFilters.price = '0-500';
            else if (priceMin === 501 && priceMax === 1000) activeFilters.price = '500-1000';
            else if (priceMin === 1001 && priceMax === 2000) activeFilters.price = '1000-2000';
            else if (priceMin === 2001 && priceMax === null) activeFilters.price = '2000+';
            else if (priceMin === 0 && priceMax === 0) activeFilters.price = 'negotiable';
            
            // Update active filters display after setting price filter
            updateActiveFiltersDisplay();
        }





        // Load products on page load
        document.addEventListener('DOMContentLoaded', async function() {
            // Get current page from URL
            const urlParams = new URLSearchParams(window.location.search);
            currentPage = parseInt(urlParams.get('page')) || 1;
            applyQueryParamsToFilters();
            

            
            await loadCategoryProducts();
            setupAdvancedFilters();
            setupToggleFilters();
            
            // Scroll to top after page load
            setTimeout(() => {
                scrollToTop();
            }, 100);
        });

        // Load products by category

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
            
            // Previous button
            if (currentPage > 1) {
                paginationHTML += `
                    <a href="?page=${currentPage - 1}" class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        السابق
                    </a>
                `;
            } else {
                paginationHTML += `
                    <span class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">
                        السابق
                    </span>
                `;
            }
            
            // Page numbers
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // First page
            if (startPage > 1) {
                paginationHTML += `
                    <a href="?page=1" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        1
                    </a>
                `;
                if (startPage > 2) {
                    paginationHTML += '<span class="px-2 py-2 text-gray-500">...</span>';
                }
            }
            
            // Page numbers
            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `
                        <span class="px-3 py-2 text-sm font-medium text-white bg-yellow-600 border border-yellow-600 rounded-md">
                            ${i}
                        </span>
                    `;
                } else {
                    paginationHTML += `
                        <a href="?page=${i}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
                            ${i}
                        </a>
                    `;
                }
            }
            
            // Last page
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += '<span class="px-2 py-2 text-gray-500">...</span>';
                }
                paginationHTML += `
                    <a href="?page=${totalPages}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        ${totalPages}
                    </a>
                `;
            }
            
            // Next button
            if (currentPage < totalPages) {
                paginationHTML += `
                    <a href="?page=${currentPage + 1}" class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        التالي
                    </a>
                `;
            } else {
                paginationHTML += `
                    <span class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">
                        التالي
                    </span>
                `;
            }
            
            paginationHTML += '</div>';
            
            // Page info
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
            
            // Re-apply filters to show current page (without resetting page)
            applyFilters(false);
        }

        // View product details

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

        // Handle pagination clicks
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

        // بدء المراقبة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            // تحميل الإعلانات المميزة في التصنيف
            loadCategoryFeaturedAds();
            
            // مراقبة التغييرات في حاوية المنتجات
            const productsContainer = document.getElementById('products-container');
            if (productsContainer) {
                observer.observe(productsContainer, {
                    childList: true,
                    subtree: true
                });

            }
            
            // محاولة تحديث أيقونات المفضلة بعد تحميل الصفحة
            setTimeout(updateAllFavoriteIcons, 500);
            
            // تحديث أيقونات المفضلة في بطاقات المنتجات المميزة
            setTimeout(() => {
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
            
            // Handle browser back/forward buttons
            window.addEventListener('popstate', function() {
                const urlParams = new URLSearchParams(window.location.search);
                const newPage = parseInt(urlParams.get('page')) || 1;
                if (newPage !== currentPage) {
                    currentPage = newPage;
                }
                applyQueryParamsToFilters();
                sortProductsByCriteria();
                applyFilters(false);
            });
        });

