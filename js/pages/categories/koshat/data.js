/* data module for koshat */

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
                
                const result = await window.ProductService.getProductsByCategory('koshat');
                
                if (result.success) {
                    allProducts = result.data;
                    

                    // عرض عينة من البيانات المحملة
                    if (allProducts.length > 0) {
                        // إحصائيات التصنيفات الفرعية
                        const productsWithSubcategories = allProducts.filter(p => p.subcategory && p.subcategory !== '' && p.subcategory !== null);
                        const productsWithArraySubcategories = allProducts.filter(p => Array.isArray(p.subcategory));
                        const productsWithStringSubcategories = allProducts.filter(p => typeof p.subcategory === 'string' && p.subcategory !== '' && p.subcategory !== null);
                    }

                    // ترتيب المنتجات حسب المعايير المطلوبة
                    sortProductsByCriteria();
                    applyFilters();
                } else {
                    console.error('❌ خطأ في جلب المنتجات:', result.error);
                    showError('حدث خطأ في تحميل المنتجات: ' + result.error);
                }
                
            } catch (error) {
                showError('حدث خطأ في تحميل المنتجات');
            }
        }

        // ترتيب المنتجات حسب خيار الفرز

async function loadCategoryFeaturedAds() {
            try {
                if (!window.advertisingService) {
    
                    setTimeout(loadCategoryFeaturedAds, 1000);
                    return;
                }


                const featuredAds = await window.advertisingService.getCategoryFeaturedProducts('koshat', 4);
                
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

