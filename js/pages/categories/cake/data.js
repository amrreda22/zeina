/* data module for cake */

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
                
                const result = await window.ProductService.getProductsByCategory('cake');
                
                if (result.success) {
                    allProducts = result.data;
                    console.log('تم تحميل المنتجات:', allProducts.length, 'منتج');
                    
                    // ترتيب المنتجات حسب المعايير المطلوبة
                    sortProductsByCriteria();
                    filteredProducts = allProducts;
                    displayProductsWithPagination();
                    updateProductsCount();
                } else {
                    console.error('❌ خطأ في جلب المنتجات:', result.error);
                    showError('حدث خطأ في تحميل المنتجات: ' + result.error);
                }
                
            } catch (error) {
                console.error('❌ خطأ في loadCategoryProducts:', error);
                showError('حدث خطأ في تحميل المنتجات');
            }
        }

                // ترتيب المنتجات حسب الأولوية: منتجات بسعر أولاً ثم بدون سعر

async function loadCategoryFeaturedAds() {
            try {
                if (!window.advertisingService) {
                    setTimeout(loadCategoryFeaturedAds, 1000);
                    return;
                }

                const featuredAds = await window.advertisingService.getCategoryFeaturedProducts('cake', 4);
                
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

async function loadCategorySectionWithAds() {
            try {
                if (!window.smartCategoryAdvertising) {
                    setTimeout(loadCategorySectionWithAds, 1000);
                    return;
                }
                
                // تحميل قسم التصنيف مع دمج الإعلانات والمنتجات
                const finalItems = await window.smartCategoryAdvertising.loadCategorySection('cake', 'products-container');
                
                if (finalItems && finalItems.length > 0) {
                    const nonAdItems = finalItems.filter(item => !item.is_ad);
                    if (nonAdItems.length > 0) {
                        allProducts = nonAdItems;
                        sortProductsByCriteria();
                        applyFilters();
                    } else {
                        await loadCategoryProducts();
                        applyFilters();
                    }
                    
                    // تحديث أيقونات المفضلة
                    setTimeout(() => {
                        const productCards = document.querySelectorAll('.product-card');
                        productCards.forEach(card => {
                            const productId = card.getAttribute('data-product-id');
                            if (productId) {
                                updateFavoriteIcon(productId);
                            }
                        });
                    }, 500);
                    
                } else {
                    // استخدام الطريقة القديمة إذا لم تنجح الطريقة الجديدة
                    await loadCategoryProducts();
                    applyFilters();
                }
                
            } catch (error) {
                console.error('❌ خطأ في تحميل قسم التصنيف مع الإعلانات:', error);
                // استخدام الطريقة القديمة في حالة الخطأ
                await loadCategoryProducts();
                applyFilters();
            }
        }

        // إظهار رسالة عدم وجود إعلانات مميزة

