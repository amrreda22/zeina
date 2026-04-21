/**
 * خدمة الإعلانات الذكية لأقسام التصنيفات
 * تدير أولوية الإعلانات مع منطق التعبئة المتقدم
 */
class SmartCategoryAdvertisingService {
    constructor() {
        this.supabase = window.supabaseClient || null;
        this.maxSlots = 50; // عدد الخانات الثابتة لكل قسم (زيادة العدد لعرض جميع المنتجات)
        this.categorySections = new Map(); // تخزين حالة كل قسم
        this.realTimeUpdates = new Map(); // تحديثات فورية للإعلانات
    }

    /**
     * تهيئة الخدمة
     */
    async initialize() {
        try {
            // console.log('🚀 تهيئة خدمة الإعلانات الذكية لأقسام التصنيفات...');
            
            // إعداد مراقبة التغييرات في الإعلانات
            await this.setupRealTimeUpdates();
            
            // console.log('✅ تم تهيئة خدمة الإعلانات الذكية بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة خدمة الإعلانات الذكية:', error);
        }
    }

    /**
     * إعداد المراقبة الفورية للتغييرات
     */
    async setupRealTimeUpdates() {
        try {
            // مراقبة إضافة إعلانات جديدة
            this.supabase
                .channel('advertisements_changes')
                .on('postgres_changes', 
                    { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'advertisements',
                        filter: 'ad_type=eq.category_sections'
                    },
                    (payload) => {
                        console.log('🆕 إعلان جديد تم إضافته:', payload.new);
                        this.handleNewAdvertisement(payload.new);
                    }
                )
                .on('postgres_changes', 
                    { 
                        event: 'DELETE', 
                        schema: 'public', 
                        table: 'advertisements',
                        filter: 'ad_type=eq.category_sections'
                    },
                    (payload) => {
                        console.log('🗑️ إعلان تم حذفه:', payload.old);
                        this.handleDeletedAdvertisement(payload.old);
                    }
                )
                .on('postgres_changes', 
                    { 
                        event: 'UPDATE', 
                        schema: 'public', 
                        table: 'advertisements',
                        filter: 'ad_type=eq.category_sections'
                    },
                    (payload) => {
                        console.log('✏️ إعلان تم تحديثه:', payload.new);
                        this.handleUpdatedAdvertisement(payload.old, payload.new);
                    }
                )
                .subscribe();
                
            // console.log('✅ تم إعداد المراقبة الفورية للإعلانات');
        } catch (error) {
            console.error('❌ خطأ في إعداد المراقبة الفورية:', error);
        }
    }

    /**
     * تحميل محتوى قسم التصنيف مع منطق الأولوية
     */
    async loadCategorySection(categoryId, gridElementId) {
        try {
            // جلب الإعلانات النشطة للتصنيف
            const ads = await this.getActiveAdvertisements(categoryId);
            
            // جلب المنتجات العادية للتصنيف
            const products = await this.getRegularProducts(categoryId);
            
            // تطبيق منطق التعبئة الذكي
            const finalItems = this.applySmartFillingLogic(ads, products);
            
            // تخزين حالة القسم
            this.categorySections.set(categoryId, {
                ads: ads,
                products: products,
                finalItems: finalItems,
                gridElementId: gridElementId
            });
            
            // عرض العناصر
            this.displayCategorySection(categoryId, finalItems);
            
            return finalItems;
            
        } catch (error) {
            console.error(`❌ خطأ في تحميل قسم التصنيف ${categoryId}:`, error);
            return [];
        }
    }

