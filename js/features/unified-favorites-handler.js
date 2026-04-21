/**
 * معالج المفضلة الموحد لجميع صفحات التصنيفات
 * يوحد منطق التلوين وتحديث الحالة في جميع الصفحات
 */

class UnifiedFavoritesHandler {
    constructor(pageType) {
        this.pageType = pageType;
        this.favoritesService = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // انتظار تحميل خدمة المفضلة
            await this.waitForFavoritesService();
            
            // تهيئة معالجات الأحداث
            this.initializeEventHandlers();
            
            // تحديث جميع الأيقونات
            this.updateAllFavoriteIcons();
            
            this.initialized = true;
            console.log(`✅ UnifiedFavoritesHandler initialized for ${this.pageType} page`);
        } catch (error) {
            console.error(`❌ Error initializing UnifiedFavoritesHandler for ${this.pageType}:`, error);
        }
    }

    async waitForFavoritesService() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.favoritesService && window.favoritesService.initialized) {
                    clearInterval(checkInterval);
                    this.favoritesService = window.favoritesService;
                    resolve();
                }
            }, 100);
            
            // timeout بعد 10 ثوان
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('⚠️ FavoritesService not available, using fallback');
                resolve();
            }, 10000);
        });
    }

    initializeEventHandlers() {
        // مراقبة التغييرات في المفضلة
        window.addEventListener('favoritesChanged', () => {
            this.updateAllFavoriteIcons();
        });

        // مراقبة تغييرات Local Storage
        window.addEventListener('storage', (e) => {
            if (e.key === 'favorites') {
                this.updateAllFavoriteIcons();
            }
        });

        // تحديث الأيقونات عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.updateAllFavoriteIcons(), 500);
        });
    }

    /**
     * تبديل حالة المفضلة لمنتج
     */
    toggleFavorite(event, productId, title, imageUrl, price, governorate, cities, subcategories) {
        event.stopPropagation();
        
        try {
            if (this.favoritesService && this.favoritesService.initialized) {
                // استخدام الخدمة الموحدة
                const productData = {
                    id: productId,
                    title: title,
                    imageUrl: imageUrl,
                    price: price,
                    governorate: governorate,
                    cities: cities,
                    subcategories: subcategories ? subcategories.split(',') : [],
                    category: this.pageType
                };
                
                this.favoritesService.toggleFavorite(productId, productData, this.pageType);
            } else {
                // استخدام الطريقة التقليدية كبديل
                this.toggleFavoriteFallback(productId, title, imageUrl, price, governorate, cities, subcategories);
            }
        } catch (error) {
            console.error('❌ Error in toggleFavorite:', error);
            this.showNotification('حدث خطأ في تحديث المفضلة', 'error');
        }
    }

    /**
     * تبديل المفضلة - الطريقة البديلة
     */
    toggleFavoriteFallback(productId, title, imageUrl, price, governorate, cities, subcategories) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const existingIndex = favorites.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            // إزالة من المفضلة
            favorites.splice(existingIndex, 1);
            this.showNotification('تم إزالة المنتج من المفضلة', 'info');
        } else {
            // إضافة للمفضلة
            const productData = {
                id: productId,
                title: title,
                imageUrl: imageUrl,
                price: price,
                governorate: governorate,
                cities: cities,
                subcategories: subcategories ? subcategories.split(',') : [],
                category: this.pageType
            };
            favorites.push(productData);
            this.showNotification('تم إعجاب المنتج', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // تحديث واجهة المستخدم
        this.updateFavoriteIcon(productId);
        this.updateFeaturedAdFavoriteIcon(productId);
        this.updateFavoritesCountBadge();
        
        // إرسال حدث مخصص
        window.dispatchEvent(new CustomEvent('favoritesChanged', {
            detail: { favorites: favorites }
        }));
    }

    /**
     * تبديل المفضلة من النافذة المنبثقة
     */
    toggleFavoriteFromModal(productId) {
        try {
            if (this.favoritesService && this.favoritesService.initialized) {
                // البحث عن بيانات المنتج في النافذة المنبثقة
                const modal = document.querySelector('.product-details-modal');
                if (modal) {
                    const title = modal.querySelector('h2')?.textContent || 'منتج';
                    const priceElement = modal.querySelector('.price')?.textContent || '0';
                    const price = parseInt(priceElement.replace(/[^\d]/g, '')) || 0;
                    
                    const productData = {
                        id: productId,
                        title: title,
                        price: price,
                        category: this.pageType
                    };
                    
                    this.favoritesService.toggleFavorite(productId, productData, this.pageType);
                }
            } else {
                // استخدام الطريقة البديلة
                this.toggleFavoriteFallback(productId, 'منتج', '', 0, '', '', '');
            }
            
            // تحديث نص الزر
            this.updateModalButtonText(productId);
        } catch (error) {
            console.error('❌ Error in toggleFavoriteFromModal:', error);
        }
    }

    /**
     * تحديث نص الزر في النافذة المنبثقة
     */
    updateModalButtonText(productId) {
        const favoriteBtn = document.querySelector('.product-details-modal button:first-of-type');
        if (favoriteBtn) {
            const isFav = this.isFavorite(productId);
            favoriteBtn.textContent = isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
        }
    }

    /**
     * التحقق من حالة المفضلة
     */
    isFavorite(productId) {
        if (this.favoritesService && this.favoritesService.initialized) {
            return this.favoritesService.isFavorite(productId);
        }
        
        // الطريقة البديلة
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.some(item => item.id === productId);
    }

    /**
     * تحديث أيقونة القلب لمنتج معين
     */
    updateFavoriteIcon(productId) {
        try {
            const favoriteBtn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn svg`);
            if (favoriteBtn) {
                const isFav = this.isFavorite(productId);
                this.applyFavoriteIconStyle(favoriteBtn, isFav);
            }
        } catch (error) {
            console.error(`❌ Error updating favorite icon for product ${productId}:`, error);
        }
    }

    /**
     * تحديث أيقونة القلب في بطاقة الإعلان المميز
     */
    updateFeaturedAdFavoriteIcon(adId) {
        try {
            const favoriteBtn = document.querySelector(`[data-ad-id="${adId}"] .favorite-btn svg`);
            if (favoriteBtn) {
                const isFav = this.isFavorite(adId);
                this.applyFavoriteIconStyle(favoriteBtn, isFav);
            }
        } catch (error) {
            console.error(`❌ Error updating featured ad favorite icon for ad ${adId}:`, error);
        }
    }

    /**
     * تطبيق نمط الألوان على أيقونة القلب
     */
    applyFavoriteIconStyle(iconElement, isFavorite) {
        if (!iconElement) return;
        
        // إزالة جميع الألوان السابقة
        iconElement.classList.remove(
            'text-pink-500', 'text-red-500', 'text-gray-400', 'text-black',
            'fill-current'
        );
        
        if (isFavorite) {
            // المنتج مفضل - تطبيق اللون المناسب للصفحة
            switch (this.pageType) {
                case 'koshat':
                case 'cake':
                case 'other':
                case 'invitations':
                    iconElement.classList.add('text-pink-500', 'fill-current');
                    break;
                case 'mirr':
                case 'mirror':
                    iconElement.classList.add('text-red-500', 'fill-current');
                    break;
                default:
                    iconElement.classList.add('text-pink-500', 'fill-current');
            }
        } else {
            // المنتج غير مفضل - تطبيق اللون الافتراضي
            switch (this.pageType) {
                case 'mirr':
                case 'mirror':
                    iconElement.classList.add('text-black');
                    break;
                default:
                    iconElement.classList.add('text-gray-400');
            }
        }
    }

    /**
     * تحديث جميع أيقونات المفضلة في الصفحة
     */
    updateAllFavoriteIcons() {
        try {
            console.log(`🔄 Updating all favorite icons for ${this.pageType} page...`);
            
            // تحديث أيقونات المنتجات العادية
            const productCards = document.querySelectorAll('[data-product-id]');
            productCards.forEach(card => {
                const productId = card.getAttribute('data-product-id');
                this.updateFavoriteIcon(productId);
            });
            
            // تحديث أيقونات الإعلانات المميزة
            const adCards = document.querySelectorAll('[data-ad-id]');
            adCards.forEach(card => {
                const adId = card.getAttribute('data-ad-id');
                this.updateFeaturedAdFavoriteIcon(adId);
            });
            
            console.log(`✅ Updated ${productCards.length} product icons and ${adCards.length} ad icons`);
        } catch (error) {
            console.error('❌ Error updating all favorite icons:', error);
        }
    }

    /**
     * تحديث عداد المفضلة
     */
    updateFavoritesCountBadge() {
        try {
            let count = 0;
            
            if (this.favoritesService && this.favoritesService.initialized) {
                count = this.favoritesService.favorites.length;
            } else {
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                count = favorites.length;
            }
            
            console.log(`🔄 Updating favorites count badge: ${count}`);
            
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
                        console.log(`📊 Updated ${badgeId} to show: ${count}`);
                    } else {
                        badge.classList.add('hidden');
                        console.log(`📊 Hidden ${badgeId} (count: 0)`);
                    }
                } else {
                    console.log(`❌ Badge not found: ${badgeId}`);
                }
            });
        } catch (error) {
            console.error('❌ Error updating favorites count badge:', error);
        }
    }

    /**
     * عرض إشعار للمستخدم
     */
    showNotification(message, type = 'info') {
        try {
            // إزالة الإشعارات السابقة
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            const notification = document.createElement('div');
            notification.className = `notification fixed top-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-300 translate-x-0`;
            
            // تحديد لون الإشعار حسب النوع
            const colors = {
                'success': '#10b981', // أخضر
                'error': '#ef4444',   // أحمر
                'info': '#3b82f6'     // أزرق
            };
            
            notification.style.backgroundColor = colors[type] || colors.info;
            notification.textContent = message;
            document.body.appendChild(notification);

            // إخفاء الإشعار بعد 3 ثوان
            setTimeout(() => {
                notification.style.transform = 'translateX(-100%)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        } catch (error) {
            console.error('❌ Error showing notification:', error);
        }
    }
}

// تصدير الكلاس للاستخدام العام
window.UnifiedFavoritesHandler = UnifiedFavoritesHandler;

// دالة مساعدة لتهيئة معالج المفضلة
window.initializeUnifiedFavorites = function(pageType) {
    return new UnifiedFavoritesHandler(pageType);
};
