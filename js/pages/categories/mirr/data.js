/* data module for mirr */

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
                
                const result = await window.ProductService.getProductsByCategory('mirr');
                
                if (result.success) {
                    allProducts = result.data;
                    filteredProducts = [...allProducts];

                    // ترتيب المنتجات حسب المعايير المطلوبة
                    sortProductsByCriteria();
                    
                    // تحديث filteredProducts بعد الترتيب
                    filteredProducts = [...allProducts];
                    
                    applyFilters();
                } else {
                    console.error('❌ خطأ في جلب المنتجات:', result.error);
                    // إخفاء رسالة الخطأ وإعادة المحاولة تلقائياً
                    setTimeout(() => {
                        loadCategoryProducts();
                    }, 2000);
                }
                
            } catch (error) {
                console.error('❌ خطأ في loadCategoryProducts:', error);
                // إخفاء رسالة الخطأ وإعادة المحاولة تلقائياً
                setTimeout(() => {
                    loadCategoryProducts();
                }, 2000);
            }
        }

        // ترتيب المنتجات حسب الأولوية: منتجات بسعر أولاً ثم بدون سعر

async function loadCategoryFeaturedAds() {
            try {
                if (!window.advertisingService) {
                    setTimeout(loadCategoryFeaturedAds, 1000);
                    return;
                }

                const featuredAds = await window.advertisingService.getCategoryFeaturedProducts('mirr', 4);
                
                displayCategoryFeaturedAds(featuredAds);
                
                // تسجيل ظهور الإعلانات
                featuredAds.forEach(ad => {
                    if (ad.ad_id && window.advertisingService) {
                        window.advertisingService.recordImpression(ad.ad_id);
                    }
                });
                
            } catch (error) {
                console.error('❌ خطأ في تحميل الإعلانات المميزة:', error);
                showNoFeaturedAds();
            }
        }

        // عرض الإعلانات المميزة في التصنيف