    /**
     * جلب الإعلانات النشطة للتصنيف
     */
    async getActiveAdvertisements(categoryId) {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('ad_type', 'category_sections')
                .eq('position', 'homepage_featured')
                .eq('category_section', categoryId)
                .order('created_at', { ascending: true }) // الأقدم أولاً
;

            if (error) throw error;
            
            // تحويل الإعلانات إلى تنسيق المنتجات
            const processedAds = [];
            for (const ad of data || []) {
                const processedAd = await this.processAdvertisement(ad);
                if (processedAd) {
                    processedAds.push(processedAd);
                }
            }
            
            return processedAds;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الإعلانات:', error);
            return [];
        }
    }

    /**
     * جلب المنتجات العادية للتصنيف
     */
    async getRegularProducts(categoryId) {
        try {
                    if (!window.ProductService) {
            console.warn('⚠️ خدمة المنتجات غير متوفرة');
            return [];
        }
        
        // جلب المنتجات الأحدث أولاً
        const result = await window.ProductService.getProductsByCategory(categoryId);
        const products = result.success ? result.data : [];
            
            // ترتيب المنتجات حسب الأحدث
            return products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
        } catch (error) {
            console.error('❌ خطأ في جلب المنتجات العادية:', error);
            return [];
        }
    }

    /**
     * تطبيق منطق التعبئة الذكي
     */
    applySmartFillingLogic(ads, products) {
        const finalItems = [];
        
        // الخطوة 1: إضافة الإعلانات أولاً
        for (let i = 0; i < ads.length; i++) {
            finalItems.push({
                ...ads[i],
                is_ad: true,
                slot_position: i + 1
            });
        }
        
        // الخطوة 2: إضافة المنتجات ذات السعر أولاً ثم المنتجات بدون سعر
        let slotIndex = ads.length;
        const pricedProducts = products.filter(p => {
            const priceValue = (p && p.price !== undefined && p.price !== null) ? Number(p.price) : 0;
            return !Number.isNaN(priceValue) && priceValue > 0;
        });
        const noPriceProducts = products.filter(p => {
            const priceValue = (p && p.price !== undefined && p.price !== null) ? Number(p.price) : 0;
            return Number.isNaN(priceValue) || priceValue <= 0;
        });

        for (let i = 0; i < pricedProducts.length; i++) {
            finalItems.push({
                ...pricedProducts[i],
                is_ad: false,
                slot_position: ++slotIndex
            });
        }

        for (let i = 0; i < noPriceProducts.length; i++) {
            finalItems.push({
                ...noPriceProducts[i],
                is_ad: false,
                slot_position: ++slotIndex
            });
        }
        
        return finalItems;
    }

    /**
     * معالجة الإعلان وتحويله إلى تنسيق المنتج
     */
    async processAdvertisement(ad) {
        try {
            let productData = null;
            
            // إذا كان الإعلان مرتبط بمنتج حقيقي
            if (ad.product_id && ad.product_category) {
                productData = await this.getProductData(ad.product_id, ad.product_category);
            }
            
            // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
            const processedAd = {
                id: ad.id,
                ad_id: ad.id,
                
                // بيانات المنتج الحقيقي (إذا وجد)
                name: productData?.description || ad.title || 'منتج مميز',
                title: productData?.description || ad.title || 'منتج مميز',
                description: productData?.description || ad.description || 'وصف المنتج',
                price: productData?.price || 0,
                image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                image_url: productData?.image_urls?.[0] || ad.image_url,
                
                // بيانات إضافية
                category: productData?.category || ad.product_category,
                subcategory: productData?.subcategory || 'advertisement',
                governorate: productData?.governorate || 'جميع المحافظات',
                cities: productData?.cities || '',
                whatsapp: productData?.whatsapp || '',
                facebook: productData?.facebook || '',
                instagram: productData?.instagram || '',
                
                // بيانات الإعلان
                is_featured: true,
                is_category_section: true,
                ad_type: ad.ad_type,
                ad_position: ad.position,
                priority: ad.priority,
                created_at: ad.created_at,
                
                // معرفات الربط
                product_id: ad.product_id,
                product_category: ad.product_category
            };
            
            return processedAd;
            
        } catch (error) {
            console.error(`❌ خطأ في معالجة الإعلان ${ad.id}:`, error);
            return null;
        }
    }

    /**
     * جلب بيانات المنتج من الجدول المناسب
     */
    async getProductData(productId, category) {
        try {
            let tableName = 'products_other';
            switch (category) {
                case 'cake': tableName = 'products_cake'; break;
                case 'koshat': tableName = 'products_koshat'; break;
                case 'mirr': tableName = 'products_mirr'; break;
                case 'other': tableName = 'products_other'; break;
                case 'invitations': tableName = 'products_invitations'; break;
                case 'flowerbouquets': tableName = 'products_flowerbouquets'; break;
            }
            
            const { data: product, error } = await this.supabase
                .from(tableName)
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            return product;
            
        } catch (error) {
            console.warn(`⚠️ لم يتم العثور على المنتج ${productId} في ${category}:`, error);
            return null;
        }
    }

    /**
     * عرض قسم التصنيف
     */
    displayCategorySection(categoryId, items) {
        const sectionData = this.categorySections.get(categoryId);
        if (!sectionData) return;
        
        const gridElement = document.getElementById(sectionData.gridElementId);
        if (!gridElement) return;
        
        // إخفاء مؤشر التحميل
        const loadingElement = document.getElementById(`${categoryId}-loading`);
        if (loadingElement) loadingElement.style.display = 'none';
        
        // إخفاء رسالة عدم وجود منتجات
        const noProductsElement = document.getElementById(`${categoryId}-no-products`);
        if (noProductsElement) noProductsElement.style.display = 'none';
        
        if (items.length > 0) {
            // استخدام دالة العرض الموجودة في الصفحة الرئيسية
            if (typeof displayProducts === 'function') {
                displayProducts(items, sectionData.gridElementId);
            } else {
                // استخدام دالة العرض الافتراضية إذا لم تكن موجودة
                this.renderCategoryItems(gridElement, items, categoryId);
            }
            
            gridElement.style.display = 'grid';
            
            // تسجيل ظهور الإعلانات
            items.filter(item => item.is_ad).forEach(ad => {
                if (ad.ad_id && window.advertisingService) {
                    window.advertisingService.recordImpression(ad.ad_id);
                }
            });
        } else {
            // إظهار رسالة عدم وجود منتجات
            if (noProductsElement) noProductsElement.style.display = 'block';
        }
    }

    /**
     * عرض عناصر التصنيف
     */
    renderCategoryItems(gridElement, items, categoryId) {
        const itemsHTML = items.map((item, index) => {
            const isAd = item.is_ad;
            const imageUrl = item.image_url || '../assets/images/placeholder.jpg';
            const productName = item.name || item.description || 'منتج';
            const productPrice = item.price || 0;
            const productId = item.id;
            
            return `
                <div class="product-card bg-white rounded-lg shadow-md overflow-hidden border-2 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 cursor-pointer ${isAd ? 'border-yellow-300' : 'border-gray-200'}"
                     data-product-id="${productId}"
                     data-ad-id="${isAd ? item.ad_id : ''}"
                     data-is-ad="${isAd}"
                     data-category="${categoryId}"
                     onclick="viewProductDetails('${productId}')">
                    
                    <div class="relative">
                        <img src="${imageUrl}" alt="${productName}" class="w-full h-48 object-cover">
                        
                        ${isAd ? `
                            <div class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                ⭐ مميز
                            </div>
                        ` : ''}
                        
                        <div class="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 text-xs px-2 py-1 rounded-full">
                            ${item.governorate || 'جميع المحافظات'}
                        </div>
                    </div>
                    
                    <div class="p-4">
                        <h3 class="text-sm font-semibold text-gray-800 mb-2 line-clamp-2" title="${productName}">
                            ${productName}
                        </h3>
                        
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold text-yellow-600">
                                ${productPrice > 0 ? `${productPrice} ج.م` : 'اتصل للاستعلام'}
                            </span>
                            
                            <div class="flex space-x-2 space-x-reverse">
                                ${item.whatsapp ? `
                                    <a href="https://wa.me/${item.whatsapp}" target="_blank" class="text-green-600 hover:text-green-700">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                        </svg>
                                    </a>
                                ` : ''}
                                
                                ${item.facebook ? `
                                    <a href="${item.facebook}" target="_blank" class="text-blue-600 hover:text-blue-700">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </a>
                                ` : ''}
                                
                                ${item.instagram ? `
                                    <a href="${item.instagram}" target="_blank" class="text-pink-600 hover:text-pink-700">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                                        </svg>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        gridElement.innerHTML = itemsHTML;
    }

    /**
     * معالجة إعلان جديد
     */
    async handleNewAdvertisement(ad) {
        try {
            console.log('🆕 معالجة إعلان جديد:', ad);
            
            const categoryId = ad.category_section;
            if (!categoryId) return;
            
            // إعادة تحميل القسم
            await this.reloadCategorySection(categoryId);
            
        } catch (error) {
            console.error('❌ خطأ في معالجة الإعلان الجديد:', error);
        }
    }

    /**
     * معالجة حذف إعلان
     */
    async handleDeletedAdvertisement(ad) {
        try {
            console.log('🗑️ معالجة حذف إعلان:', ad);
            
            const categoryId = ad.category_section;
            if (!categoryId) return;
            
            // إعادة تحميل القسم
            await this.reloadCategorySection(categoryId);
            
        } catch (error) {
            console.error('❌ خطأ في معالجة حذف الإعلان:', error);
        }
    }

    /**
     * معالجة تحديث إعلان
     */
    async handleUpdatedAdvertisement(oldAd, newAd) {
        try {
            console.log('✏️ معالجة تحديث إعلان:', oldAd, '→', newAd);
            
            const categoryId = newAd.category_section;
            if (!categoryId) return;
            
            // إعادة تحميل القسم
            await this.reloadCategorySection(categoryId);
            
        } catch (error) {
            console.error('❌ خطأ في معالجة تحديث الإعلان:', error);
        }
    }

    /**
     * إعادة تحميل قسم التصنيف
     */
    async reloadCategorySection(categoryId) {
        try {
            console.log(`🔄 إعادة تحميل قسم التصنيف: ${categoryId}`);
            
            const sectionData = this.categorySections.get(categoryId);
            if (!sectionData) return;
            
            // إعادة تحميل المحتوى
            await this.loadCategorySection(categoryId, sectionData.gridElementId);
            
        } catch (error) {
            console.error(`❌ خطأ في إعادة تحميل قسم التصنيف ${categoryId}:`, error);
        }
    }

    /**
     * تحديث فوري لقسم التصنيف
     */
    async updateCategorySectionImmediately(categoryId) {
        try {
            console.log(`⚡ تحديث فوري لقسم التصنيف: ${categoryId}`);
            
            const sectionData = this.categorySections.get(categoryId);
            if (!sectionData) return;
            
            // تحديث المحتوى فوراً
            const updatedItems = await this.loadCategorySection(categoryId, sectionData.gridElementId);
            
            // تحديث العرض
            this.displayCategorySection(categoryId, updatedItems);
            
        } catch (error) {
            console.error(`❌ خطأ في التحديث الفوري لقسم التصنيف ${categoryId}:`, error);
        }
    }

    /**
     * الحصول على إحصائيات القسم
     */
    getCategorySectionStats(categoryId) {
        const sectionData = this.categorySections.get(categoryId);
        if (!sectionData) return null;
        
        const adCount = sectionData.ads.length;
        const productCount = sectionData.products.length;
        const totalDisplayed = sectionData.finalItems.length;
        
        return {
            categoryId,
            adCount,
            productCount,
            totalDisplayed,
            maxSlots: this.maxSlots,
            remainingSlots: this.maxSlots - totalDisplayed
        };
    }

    /**
     * تنظيف الخدمة
     */
    cleanup() {
        try {
            // إلغاء الاشتراك في التحديثات الفورية
            if (this.supabase) {
                this.supabase.removeAllChannels();
            }
            
            // مسح البيانات المخزنة
            this.categorySections.clear();
            this.realTimeUpdates.clear();
            
            console.log('🧹 تم تنظيف خدمة الإعلانات الذكية');
        } catch (error) {
            console.error('❌ خطأ في تنظيف الخدمة:', error);
        }
    }
}

// إنشاء نسخة عامة من الخدمة
window.smartCategoryAdvertisingService = new SmartCategoryAdvertisingService();

// تصدير الخدمة للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartCategoryAdvertisingService;
}

