/* data module for other */

async function loadCategoryProducts() {
            try {
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

                const result = await window.ProductService.getProductsByCategory('other');

                if (result.success) {
                    allProducts = result.data || [];
                    filteredProducts = [...allProducts];

                    // ترتيب المنتجات حسب المعايير المطلوبة
                    sortProductsByCriteria();

                    // تحديث filteredProducts بعد الترتيب
                    filteredProducts = [...allProducts];

                    console.log('Products loaded successfully:', allProducts.length, 'products');
                    applyFilters();
                } else {
                    console.error('Failed to load products:', result.error);
                    showError('حدث خطأ في تحميل المنتجات: ' + (result.error || 'خطأ غير معروف'));
                }

            } catch (error) {
                console.error('Error in loadCategoryProducts:', error);
                showError('حدث خطأ في تحميل المنتجات: ' + error.message);
            }
        }

        // ترتيب المنتجات حسب الأولوية: منتجات بسعر أولاً ثم بدون سعر

async function loadCategoryFeaturedAds() {
            try {
                if (!window.advertisingService) {
                    setTimeout(loadCategoryFeaturedAds, 1000);
                    return;
                }

                const featuredAds = await window.advertisingService.getCategoryFeaturedProducts('other', 4);
                
                displayCategoryFeaturedAds(featuredAds);
                
                // تسجيل ظهور الإعلانات
                featuredAds.forEach(ad => {
                    if (ad.ad_id && window.advertisingService) {
                        window.advertisingService.recordImpression(ad.ad_id);
                    }
                });
                
            } catch (error) {
                showNoFeaturedAds();
            }
        }

        // عرض الإعلانات المميزة في التصنيف

