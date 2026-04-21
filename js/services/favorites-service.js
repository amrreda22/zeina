/**
 * خدمة إدارة المفضلات الموحدة
 * توحد منطق التلوين وتحديث الحالة في جميع الصفحات
 */

class FavoritesService {
    constructor() {
        this.favorites = []; // Initialize as empty array first
        this.initialized = false;
        this.userId = null; // Will be set during initialization
        this.initPromise = this.initialize();
        this.initializeEventListeners();
    }

    // Initialize the service
    async initialize() {
        try {
            // Wait for Supabase to be available
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
            } else {
                // Wait for Supabase client
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (window.supabaseClient) {
                            clearInterval(checkInterval);
                            this.supabase = window.supabaseClient;
                            resolve();
                        }
                    }, 100);
                    
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 5000);
                });
            }

            // Try to get user ID if authenticated
            if (this.supabase) {
                try {
                    const { data: { user } } = await this.supabase.auth.getUser();
                    if (user) {
                        this.userId = user.id;
                        console.log('✅ User authenticated:', user.email);
                    } else {
                        console.log('ℹ️ User not authenticated, using anonymous mode');
                        this.userId = 'anonymous';
                    }
                } catch (authError) {
                    console.warn('⚠️ Could not get user info, using anonymous mode:', authError);
                    this.userId = 'anonymous';
                }
            } else {
                this.userId = 'anonymous';
            }

            // Load favorites
            await this.loadFavorites();
            this.initialized = true;
            console.log('✅ FavoritesService initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing FavoritesService:', error);
            this.favorites = [];
            this.userId = 'anonymous';
            this.initialized = true; // Mark as initialized even if failed
        }
    }

    // تحميل المفضلات من localStorage
    async loadFavorites() {
        try {
            // Always try localStorage first as backup
            const stored = localStorage.getItem('favorites');
            const localFavorites = stored ? JSON.parse(stored) : [];
            
            // Try to load from Supabase if available and user is authenticated
            if (this.supabase && this.userId && this.userId !== 'anonymous') {
                try {
                    const { data, error } = await this.supabase
                        .from('favorites')
                        .select('*')
                        .eq('user_id', this.userId);
                    
                    if (error) throw error;
                    
                    // Merge Supabase data with localStorage data
                    const supabaseFavorites = data || [];
                    this.favorites = [...localFavorites, ...supabaseFavorites];
                    
                    // Remove duplicates based on product_id
                    const seen = new Set();
                    this.favorites = this.favorites.filter(fav => {
                        const duplicate = seen.has(fav.product_id);
                        seen.add(fav.product_id);
                        return !duplicate;
                    });
                    
                    console.log('✅ Favorites loaded from Supabase and localStorage');
                    return this.favorites;
                } catch (supabaseError) {
                    console.warn('⚠️ Failed to load from Supabase, using localStorage only:', supabaseError);
                }
            }
            
            // Use localStorage data
            this.favorites = localFavorites;
            console.log('✅ Favorites loaded from localStorage');
            return this.favorites;
        } catch (error) {
            console.error('❌ Error loading favorites:', error);
            this.favorites = [];
            return this.favorites;
        }
    }

    // حفظ المفضلات في localStorage
    async saveFavorites() {
        try {
            // Always save to localStorage as backup
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            
            // Try to save to Supabase if available
            if (this.supabase && this.userId && this.userId !== 'anonymous') {
                try {
                    const { error } = await this.supabase
                        .from('favorites')
                        .upsert(this.favorites, { onConflict: 'user_id,product_id' });
                    
                    if (error) throw error;
                    console.log('✅ Favorites saved to Supabase');
                } catch (supabaseError) {
                    console.warn('⚠️ Failed to save to Supabase, using localStorage only:', supabaseError);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error saving favorites:', error);
            return false;
        }
    }

    // التحقق من وجود منتج في المفضلة
    isFavorite(productId) {
        if (!productId) return false;
        if (!Array.isArray(this.favorites)) {
            console.warn('⚠️ Favorites not initialized yet, returning false');
            return false;
        }
        return this.favorites.some(item => item.id === productId);
    }

    // إضافة منتج إلى المفضلة
    addToFavorites(productData) {
        if (!productData.id) {
            return false;
        }

        if (!Array.isArray(this.favorites)) {
            console.warn('⚠️ Favorites not initialized yet, initializing...');
            this.favorites = [];
        }

        if (!this.favorites.some(fav => fav.product_id === productData.id)) {
            this.favorites.push({
                user_id: this.userId,
                product_id: productData.id,
                created_at: new Date().toISOString()
            });
            this.saveFavorites();
            this.updateFavoriteIcon(productData.id, true);
            return true;
        }
        return false;
    }

    // إزالة منتج من المفضلة
    removeFromFavorites(productId) {
        if (!productId) {
            return false;
        }
        
        if (!Array.isArray(this.favorites)) {
            console.warn('⚠️ Favorites not initialized yet, returning false');
            return false;
        }
        
        const index = this.favorites.findIndex(fav => fav.product_id === productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.updateFavoriteIcon(productId, false);
            return true;
        }
        return false;
    }

    // تبديل حالة المفضلة (إضافة/إزالة)
    toggleFavorite(productData) {
        if (!productData.id) {
            return false;
        }

        const isCurrentlyFavorite = this.isFavorite(productData.id);
        
        if (isCurrentlyFavorite) {
            this.removeFromFavorites(productData.id);
            return false; // تمت الإزالة
        } else {
            this.addToFavorites(productData);
            return true; // تمت الإضافة
        }
    }

    // ===== دوال تحديث واجهة المستخدم الموحدة =====
    
    /**
     * تحديث أيقونة القلب في بطاقة المنتج
     * @param {string} productId - معرف المنتج
     * @param {string} pageType - نوع الصفحة (koshat, mirr, cake, other, invitations)
     */
    updateFavoriteIcon(productId, pageType = 'default') {
        try {
            // البحث عن أيقونة القلب في بطاقة المنتج
            const favoriteBtn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn svg`);
            if (favoriteBtn) {
                const isFav = this.isFavorite(productId);
                this.applyFavoriteIconStyle(favoriteBtn, isFav, pageType);
                console.log(`✅ Updated favorite icon for product ${productId} on ${pageType} page`);
            }
        } catch (error) {
            console.error(`❌ Error updating favorite icon for product ${productId}:`, error);
        }
    }
    
    /**
     * تحديث أيقونة القلب في بطاقة الإعلان المميز
     * @param {string} adId - معرف الإعلان
     * @param {string} pageType - نوع الصفحة
     */
    updateFeaturedAdFavoriteIcon(adId, pageType = 'default') {
        try {
            const favoriteBtn = document.querySelector(`[data-ad-id="${adId}"] .favorite-btn svg`);
            if (favoriteBtn) {
                const isFav = this.isFavorite(adId);
                this.applyFavoriteIconStyle(favoriteBtn, isFav, pageType);
                console.log(`✅ Updated featured ad favorite icon for ad ${adId} on ${pageType} page`);
            }
        } catch (error) {
            console.error(`❌ Error updating featured ad favorite icon for ad ${adId}:`, error);
        }
    }
    
    /**
     * تطبيق نمط الألوان على أيقونة القلب
     * @param {HTMLElement} iconElement - عنصر الأيقونة
     * @param {boolean} isFavorite - هل المنتج مفضل
     * @param {string} pageType - نوع الصفحة
     */
    applyFavoriteIconStyle(iconElement, isFavorite, pageType = 'default') {
        if (!iconElement) return;
        
        // إزالة جميع الألوان السابقة
        iconElement.classList.remove(
            'text-pink-500', 'text-red-500', 'text-gray-400', 'text-black',
            'fill-current'
        );
        
        if (isFavorite) {
            // المنتج مفضل - تطبيق اللون المناسب للصفحة
            switch (pageType) {
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
            switch (pageType) {
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
     * @param {string} pageType - نوع الصفحة
     */
    updateAllFavoriteIcons(pageType = 'default') {
        try {
            console.log(`🔄 Updating all favorite icons for ${pageType} page...`);
            
            // تحديث أيقونات المنتجات العادية
            const productCards = document.querySelectorAll('[data-product-id]');
            productCards.forEach(card => {
                const productId = card.getAttribute('data-product-id');
                this.updateFavoriteIcon(productId, pageType);
            });
            
            // تحديث أيقونات الإعلانات المميزة
            const adCards = document.querySelectorAll('[data-ad-id]');
            adCards.forEach(card => {
                const adId = card.getAttribute('data-ad-id');
                this.updateFeaturedAdFavoriteIcon(adId, pageType);
            });
            
            console.log(`✅ Updated ${productCards.length} product icons and ${adCards.length} ad icons`);
        } catch (error) {
            console.error('❌ Error updating all favorite icons:', error);
        }
    }
    
    /**
     * تحديث عداد المفضلة في الهيدر
     */
    updateFavoritesCountBadge() {
        try {
            const count = this.favorites.length;
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
     * تبديل حالة المفضلة لمنتج معين
     * @param {string} productId - معرف المنتج
     * @param {Object} productData - بيانات المنتج
     * @param {string} pageType - نوع الصفحة
     */
    async toggleFavorite(productId, productData, pageType = 'default') {
        try {
            const existingIndex = this.favorites.findIndex(item => item.id === productId);
            
            if (existingIndex !== -1) {
                // إزالة من المفضلة
                this.favorites.splice(existingIndex, 1);
                console.log(`🗑️ Removed product ${productId} from favorites`);
                
                // عرض إشعار
                this.showNotification('تم إزالة المنتج من المفضلة', 'info');
            } else {
                // إضافة للمفضلة
                this.favorites.push(productData);
                console.log(`❤️ Added product ${productId} to favorites`);
                
                // عرض إشعار
                this.showNotification('تم إعجاب المنتج', 'success');
            }
            
            // حفظ التغييرات
            await this.saveFavorites();
            
            // تحديث واجهة المستخدم
            this.updateFavoriteIcon(productId, pageType);
            this.updateFeaturedAdFavoriteIcon(productId, pageType);
            this.updateFavoritesCountBadge();
            
            // إرسال حدث مخصص لضمان التزامن
            window.dispatchEvent(new CustomEvent('favoritesChanged', {
                detail: { favorites: this.favorites }
            }));
            
            return this.favorites.some(item => item.id === productId);
        } catch (error) {
            console.error(`❌ Error toggling favorite for product ${productId}:`, error);
            this.showNotification('حدث خطأ في تحديث المفضلة', 'error');
            return false;
        }
    }
    
    /**
     * عرض إشعار للمستخدم
     * @param {string} message - رسالة الإشعار
     * @param {string} type - نوع الإشعار (success, error, info)
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

    // تهيئة مستمعي الأحداث
    initializeEventListeners() {
        // مراقبة التغييرات في localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'favorites') {
                this.favorites = this.loadFavorites();
                this.updateAllFavoriteIcons();
                this.updateFavoritesCountBadge(this.favorites.length);
            }
        });

        // مراقبة الأحداث المخصصة
        window.addEventListener('favoritesChanged', (event) => {
            this.favorites = event.detail.favorites;
            this.updateAllFavoriteIcons();
            this.updateFavoritesCountBadge(this.favorites.length);
        });

        // مراقبة التغييرات في DOM
        this.observeDOMChanges();
    }

    // مراقبة التغييرات في DOM
    observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // التحقق من إضافة بطاقات منتجات جديدة
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && (node.classList.contains('product-card') || node.querySelector('.product-card'))) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                // تأخير قليل للتأكد من اكتمال التحميل
                setTimeout(() => {
                    this.updateAllFavoriteIcons();
                }, 100);
            }
        });

        // بدء المراقبة
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // الحصول على عدد المفضلات
    getFavoritesCount() {
        if (!Array.isArray(this.favorites)) {
            return 0;
        }
        return this.favorites.length;
    }

    // الحصول على قائمة المفضلات
    getFavorites() {
        if (!Array.isArray(this.favorites)) {
            return [];
        }
        return [...this.favorites];
    }

    // مسح جميع المفضلات
    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
        this.updateAllFavoriteIcons();
        this.updateFavoritesCountBadge(this.favorites.length);
    }

    // Ensure service is initialized
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
        return this.initialized;
    }
}

// إنشاء نسخة عالمية من الخدمة
function initializeFavoritesService() {
    try {
        if (!window.favoritesService) {
            window.favoritesService = new FavoritesService();
            console.log('✅ FavoritesService created successfully');
        }
    } catch (error) {
        console.error('❌ Error initializing favorites service:', error);
    }
}

// Global function to check if a product is favorite (with safety checks)
async function isFavorite(productId) {
    try {
        if (!window.favoritesService) {
            console.warn('⚠️ FavoritesService not available');
            return false;
        }
        
        await window.favoritesService.ensureInitialized();
        return window.favoritesService.isFavorite(productId);
    } catch (error) {
        console.error('❌ Error checking favorite status:', error);
        return false;
    }
}

// Global function to add to favorites (with safety checks)
async function addToFavorites(productData) {
    try {
        if (!window.favoritesService) {
            console.warn('⚠️ FavoritesService not available');
            return false;
        }
        
        await window.favoritesService.ensureInitialized();
        return window.favoritesService.addToFavorites(productData);
    } catch (error) {
        console.error('❌ Error adding to favorites:', error);
        return false;
    }
}

// Global function to remove from favorites (with safety checks)
async function removeFromFavorites(productId) {
    try {
        if (!window.favoritesService) {
            console.warn('⚠️ FavoritesService not available');
            return false;
        }
        
        await window.favoritesService.ensureInitialized();
        return window.favoritesService.removeFromFavorites(productId);
    } catch (error) {
        console.error('❌ Error removing from favorites:', error);
        return false;
    }
}

// Global function to toggle favorite (with safety checks)
async function toggleFavorite(productData) {
    try {
        if (!window.favoritesService) {
            console.warn('⚠️ FavoritesService not available');
            return false;
        }
        
        await window.favoritesService.ensureInitialized();
        return window.favoritesService.toggleFavorite(productData);
    } catch (error) {
        console.error('❌ Error toggling favorite:', error);
        return false;
    }
}

// محاولة التهيئة فوراً
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFavoritesService);
} else {
    initializeFavoritesService();
}

// تصدير الخدمة للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesService;
}
