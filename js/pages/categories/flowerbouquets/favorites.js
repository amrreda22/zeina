/* favorites module for flowerbouquets */

function toggleFavoriteFromModal(productId) {
            // البحث عن المنتج في القائمة الرئيسية
            let product = allProducts.find(p => p.id === productId);
            
            // إذا لم يتم العثور على المنتج، البحث في المنتجات المميزة
            if (!product) {
                const featuredAdsContainer = document.getElementById('featured-ads-container');
                if (featuredAdsContainer) {
                    const featuredAd = featuredAdsContainer.querySelector(`[data-ad-id="${productId}"]`);
                    if (featuredAd) {
                        const adData = JSON.parse(featuredAd.getAttribute('data-ad-info') || '{}');
                        if (adData.id) {
                            product = adData;
                        }
                    }
                }
            }
            
            if (!product) {
                return;
            }
            
            // استخدام نفس منطق toggleFavorite
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const existingIndex = favorites.findIndex(item => item.id === productId);
            
            if (existingIndex > -1) {
                favorites.splice(existingIndex, 1);
                showNotification('تم إزالة المنتج من المفضلة', 'info');
            } else {
                const productData = {
                    id: productId,
                    title: product.name || product.title || product.description || 'منتج',
                    imageUrl: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : (product.image_url || ''),
                    price: product.price || 0,
                    governorate: product.governorate || '',
                    cities: product.cities || '',
                    subcategories: product.subcategory || product.subcategories || '',
                    category: 'flowerbouquets', // إضافة التصنيف الرئيسي
                    addedAt: new Date().toISOString()
                };
                favorites.push(productData);
                showNotification('تم إضافة المنتج إلى المفضلة', 'success');
            }
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoriteIcon(productId);
            updateFeaturedAdFavoriteIcon(productId);
            updateFavoritesCountBadge();
            
            // تحديث زر المفضلة في النافذة المنبثقة
            const favoriteBtn = document.querySelector('.product-details-modal button:first-of-type');
            if (favoriteBtn) {
                favoriteBtn.textContent = isFavorite(productId) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
            }
        }

        // تبديل حالة المفضلة (إضافة/إزالة)

function toggleFavorite(event, productId, title, imageUrl, price, governorate, cities, subcategories) {
            event.stopPropagation(); // منع انتقال الحدث للعنصر الأب
            
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const existingIndex = favorites.findIndex(item => item.id === productId);
            
            if (existingIndex > -1) {
                // إزالة من المفضلة
                favorites.splice(existingIndex, 1);
                showNotification('تم إزالة المنتج من المفضلة', 'info');
            } else {
                // إضافة إلى المفضلة
                const productData = {
                    id: productId,
                    title: title,
                    imageUrl: imageUrl,
                    price: price,
                    governorate: governorate,
                    cities: cities,
                    subcategories: subcategories,
                    category: 'flowerbouquets', // إضافة التصنيف الرئيسي
                    addedAt: new Date().toISOString()
                };
                favorites.push(productData);
                showNotification('تم إضافة المنتج إلى المفضلة', 'success');
            }
            
            // حفظ في Local Storage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // تحديث أيقونة القلب
            updateFavoriteIcon(productId);
            
            // تحديث أيقونة القلب في بطاقات المنتجات المميزة
            updateFeaturedAdFavoriteIcon(productId);
            
            // تحديث عداد المفضلة
            updateFavoritesCountBadge();
        }

        // تحديث أيقونة القلب

function updateFavoriteIcon(productId) {
            const favoriteBtn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn svg`);
            if (favoriteBtn) {
                if (isFavorite(productId)) {
                    favoriteBtn.classList.remove('text-gray-400');
                    favoriteBtn.classList.add('text-pink-500', 'fill-current');
                } else {
                    favoriteBtn.classList.remove('text-pink-500', 'fill-current');
                    favoriteBtn.classList.add('text-gray-400');
                }
            }
        }

        // تحديث عداد المفضلة

function updateFavoritesCountBadge() {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const count = favorites.length;
            
            // تحديث جميع العدادات
            const badges = [
                'favorites-count-badge',
                'favorites-count-badge-mobile'
            ];
            
            badges.forEach(badgeId => {
                const badge = document.getElementById(badgeId);
                if (badge) {
                    if (count > 0) {
                        badge.textContent = count;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                }
            });
        }

        // التحقق من أن المنتج في المفضلة

function isFavorite(productId) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            return favorites.some(item => item.id === productId);
        }

        // عرض إشعار

function updateFeaturedAdFavoriteIcon(adId) {
            const favoriteBtn = document.querySelector(`[data-ad-id="${adId}"] .favorite-btn svg`);
            if (favoriteBtn) {
                if (isFavorite(adId)) {
                    favoriteBtn.classList.remove('text-gray-400');
                    favoriteBtn.classList.add('text-pink-500', 'fill-current');
                } else {
                    favoriteBtn.classList.remove('text-pink-500', 'fill-current');
                    favoriteBtn.classList.add('text-gray-400');
                }
            }
        }

        // دوال الترقيم

