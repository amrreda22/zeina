/**
 * خدمة الإعلانات - إدارة نظام الإعلانات الداخلي
 * تتعامل مع Supabase لإدارة الإعلانات والمنتجات المميزة
 */

class AdvertisingService {
    constructor() {
        // Use the initialized Supabase client
        this.supabase = window.supabaseClient || null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Ensure supabase client is available
            if (!this.supabase && window.supabaseClient) {
                this.supabase = window.supabaseClient;
            }
            if (!this.supabase) {
                console.error('خطأ: لم يتم تهيئة عميل Supabase بعد');
                return;
            }
            // التحقق من المستخدم الحالي
            const { data: { user } } = await this.supabase.auth.getUser();
            this.currentUser = user;
            
            // الاستماع لتغييرات حالة المصادقة
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
            });

            // بدء فحص الإعلانات المنتهية تلقائياً
            this.startExpiredAdsCleanup();

        } catch (error) {
            console.error('خطأ في تهيئة خدمة الإعلانات:', error);
        }
    }

    /**
     * جلب الإعلانات النشطة حسب النوع والموضع
     */
    async getActiveAdvertisements(type = null, position = null, limit = 10) {
        try {
            console.log('🔍 جلب الإعلانات النشطة...');
            
            // استخدام جدول advertisements مباشرة
            let query = this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true);

            if (type) {
                query = query.eq('ad_type', type);
            }
            
            if (position) {
                query = query.eq('position', position);
            }

            query = query.order('priority', { ascending: false });
            query = query.order('created_at', { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            
            if (error) {
                console.error('❌ خطأ في جلب الإعلانات:', error);
                throw error;
            }
            
            // فلترة الإعلانات المنتهية
            const now = new Date();
            const activeAds = data?.filter(ad => {
                // إذا لم يكن هناك تاريخ انتهاء، يعتبر الإعلان نشط
                if (!ad.end_date) return true;
                
                // إذا كان تاريخ الانتهاء في المستقبل، يعتبر الإعلان نشط
                return new Date(ad.end_date) > now;
            }) || [];
            
            // console.log(`✅ تم جلب ${activeAds.length} إعلان نشط (بعد فلترة الإعلانات المنتهية)`);
            return activeAds;
        } catch (error) {
            console.error('❌ خطأ في جلب الإعلانات النشطة:', error);
            return [];
        }
    }

    /**
     * جلب المنتجات المميزة (للصفحة الرئيسية)
     */
    async getFeaturedProducts(limit = 8) {
        try {
    
            
            // جلب الإعلانات المميزة من موقع الصفحة الرئيسية
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('position', 'homepage_featured')
                .eq('ad_type', 'featured')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            

            // console.log('📊 البيانات الخام:', data);
            
            // تحويل الإعلانات إلى تنسيق المنتجات مع ربط المنتجات الحقيقية
            const featuredProducts = [];
            
            for (const ad of data || []) {
                try {
                    let productData = null;
                    
                    // إذا كان الإعلان مرتبط بمنتج حقيقي
                    if (ad.product_id && ad.product_category) {
                        console.log(`🔗 ربط الإعلان ${ad.id} بالمنتج ${ad.product_id} من ${ad.product_category}`);
                        
                        // تحديد اسم الجدول
                        let tableName = 'products_other';
                        switch (ad.product_category) {
                            case 'cake':
                                tableName = 'products_cake';
                                break;
                            case 'koshat':
                                tableName = 'products_koshat';
                                break;
                            case 'mirr':
                                tableName = 'products_mirr';
                                break;
                            case 'other':
                                tableName = 'products_other';
                                break;
                            case 'invitations':
                                tableName = 'products_invitations';
                                break;
                            case 'flowerbouquets':
                                tableName = 'products_flowerbouquets';
                                break;
                        }
                        
                        // جلب بيانات المنتج الحقيقي
                        const { data: product, error: productError } = await this.supabase
                            .from(tableName)
                            .select('*')
                            .eq('id', ad.product_id)
                            .single();
                        
                        if (!productError && product) {
                            productData = product;
                            console.log(`✅ تم العثور على المنتج:`, product);
                        } else {
                            console.warn(`⚠️ لم يتم العثور على المنتج ${ad.product_id} في ${tableName}:`, productError);
                        }
                    }
                    
                    // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id, // معرف الإعلان
                        
                        // بيانات المنتج الحقيقي (إذا وجد)
                        name: productData?.description || ad.title || 'منتج مميز',
                        title: productData?.description || ad.title || 'منتج مميز',
                        description: productData?.description || ad.description || 'وصف المنتج',
                        price: productData?.price || 0,
                        image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                        image_url: productData?.image_urls?.[0] || ad.image_url,
                        
                        // بيانات إضافية من المنتج
                        category: productData?.category || 'featured',
                        subcategory: productData?.subcategory || 'advertisement',
                        governorate: productData?.governorate || 'جميع المحافظات',
                        cities: productData?.cities || '',
                        whatsapp: productData?.whatsapp || '',
                        facebook: productData?.facebook || '',
                        instagram: productData?.instagram || '',
                        
                        // بيانات الإعلان
                        is_featured: true,
                        is_advertisement: true,
                        ad_type: ad.ad_type,
                        ad_position: ad.position,
                        priority: ad.priority,
                        
                        // معرفات الربط
                        product_id: ad.product_id,
                        product_category: ad.product_category
                    };
                    
                    console.log('🔄 تحويل الإعلان إلى منتج:', ad, '→', product);
                    featuredProducts.push(product);
                    
                } catch (productError) {
                    console.error(`❌ خطأ في ربط الإعلان ${ad.id} بالمنتج:`, productError);
                    
                    // إضافة الإعلان بدون ربط المنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id,
                        name: ad.title || 'منتج مميز',
                        title: ad.title || 'منتج مميز',
                        description: ad.description || 'وصف المنتج',
                        price: 0,
                        image_urls: ad.image_url ? [ad.image_url] : [],
                        image_url: ad.image_url,
                        category: 'featured',
                        subcategory: 'advertisement',
                        governorate: 'جميع المحافظات',
                        cities: '',
                        whatsapp: '',
                        facebook: '',
                        instagram: '',
                        is_featured: true,
                        is_advertisement: true,
                        ad_type: ad.ad_type,
                        ad_position: ad.position,
                        priority: ad.priority
                    };
                    
                    featuredProducts.push(product);
                }
            }
            

            
            // إذا لم نصل إلى الحد المطلوب، نضيف منتجات عشوائية
            if (featuredProducts.length < limit) {
                const remainingSlots = limit - featuredProducts.length;
                
                const randomProducts = await this.getRandomProducts(remainingSlots);
                
                if (randomProducts && randomProducts.length > 0) {
                    featuredProducts.push(...randomProducts);
                } else {
                    console.warn('⚠️ لم يتم العثور على منتجات عشوائية للمنتجات المميزة');
                    
                    // محاولة إضافية: جلب منتجات من جدول واحد
                    try {
                        const { data: fallbackData, error: fallbackError } = await this.supabase
                            .from('products_other')
                            .select('*')
                            .limit(remainingSlots);
                        
                        if (!fallbackError && fallbackData && fallbackData.length > 0) {
                            const fallbackProducts = fallbackData.map(product => ({
                                ...product,
                                source_table: 'products_other',
                                is_random: true,
                                product_id: product.id,
                                product_category: 'other',
                                title: product.description || product.title || 'منتج عشوائي مميز',
                                name: product.description || product.title || 'منتج عشوائي مميز',
                                price: product.price || 0,
                                image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                                image_url: product.image_urls?.[0] || product.image_url || '../assets/images/placeholder.jpg',
                                governorate: product.governorate || 'جميع المحافظات',
                                cities: product.cities || '',
                                category: 'other',
                                subcategory: product.subcategory || 'عام',
                                is_featured: true,
                                is_advertisement: false
                            }));
                            
                            featuredProducts.push(...fallbackProducts);
                        }
                    } catch (fallbackError) {
                        console.warn('⚠️ فشلت المحاولة الاحتياطية للمنتجات المميزة:', fallbackError);
                    }
                }
            }
            
            // ترتيب: الإعلانات أولاً، ثم المنتجات ذات السعر، ثم المنتجات بدون سعر
            const featuredAdsFirst = featuredProducts.filter(p => p && p.is_advertisement === true);
            const featuredWithPrice = featuredProducts.filter(p => p && !p.is_advertisement && !Number.isNaN(Number(p.price)) && Number(p.price) > 0);
            const featuredNoPrice = featuredProducts.filter(p => p && !p.is_advertisement && (Number.isNaN(Number(p.price)) || Number(p.price) <= 0));
            return [...featuredAdsFirst, ...featuredWithPrice, ...featuredNoPrice];
        } catch (error) {
            console.error('❌ خطأ في جلب المنتجات المميزة:', error);
            return [];
        }
    }

    /**
     * جلب المنتجات الموصى بها (5 منتجات: 1 إعلان مدفوع + 4 منتجات عشوائية)
     * محسنة لاستخدام نفس آلية الأداء العالي المستخدمة في المنتجات المميزة
     */
    async getRecommendedProducts(limit = 5) {
        try {
            console.log('🔍 جلب المنتجات الموصى بها...');
            
            // جلب الإعلان المدفوع أولاً (أعلى أولوية)
            const { data: paidAd, error: paidError } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('position', 'homepage_recommended')
                .eq('ad_type', 'paid')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(1);

            if (paidError) {
                console.warn('⚠️ خطأ في جلب الإعلان المدفوع:', paidError);
            }

            // جلب الإعلانات العادية الموصى بها
            const { data: regularAds, error: regularError } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('position', 'homepage_recommended')
                .eq('ad_type', 'recommended')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit - 1);

            if (regularError) throw regularError;
            
            // console.log(`✅ تم جلب ${paidAd?.length || 0} إعلان مدفوع و ${regularAds?.length || 0} إعلان عادي`);
            
            // تحويل الإعلانات إلى تنسيق المنتجات مع ربط المنتجات الحقيقية
            const recommendedProducts = [];
            
            // معالجة الإعلان المدفوع أولاً (إذا وجد)
            if (paidAd && paidAd.length > 0) {
                for (const ad of paidAd) {
                    try {
                        let productData = null;
                        
                        // إذا كان الإعلان مرتبط بمنتج حقيقي
                        if (ad.product_id && ad.product_category) {
                            console.log(`🔗 ربط الإعلان المدفوع ${ad.id} بالمنتج ${ad.product_id} من ${ad.product_category}`);
                            
                            // تحديد اسم الجدول
                            let tableName = 'products_other';
                            switch (ad.product_category) {
                                case 'cake':
                                    tableName = 'products_cake';
                                    break;
                                case 'koshat':
                                    tableName = 'products_koshat';
                                    break;
                                case 'mirr':
                                    tableName = 'products_mirr';
                                    break;
                                case 'other':
                                    tableName = 'products_other';
                                    break;
                                case 'invitations':
                                    tableName = 'products_invitations';
                                    break;
                                case 'flowerbouquets':
                                    tableName = 'products_flowerbouquets';
                                    break;
                            }
                            
                            // جلب بيانات المنتج الحقيقي
                            const { data: product, error: productError } = await this.supabase
                                .from(tableName)
                                .select('*')
                                .eq('id', ad.product_id)
                                .single();
                            
                            if (!productError && product) {
                                productData = product;
                                console.log(`✅ تم العثور على المنتج المدفوع:`, product);
                            } else {
                                console.warn(`⚠️ لم يتم العثور على المنتج المدفوع ${ad.product_id} في ${tableName}:`, productError);
                            }
                        }
                        
                        // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
                        const product = {
                            id: ad.id,
                            ad_id: ad.id,
                            is_paid_ad: true, // علامة خاصة للإعلان المدفوع
                            
                            // بيانات المنتج الحقيقي (إذا وجد)
                            name: productData?.description || ad.title || 'منتج مدفوع مميز',
                            title: productData?.description || ad.title || 'منتج مدفوع مميز',
                            description: productData?.description || ad.description || 'وصف المنتج',
                            price: productData?.price || 0,
                            image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                            image_url: productData?.image_urls?.[0] || ad.image_url,
                            
                            // بيانات إضافية من المنتج
                            category: productData?.category || 'paid',
                            subcategory: productData?.subcategory || 'advertisement',
                            governorate: productData?.governorate || 'جميع المحافظات',
                            cities: productData?.cities || '',
                            whatsapp: productData?.whatsapp || '',
                            facebook: productData?.facebook || '',
                            instagram: productData?.instagram || '',
                            
                            // بيانات الإعلان
                            is_recommended: true,
                            is_advertisement: true,
                            ad_type: ad.ad_type,
                            ad_position: ad.position,
                            priority: ad.priority,
                            
                            // معرفات الربط
                            product_id: ad.product_id,
                            product_category: ad.product_category
                        };
                        
                        console.log('🔄 تحويل الإعلان المدفوع إلى منتج:', ad, '→', product);
                        recommendedProducts.push(product);
                        
                    } catch (productError) {
                        console.error(`❌ خطأ في ربط الإعلان المدفوع ${ad.id} بالمنتج:`, productError);
                        
                        // إضافة الإعلان المدفوع بدون ربط المنتج
                        const product = {
                            id: ad.id,
                            ad_id: ad.id,
                            is_paid_ad: true,
                            name: ad.title || 'منتج مدفوع مميز',
                            title: ad.title || 'منتج مدفوع مميز',
                            description: ad.description || 'وصف المنتج',
                            price: 0,
                            image_urls: ad.image_url ? [ad.image_url] : [],
                            image_url: ad.image_url,
                            category: 'paid',
                            subcategory: 'advertisement',
                            governorate: 'جميع المحافظات',
                            cities: '',
                            whatsapp: '',
                            facebook: '',
                            instagram: '',
                            is_recommended: true,
                            is_advertisement: true,
                            ad_type: ad.ad_type,
                            ad_position: ad.position,
                            priority: ad.priority
                        };
                        
                        recommendedProducts.push(product);
                    }
                }
            }
            
            // معالجة الإعلانات العادية
            for (const ad of regularAds || []) {
                try {
                    let productData = null;
                    
                    // إذا كان الإعلان مرتبط بمنتج حقيقي
                    if (ad.product_id && ad.product_category) {
                        console.log(`🔗 ربط الإعلان ${ad.id} بالمنتج ${ad.product_id} من ${ad.product_category}`);
                        
                        // تحديد اسم الجدول
                        let tableName = 'products_other';
                        switch (ad.product_category) {
                            case 'cake':
                                tableName = 'products_cake';
                                break;
                            case 'koshat':
                                tableName = 'products_koshat';
                                break;
                            case 'mirr':
                                tableName = 'products_mirr';
                                break;
                            case 'other':
                                tableName = 'products_other';
                                break;
                            case 'invitations':
                                tableName = 'products_invitations';
                                break;
                            case 'flowerbouquets':
                                tableName = 'products_flowerbouquets';
                                break;
                        }
                        
                        // جلب بيانات المنتج الحقيقي
                        const { data: product, error: productError } = await this.supabase
                            .from(tableName)
                            .select('*')
                            .eq('id', ad.product_id)
                            .single();
                        
                        if (!productError && product) {
                            productData = product;
                            console.log(`✅ تم العثور على المنتج:`, product);
                        } else {
                            console.warn(`⚠️ لم يتم العثور على المنتج ${ad.product_id} في ${tableName}:`, productError);
                        }
                    }
                    
                    // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id,
                        
                        // بيانات المنتج الحقيقي (إذا وجد)
                        name: productData?.description || ad.title || 'منتج موصى به',
                        title: productData?.description || ad.title || 'منتج موصى به',
                        description: productData?.description || ad.description || 'وصف المنتج',
                        price: productData?.price || 0,
                        image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                        image_url: productData?.image_urls?.[0] || ad.image_url,
                        
                        // بيانات إضافية من المنتج
                        category: productData?.category || 'recommended',
                        subcategory: productData?.subcategory || 'advertisement',
                        governorate: productData?.governorate || 'جميع المحافظات',
                        cities: productData?.cities || '',
                        whatsapp: productData?.whatsapp || '',
                        facebook: productData?.facebook || '',
                        instagram: productData?.instagram || '',
                        
                        // بيانات الإعلان
                        is_recommended: true,
                        is_advertisement: true,
                        ad_type: ad.ad_type,
                        ad_position: ad.position,
                        priority: ad.priority,
                        
                        // معرفات الربط
                        product_id: ad.product_id,
                        product_category: ad.product_category
                    };
                    
                    console.log('🔄 تحويل الإعلان إلى منتج:', ad, '→', product);
                    recommendedProducts.push(product);
                    
                } catch (productError) {
                    console.error(`❌ خطأ في ربط الإعلان ${ad.id} بالمنتج:`, productError);
                    
                    // إضافة الإعلان بدون ربط المنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id,
                        name: ad.title || 'منتج موصى به',
                        title: ad.title || 'منتج موصى به',
                        description: ad.description || 'وصف المنتج',
                        price: 0,
                        image_urls: ad.image_url ? [ad.image_url] : [],
                        image_url: ad.image_url,
                        category: 'recommended',
                        subcategory: 'advertisement',
                        governorate: 'جميع المحافظات',
                        cities: '',
                        whatsapp: '',
                        facebook: '',
                        instagram: '',
                        is_recommended: true,
                        is_advertisement: true,
                        ad_type: ad.ad_type,
                        ad_position: ad.position,
                        priority: ad.priority
                    };
                    
                    recommendedProducts.push(product);
                }
            }
            
            console.log('🎯 المنتجات الموصى بها النهائية:', recommendedProducts);
            
            // إذا لم نصل إلى 5 منتجات، نضيف منتجات عشوائية
            if (recommendedProducts.length < limit) {
                const remainingSlots = limit - recommendedProducts.length;
                console.log(`🔄 إضافة ${remainingSlots} منتج عشوائي لملء الخانات...`);
                
                const randomProducts = await this.getRandomProductsOptimized(remainingSlots);
                
                if (randomProducts && randomProducts.length > 0) {
                    recommendedProducts.push(...randomProducts);
                    console.log(`✅ تم إضافة ${randomProducts.length} منتج عشوائي. المجموع: ${recommendedProducts.length}`);
                } else {
                    console.warn('⚠️ لم يتم العثور على منتجات عشوائية لملء الخانات');
                    
                    // محاولة إضافية: جلب منتجات من جدول واحد
                    try {
                        const { data: fallbackData, error: fallbackError } = await this.supabase
                            .from('products_other')
                            .select('*')
                            .limit(remainingSlots);
                        
                        if (!fallbackError && fallbackData && fallbackData.length > 0) {
                            console.log(`✅ تم جلب ${fallbackData.length} منتج احتياطي من products_other`);
                            
                            const fallbackProducts = fallbackData.map(product => ({
                                ...product,
                                source_table: 'products_other',
                                is_random: true,
                                product_id: product.id,
                                product_category: 'other',
                                title: product.description || product.title || 'منتج عشوائي',
                                name: product.description || product.title || 'منتج عشوائي',
                                price: product.price || 0,
                                image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                                image_url: product.image_urls?.[0] || product.image_url || '../assets/images/placeholder.jpg',
                                governorate: product.governorate || 'جميع المحافظات',
                                cities: product.cities || '',
                                category: 'other',
                                subcategory: product.subcategory || 'عام',
                                // إضافة علامات للتمييز
                                is_featured: false,
                                is_recommended: false
                            }));
                            
                            recommendedProducts.push(...fallbackProducts);
                            console.log(`✅ تم إضافة ${fallbackProducts.length} منتج احتياطي. المجموع النهائي: ${recommendedProducts.length}`);
                        }
                    } catch (fallbackError) {
                        console.warn('⚠️ فشلت المحاولة الاحتياطية الإضافية:', fallbackError);
                    }
                }
            }
            
            // ترتيب: الإعلانات أولاً، ثم المنتجات ذات السعر، ثم المنتجات بدون سعر
            const recommendedAdsFirst = recommendedProducts.filter(p => p && p.is_advertisement === true);
            const recommendedWithPrice = recommendedProducts.filter(p => p && !p.is_advertisement && !Number.isNaN(Number(p.price)) && Number(p.price) > 0);
            const recommendedNoPrice = recommendedProducts.filter(p => p && !p.is_advertisement && (Number.isNaN(Number(p.price)) || Number(p.price) <= 0));
            return [...recommendedAdsFirst, ...recommendedWithPrice, ...recommendedNoPrice];
        } catch (error) {
            console.error('❌ خطأ في جلب المنتجات الموصى بها:', error);
            return [];
        }
    }

    /**
     * جلب الإعلانات المميزة للتصنيف المحدد
     */
    async getCategoryFeaturedProducts(category, limit = 4) {
        try {
    
            
            // جلب الإعلانات المميزة من موقع التصنيف
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('position', 'category_featured')
                .eq('product_category', category)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            

            // console.log('📊 البيانات الخام:', data);
            
            // تحويل الإعلانات إلى تنسيق المنتجات مع ربط المنتجات الحقيقية
            const categoryFeaturedProducts = [];
            
            for (const ad of data || []) {
                try {
                    let productData = null;
                    
                    // إذا كان الإعلان مرتبط بمنتج حقيقي
                    if (ad.product_id && ad.product_category) {
                        
                        // تحديد اسم الجدول
                        let tableName = 'products_other';
                        switch (ad.product_category) {
                            case 'cake':
                                tableName = 'products_cake';
                                break;
                            case 'koshat':
                                tableName = 'products_koshat';
                                break;
                            case 'mirr':
                                tableName = 'products_mirr';
                                break;
                            case 'other':
                                tableName = 'products_other';
                                break;
                            case 'invitations':
                                tableName = 'products_invitations';
                                break;
                            case 'flowerbouquets':
                                tableName = 'products_flowerbouquets';
                                break;
                        }
                        
                        // جلب بيانات المنتج الحقيقي
                        const { data: product, error: productError } = await this.supabase
                            .from(tableName)
                            .select('*')
                            .eq('id', ad.product_id)
                            .single();
                        
                        if (!productError && product) {
                            productData = product;
                        } else {
                            console.warn(`⚠️ لم يتم العثور على المنتج ${ad.product_id} في ${tableName}:`, productError);
                        }
                    }
                    
                    // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id, // معرف الإعلان
                        
                        // بيانات المنتج الحقيقي (إذا وجد)
                        name: productData?.description || ad.title || 'منتج مميز في التصنيف',
                        title: productData?.description || ad.title || 'منتج مميز في التصنيف',
                        description: productData?.description || ad.description || 'وصف المنتج',
                        price: productData?.price || 0,
                        image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                        image_url: productData?.image_urls?.[0] || ad.image_url,
                        
                        // بيانات إضافية من المنتج
                        category: productData?.category || category,
                        subcategory: productData?.subcategory || 'advertisement',
                        governorate: productData?.governorate || 'جميع المحافظات',
                        cities: productData?.cities || '',
                        whatsapp: productData?.whatsapp || '',
                        facebook: productData?.facebook || '',
                        instagram: productData?.instagram || '',
                        
                        // بيانات الإعلان
                        is_featured: true,
                        is_category_featured: true, // علامة خاصة للإعلانات المميزة في التصنيف
                        is_advertisement: true,
                        ad_type: ad.ad_type,
                        ad_position: ad.position,
                        priority: ad.priority,
                        
                        // معرفات الربط
                        product_id: ad.product_id,
                        product_category: ad.product_category
                    };
                    
                    categoryFeaturedProducts.push(product);
                } catch (productError) {
                    console.error(`❌ خطأ في ربط الإعلان ${ad.id} بالمنتج:`, productError);
                    
                    // إضافة الإعلان بدون ربط المنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id,
                        name: ad.title || 'منتج مميز في التصنيف',
                        title: ad.title || 'منتج مميز في التصنيف',
                        description: ad.description || 'وصف المنتج',
                        price: 0,
                        image_urls: ad.image_url ? [ad.image_url] : [],
                        image_url: ad.image_url,
                        category: category,
                        subcategory: 'advertisement',
                        governorate: 'جميع المحافظات',
                        cities: '',
                        whatsapp: '',
                        facebook: '',
                        instagram: '',
                        is_featured: true,
                        is_category_featured: true,
                        is_advertisement: true,
                        ad_type: ad.ad_type,
                        ad_position: ad.position,
                        priority: ad.priority
                    };
                    
                    categoryFeaturedProducts.push(product);
                }
            }
            
            return categoryFeaturedProducts;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الإعلانات المميزة للتصنيف:', error);
            return [];
        }
    }

    /**
     * تسجيل ظهور الإعلان
     */
    async recordImpression(adId) {
        try {
            // جلب العداد الحالي أولاً
            const { data: currentAd, error: fetchError } = await this.supabase
                .from('advertisements')
                .select('impressions_count')
                .eq('id', adId)
                .single();

            if (fetchError) {
                console.warn(`⚠️ خطأ في جلب عداد الظهورات: ${fetchError.message}`);
                return;
            }

            // حساب العداد الجديد
            const currentCount = currentAd?.impressions_count || 0;
            const newCount = currentCount + 1;

            // تحديث عداد الظهورات
            const { error: updateError } = await this.supabase
                .from('advertisements')
                .update({ 
                    impressions_count: newCount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', adId);

            if (updateError) {
                console.warn(`⚠️ خطأ في تحديث عداد الظهورات: ${updateError.message}`);
            }

        } catch (error) {
            console.warn('⚠️ خطأ في تسجيل الظهور:', error);
        }
    }

    /**
     * تسجيل النقر على الإعلان (click)
     */
    async recordClick(adId) {
        try {
            if (!adId) return;



            // جلب العداد الحالي أولاً
            const { data: currentAd, error: fetchError } = await this.supabase
                .from('advertisements')
                .select('clicks_count')
                .eq('id', adId)
                .single();

            if (fetchError) {
                console.warn(`⚠️ خطأ في جلب عداد النقرات: ${fetchError.message}`);
                return;
            }

            // حساب العداد الجديد
            const currentCount = currentAd?.clicks_count || 0;
            const newCount = currentCount + 1;

            // تحديث عداد النقرات
            const { error: updateError } = await this.supabase
                .from('advertisements')
                .update({ 
                    clicks_count: newCount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', adId);

            if (updateError) {
                console.warn(`⚠️ خطأ في تحديث عداد النقرات: ${updateError.message}`);
            }

        } catch (error) {
            console.error('❌ خطأ في تسجيل النقر على الإعلان:', error);
        }
        }

    /**
     * إنشاء إعلان جديد
     */
    async createAdvertisement(adData) {
        try {
            console.log('🔧 إنشاء إعلان جديد:', adData);
            
            // إنشاء الإعلان مع جميع البيانات المطلوبة
            const { data, error } = await this.supabase
                .from('advertisements')
                .insert({
                    title: adData.title || 'إعلان جديد',
                    description: adData.description,
                    image_url: adData.image_url,
                    link_url: adData.link_url,
                    ad_type: adData.ad_type || 'featured',
                    position: adData.position || 'homepage_featured',
                    start_date: adData.start_date || new Date().toISOString(),
                    end_date: adData.end_date,
                    priority: adData.priority || 1,
                    is_active: adData.is_active !== undefined ? adData.is_active : true,
                    // إضافة أعمدة ربط المنتجات
                    product_id: adData.product_id || null,
                    product_category: adData.product_category || null,
                    // إضافة حقل القسم الجديد
                    category_section: adData.category_section || null
                })
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ تم إنشاء الإعلان بنجاح:', data);
            
            return {
                ...data,
                message: 'تم إنشاء الإعلان بنجاح'
            };
                
        } catch (error) {
            console.error('❌ خطأ في إنشاء الإعلان:', error);
            throw error;
        }
    }

    /**
     * تحديث إعلان موجود
     */
    async updateAdvertisement(adId, updateData) {
        try {
            // تحديث الإعلان مع البيانات الأساسية فقط
            const { data, error } = await this.supabase
                .from('advertisements')
                .update({
                    title: updateData.title,
                    description: updateData.description,
                    image_url: updateData.image_url,
                    link_url: updateData.link_url,
                    ad_type: updateData.ad_type,
                    position: updateData.position,
                    start_date: updateData.start_date,
                    end_date: updateData.end_date,
                    priority: updateData.priority,
                    is_active: updateData.is_active,
                    // إضافة حقل القسم الجديد
                    category_section: updateData.category_section,
                    product_category: updateData.category,
                    product_id: updateData.product_id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', adId)
                .select()
                .single();

            if (error) throw error;
            
            return {
                success: true,
                data: data,
                message: 'تم تحديث الإعلان بنجاح'
            };
        } catch (error) {
            console.error('خطأ في تحديث الإعلان:', error);
            return {
                success: false,
                error: error.message || 'حدث خطأ في تحديث الإعلان'
            };
        }
    }

    /**
     * حذف إعلان
     */
    async deleteAdvertisement(adId) {
        try {
            // حذف الإعلان مباشرة بدون تحقق من المستخدمين
            const { error } = await this.supabase
                .from('advertisements')
                .delete()
                .eq('id', adId);

            if (error) throw error;
            
            return {
                success: true,
                message: 'تم حذف الإعلان بنجاح'
            };
        } catch (error) {
            console.error('خطأ في حذف الإعلان:', error);
            return {
                success: false,
                error: error.message || 'حدث خطأ في حذف الإعلان'
            };
        }
    }

    /**
     * تحديث حالة الإعلان (إيقاف مؤقت/تفعيل)
     */
    async updateAdvertisementStatus(adId, status) {
        try {
            // تحديث حالة الإعلان مباشرة بدون تحقق من المستخدمين
            const { data, error } = await this.supabase
                .from('advertisements')
                .update({
                    is_active: status === 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', adId)
                .select()
                .single();

            if (error) throw error;
            
            return {
                success: true,
                data: data,
                message: status === 'active' ? 'تم تفعيل الإعلان بنجاح' : 'تم إيقاف الإعلان بنجاح'
            };
        } catch (error) {
            console.error('خطأ في تحديث حالة الإعلان:', error);
            return {
                success: false,
                error: error.message || 'حدث خطأ في تحديث حالة الإعلان'
            };
        }
    }

    /**
     * دالة مساعدة لمعالجة الصور
     */
    _getProductImageUrl(productData) {
        if (!productData) {
            console.log('🚨 DEBUG: لا توجد بيانات منتج');
            return null;
        }
        
        console.log('🚨 DEBUG: معالجة صور المنتج:', {
            id: productData.id,
            image_urls: productData.image_urls,
            image_url: productData.image_url
        });
        
        // نستخدم image_urls أولاً
        if (productData.image_urls && Array.isArray(productData.image_urls) && productData.image_urls.length > 0) {
            console.log('🚨 DEBUG: تم العثور على صورة من image_urls:', productData.image_urls[0]);
            return productData.image_urls[0];
        }
        
        // إذا لم توجد image_urls، نستخدم image_url (إذا كان موجوداً)
        if (productData.image_url) {
            console.log('🚨 DEBUG: تم العثور على صورة من image_url:', productData.image_url);
            return productData.image_url;
        }
        
        console.log('🚨 DEBUG: لم يتم العثور على أي صورة');
        return null;
    }

    /**
     * جلب إعلان مع تفاصيل المنتج المرتبط
     */
    async getAdvertisementWithProduct(adId) {
        try {
            console.log(`🔍 جلب الإعلان ${adId} مع تفاصيل المنتج...`);
            
            // جلب بيانات الإعلان
            const { data: ad, error: adError } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('id', adId)
                .single();
            
            if (adError) throw adError;
            
            console.log('📊 بيانات الإعلان:', ad);
            
            let productData = null;
            
            // إذا كان الإعلان مرتبط بمنتج حقيقي
            if (ad.product_id && ad.product_category) {
                console.log(`🔗 ربط الإعلان ${ad.id} بالمنتج ${ad.product_id} من ${ad.product_category}`);
                
                // تحديد اسم الجدول
                let tableName = 'products_other';
                switch (ad.product_category) {
                    case 'cake':
                        tableName = 'products_cake';
                        break;
                    case 'koshat':
                        tableName = 'products_koshat';
                        break;
                    case 'mirr':
                        tableName = 'products_mirr';
                        break;
                    case 'other':
                        tableName = 'products_other';
                        break;
                    case 'invitations':
                        tableName = 'products_invitations';
                        break;
                    case 'flowerbouquets':
                        tableName = 'products_flowerbouquets';
                        break;
                }
                
                // جلب بيانات المنتج الحقيقي مع التأكد من جلب جميع الحقول
                // نستخدم image_urls فقط لأن image_url قد لا يكون موجوداً في جميع الجداول
                const { data: product, error: productError } = await this.supabase
                    .from(tableName)
                    .select('id, description, price, image_urls, category, subcategory, governorate, cities, whatsapp, facebook, instagram, created_at, updated_at')
                    .eq('id', ad.product_id)
                    .single();
                
                if (!productError && product) {
                    productData = product;
                    console.log(`✅ تم العثور على المنتج:`, product);
                } else {
                    console.warn(`⚠️ لم يتم العثور على المنتج ${ad.product_id} في ${tableName}:`, productError);
                }
            }
            
            // دمج بيانات الإعلان والمنتج
            const result = {
                // بيانات الإعلان
                id: ad.id,
                title: ad.title,
                description: ad.description,
                image_url: ad.image_url,
                link_url: ad.link_url,
                ad_type: ad.ad_type,
                position: ad.position,
                priority: ad.priority,
                is_active: ad.is_active,
                start_date: ad.start_date,
                end_date: ad.end_date,
                created_at: ad.created_at,
                updated_at: ad.updated_at,
                
                // معرفات الربط
                product_id: ad.product_id,
                product_category: ad.product_category,
                
                // بيانات المنتج (إذا وجد)
                product: productData ? {
                    id: productData.id,
                    name: productData.description || 'منتج',
                    description: productData.description,
                    price: productData.price || 0,
                    image_urls: productData.image_urls || [],
                    image_url: this._getProductImageUrl(productData),
                    category: productData.category,
                    subcategory: productData.subcategory,
                    governorate: productData.governorate,
                    cities: productData.cities,
                    whatsapp: productData.whatsapp || '',
                    facebook: productData.facebook || '',
                    instagram: productData.instagram || '',
                    created_at: productData.created_at,
                    updated_at: productData.updated_at
                } : null,
                
                // معلومات إضافية
                has_product: !!productData,
                product_table: ad.product_category
            };
            
            console.log('🔄 النتيجة النهائية:', result);
            return result;
            
        } catch (error) {
            console.error(`❌ خطأ في جلب الإعلان مع المنتج:`, error);
            throw error;
        }
    }

    /**
     * جلب جميع الإعلانات مع تفاصيل المنتجات المرتبطة
     */
    async getAllAdvertisementsWithProducts(limit = 50) {
        try {
            console.log('🔍 جلب جميع الإعلانات مع تفاصيل المنتجات...');
            
            // جلب جميع الإعلانات
            const { data: ads, error: adsError } = await this.supabase
                .from('advertisements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (adsError) throw adsError;
            
            // console.log(`✅ تم جلب ${ads?.length || 0} إعلان`);
            
            // ربط كل إعلان بمنتجه
            const adsWithProducts = [];
            
            for (const ad of ads || []) {
                try {
                    const adWithProduct = await this.getAdvertisementWithProduct(ad.id);
                    adsWithProducts.push(adWithProduct);
                } catch (error) {
                    console.error(`❌ خطأ في ربط الإعلان ${ad.id}:`, error);
                    // إضافة الإعلان بدون ربط المنتج
                    adsWithProducts.push({
                        ...ad,
                        product: null,
                        has_product: false,
                        product_table: ad.product_category
                    });
                }
            }
            
            console.log(`🎯 تم ربط ${adsWithProducts.filter(ad => ad.has_product).length} إعلان بمنتجات`);
            return adsWithProducts;
            
        } catch (error) {
            console.error('❌ خطأ في جلب جميع الإعلانات مع المنتجات:', error);
            return [];
        }
    }

    /**
     * جلب منتجات عشوائية من قاعدة البيانات
     */
    async getRandomProducts(limit = 4) {
        try {
            const allProducts = [];
            
            // جلب منتجات من جميع الجداول
            const tables = ['products_koshat', 'products_cake', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
            
            for (const table of tables) {
                try {
                    // محاولة جلب المنتجات مع معالجة أفضل للأخطاء
                    const { data, error } = await this.supabase
                        .from(table)
                        .select('*')
                        .limit(10); // جلب 10 منتجات من كل جدول
                    
                    if (error) {
                        console.warn(`⚠️ خطأ في جلب منتجات من ${table}:`, error);
                        continue; // الانتقال للجدول التالي
                    }
                    
                    if (data && data.length > 0) {
                        
                        // إضافة معرف الجدول لكل منتج
                        const productsWithTable = data.map(product => ({
                            ...product,
                            source_table: table,
                            is_random: true,
                            product_id: product.id, // إضافة product_id للمنتجات العشوائية
                            product_category: table.replace('products_', ''), // استخراج الفئة من اسم الجدول
                            // إضافة بيانات افتراضية إذا كانت مفقودة
                            title: product.description || product.title || `منتج من ${table.replace('products_', '')}`,
                            name: product.description || product.title || `منتج من ${table.replace('products_', '')}`,
                            price: product.price || 0,
                            image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                            image_url: product.image_urls?.[0] || product.image_url || '../assets/images/placeholder.jpg',
                            governorate: product.governorate || 'جميع المحافظات',
                            cities: product.cities || '',
                            category: table.replace('products_', ''),
                            subcategory: product.subcategory || 'عام',
                            // إضافة علامات للتمييز
                            is_featured: false,
                            is_recommended: false
                        }));
                        
                        allProducts.push(...productsWithTable);
                    } else {
                        console.log(`ℹ️ لا توجد منتجات في ${table}`);
                    }
                } catch (tableError) {
                    console.warn(`⚠️ خطأ في جلب منتجات من ${table}:`, tableError);
                }
            }
            
            if (allProducts.length === 0) {
                console.warn('⚠️ لم يتم العثور على أي منتجات عشوائية، محاولة جلب من جدول واحد...');
                
                // محاولة احتياطية: جلب من جدول واحد فقط
                try {
                    const { data: fallbackData, error: fallbackError } = await this.supabase
                        .from('products_other')
                        .select('*')
                        .limit(limit);
                    
                    if (!fallbackError && fallbackData && fallbackData.length > 0) {
                        
                        const fallbackProducts = fallbackData.map(product => ({
                            ...product,
                            source_table: 'products_other',
                            is_random: true,
                            product_id: product.id,
                            product_category: 'other',
                            title: product.description || product.title || 'منتج عشوائي',
                            name: product.description || product.title || 'منتج عشوائي',
                            price: product.price || 0,
                            image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                            image_url: product.image_urls?.[0] || product.image_url || '../assets/images/placeholder.jpg',
                            governorate: product.governorate || 'جميع المحافظات',
                            cities: product.cities || '',
                            category: 'other',
                            subcategory: product.subcategory || 'عام'
                        }));
                        
                        return fallbackProducts;
                    }
                } catch (fallbackError) {
                    console.warn('⚠️ فشلت المحاولة الاحتياطية:', fallbackError);
                }
                
                return [];
            }
            
            // خلط المنتجات واختيار عشوائي
            const shuffled = allProducts.sort(() => 0.5 - Math.random());
            const selectedProducts = shuffled.slice(0, Math.min(limit, allProducts.length));
            return selectedProducts;
            
        } catch (error) {
            console.error('❌ خطأ في جلب المنتجات العشوائية:', error);
            return [];
        }
    }

    /**
     * جلب منتجات عشوائية محسنة (نفس آلية الأداء العالي المستخدمة في المنتجات المميزة)
     */
    async getRandomProductsOptimized(limit = 4) {
        try {
            console.log(`🎲 جلب ${limit} منتج عشوائي محسن...`);
            
            const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
            let allProducts = [];

            // جلب ALL منتجات من جميع الجداول في التوازي للأداء الأفضل
            const promises = tables.map(async (table) => {
                try {
                    const { data, error } = await this.supabase
                        .from(table)
                        .select('*'); // جلب جميع المنتجات بدون تحديد عدد

                    if (error) {
                        console.error(`Error fetching products from ${table}:`, error);
                        return [];
                    }

                    // إضافة معرف الجدول لكل منتج
                    return (data || []).map(product => ({
                        ...product,
                        source_table: table,
                        is_random: true,
                        product_id: product.id,
                        product_category: table.replace('products_', ''),
                        // إضافة بيانات افتراضية إذا كانت مفقودة
                        title: product.description || product.title || `منتج من ${table.replace('products_', '')}`,
                        name: product.description || product.title || `منتج من ${table.replace('products_', '')}`,
                        price: product.price || 0,
                        image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                        image_url: product.image_urls?.[0] || product.image_url || '../assets/images/placeholder.jpg',
                        governorate: product.governorate || 'جميع المحافظات',
                        cities: product.cities || '',
                        category: table.replace('products_', ''),
                        subcategory: product.subcategory || 'عام',
                        // إضافة علامات للتمييز
                        is_featured: false,
                        is_recommended: false
                    }));
                } catch (error) {
                    console.error(`Error in parallel fetch for ${table}:`, error);
                    return [];
                }
            });

            // انتظار جميع الوعود لحلها
            const results = await Promise.all(promises);
            
            // دمج جميع النتائج
            allProducts = results.flat();

            if (allProducts.length === 0) {
                console.warn('⚠️ لم يتم العثور على أي منتجات عشوائية، محاولة جلب من جدول واحد...');
                
                // محاولة احتياطية: جلب من جدول واحد فقط
                try {
                    const { data: fallbackData, error: fallbackError } = await this.supabase
                        .from('products_other')
                        .select('*')
                        .limit(limit);
                    
                    if (!fallbackError && fallbackData && fallbackData.length > 0) {
                        
                        const fallbackProducts = fallbackData.map(product => ({
                            ...product,
                            source_table: 'products_other',
                            is_random: true,
                            product_id: product.id,
                            product_category: 'other',
                            title: product.description || product.title || 'منتج عشوائي',
                            name: product.description || product.title || 'منتج عشوائي',
                            price: product.price || 0,
                            image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                            image_url: product.image_urls?.[0] || product.image_url || '../assets/images/placeholder.jpg',
                            governorate: product.governorate || 'جميع المحافظات',
                            cities: product.cities || '',
                            category: 'other',
                            subcategory: product.subcategory || 'عام'
                        }));
                        
                        return fallbackProducts;
                    }
                } catch (fallbackError) {
                    console.warn('⚠️ فشلت المحاولة الاحتياطية:', fallbackError);
                }
                
                return [];
            }

            // خلط جميع المنتجات عشوائياً
            for (let i = allProducts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
            }

            // إرجاع فقط العدد المطلوب (من المنتجات المخلوطة عشوائياً)
            const randomProducts = allProducts.slice(0, limit);

            console.log(`✅ تم جلب ${randomProducts.length} منتج عشوائي محسن`);
            return randomProducts;
            
        } catch (error) {
            console.error('❌ خطأ في جلب المنتجات العشوائية المحسنة:', error);
            return [];
        }
    }

    /**
     * جلب إحصائيات شاملة لنظام الإعلانات
     */
    async getSystemStatistics() {
        try {
            console.log('📊 جلب الإحصائيات الشاملة للنظام...');
            
            // جلب جميع الإعلانات النشطة
            const { data: activeAds, error: activeError } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true);

            if (activeError) throw activeError;

            // جلب جميع الإعلانات (بما في ذلك غير النشطة)
            const { data: allAds, error: allError } = await this.supabase
                .from('advertisements')
                .select('*');

            if (allError) throw allError;

            // حساب الإحصائيات
            const stats = {
                // إحصائيات عامة
                total_advertisements: allAds?.length || 0,
                active_advertisements: activeAds?.length || 0,
                inactive_advertisements: (allAds?.length || 0) - (activeAds?.length || 0),
                
                // إجمالي العدادات
                total_impressions: 0,
                total_clicks: 0,
                total_budget: 0,
                total_spent: 0,
                
                // إحصائيات حسب النوع
                by_type: {
                    featured: { count: 0, impressions: 0, clicks: 0 },
                    recommended: { count: 0, impressions: 0, clicks: 0 },
                    banner: { count: 0, impressions: 0, clicks: 0 }
                },
                
                // إحصائيات حسب الموضع
                by_position: {
                    homepage_featured: { count: 0, impressions: 0, clicks: 0 },
                    homepage_recommended: { count: 0, impressions: 0, clicks: 0 },
                    sidebar: { count: 0, impressions: 0, clicks: 0 },
                    category_featured: { count: 0, impressions: 0, clicks: 0 }
                },
                
                // إحصائيات حسب التصنيف
                by_category: {},
                
                // معدلات الأداء
                overall_ctr: 0, // معدل النقر الإجمالي
                average_impressions_per_ad: 0,
                average_clicks_per_ad: 0
            };

            // حساب الإحصائيات التفصيلية
            if (allAds && allAds.length > 0) {
                allAds.forEach(ad => {
                    // إجمالي العدادات
                    stats.total_impressions += ad.impressions_count || 0;
                    stats.total_clicks += ad.clicks_count || 0;
                    stats.total_budget += ad.budget || 0;
                    stats.total_spent += ad.spent || 0;

                    // حسب النوع
                    if (ad.ad_type) {
                        if (!stats.by_type[ad.ad_type]) {
                            stats.by_type[ad.ad_type] = { count: 0, impressions: 0, clicks: 0 };
                        }
                        stats.by_type[ad.ad_type].count++;
                        stats.by_type[ad.ad_type].impressions += ad.impressions_count || 0;
                        stats.by_type[ad.ad_type].clicks += ad.clicks_count || 0;
                    }

                    // حسب الموضع
                    if (ad.position) {
                        if (!stats.by_position[ad.position]) {
                            stats.by_position[ad.position] = { count: 0, impressions: 0, clicks: 0 };
                        }
                        stats.by_position[ad.position].count++;
                        stats.by_position[ad.position].impressions += ad.impressions_count || 0;
                        stats.by_position[ad.position].clicks += ad.clicks_count || 0;
                    }

                    // حسب التصنيف
                    if (ad.product_category) {
                        if (!stats.by_category[ad.product_category]) {
                            stats.by_category[ad.product_category] = { count: 0, impressions: 0, clicks: 0 };
                        }
                        stats.by_category[ad.product_category].count++;
                        stats.by_category[ad.product_category].impressions += ad.impressions_count || 0;
                        stats.by_category[ad.product_category].clicks += ad.clicks_count || 0;
                    }
                });

                // حساب المعدلات
                if (stats.total_impressions > 0) {
                    stats.overall_ctr = (stats.total_clicks / stats.total_impressions * 100).toFixed(2);
                }
                
                if (stats.total_advertisements > 0) {
                    stats.average_impressions_per_ad = (stats.total_impressions / stats.total_advertisements).toFixed(0);
                    stats.average_clicks_per_ad = (stats.total_clicks / stats.total_advertisements).toFixed(0);
                }
            }

            console.log('✅ تم حساب الإحصائيات الشاملة:', stats);
            return stats;

        } catch (error) {
            console.error('❌ خطأ في جلب الإحصائيات الشاملة:', error);
            return null;
        }
    }

    /**
     * جلب إجمالي الظهورات لجميع الإعلانات
     */
    async getTotalImpressions() {
        try {
            console.log('📊 جلب إجمالي الظهورات...');
            
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('impressions_count');

            if (error) throw error;

            const totalImpressions = (data || []).reduce((total, ad) => {
                return total + (ad.impressions_count || 0);
            }, 0);

            console.log(`✅ إجمالي الظهورات: ${totalImpressions}`);
            return totalImpressions;

        } catch (error) {
            console.error('❌ خطأ في جلب إجمالي الظهورات:', error);
            return 0;
        }
    }

    /**
     * جلب إجمالي النقرات لجميع الإعلانات
     */
    async getTotalClicks() {
        try {
            console.log('📊 جلب إجمالي النقرات...');
            
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('clicks_count');

            if (error) throw error;

            const totalClicks = (data || []).reduce((total, ad) => {
                return total + (ad.clicks_count || 0);
            }, 0);

            console.log(`✅ إجمالي النقرات: ${totalClicks}`);
            return totalClicks;

        } catch (error) {
            console.error('❌ خطأ في جلب إجمالي النقرات:', error);
            return 0;
        }
    }

    /**
     * جلب معدل النقر الإجمالي (CTR)
     */
    async getOverallCTR() {
        try {
            const totalImpressions = await this.getTotalImpressions();
            const totalClicks = await this.getTotalClicks();

            if (totalImpressions === 0) return 0;

            const ctr = (totalClicks / totalImpressions * 100).toFixed(2);
            console.log(`✅ معدل النقر الإجمالي: ${ctr}%`);
            return parseFloat(ctr);

        } catch (error) {
            console.error('❌ خطأ في حساب معدل النقر الإجمالي:', error);
            return 0;
        }
    }

    /**
     * جلب إحصائيات سريعة (ملخص)
     */
    async getQuickStats() {
        try {
            const [totalImpressions, totalClicks, activeAds] = await Promise.all([
                this.getTotalImpressions(),
                this.getTotalClicks(),
                this.getActiveAdvertisements()
            ]);

            const quickStats = {
                total_impressions: totalImpressions,
                total_clicks: totalClicks,
                active_ads: activeAds.length,
                overall_ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0
            };

            console.log('📊 الإحصائيات السريعة:', quickStats);
            return quickStats;

        } catch (error) {
            console.error('❌ خطأ في جلب الإحصائيات السريعة:', error);
            return null;
        }
    }

    /**
     * تحديث إحصائيات الإعلان المحدد
     */
    async updateAdStatistics(adId) {
        try {
            console.log(`📊 تحديث إحصائيات الإعلان: ${adId}`);
            
            const { data: ad, error } = await this.supabase
                .from('advertisements')
                .select('impressions_count, clicks_count, budget, spent')
                .eq('id', adId)
                .single();

            if (error) throw error;

            // حساب معدل النقر للإعلان
            const ctr = ad.impressions_count > 0 ? (ad.clicks_count / ad.impressions_count * 100).toFixed(2) : 0;
            
            // حساب نسبة الاستهلاك من الميزانية
            const budgetUsage = ad.budget > 0 ? (ad.spent / ad.budget * 100).toFixed(2) : 0;

            const stats = {
                ad_id: adId,
                impressions: ad.impressions_count || 0,
                clicks: ad.clicks_count || 0,
                ctr: parseFloat(ctr),
                budget: ad.budget || 0,
                spent: ad.spent || 0,
                budget_usage: parseFloat(budgetUsage),
                remaining_budget: (ad.budget || 0) - (ad.spent || 0)
            };

            console.log(`✅ تم تحديث إحصائيات الإعلان:`, stats);
            return stats;

        } catch (error) {
            console.error('❌ خطأ في تحديث إحصائيات الإعلان:', error);
            return null;
        }
    }

    /**
     * بدء فحص الإعلانات المنتهية تلقائياً
     */
    startExpiredAdsCleanup() {

        
        // فحص فوري عند بدء الخدمة
        this.cleanupExpiredAds();
        
        // فحص كل ساعة
        setInterval(() => {
            this.cleanupExpiredAds();
        }, 60 * 60 * 1000); // كل ساعة
        

    }

    /**
     * فحص وحذف الإعلانات المنتهية
     */
    async cleanupExpiredAds() {
        try {
    
            
            const now = new Date().toISOString();
            
            // جلب الإعلانات المنتهية
            const { data: expiredAds, error } = await this.supabase
                .from('advertisements')
                .select('id, title, end_date')
                .not('end_date', 'is', null)
                .lt('end_date', now)
                .eq('is_active', true);

            if (error) {
                console.error('❌ خطأ في جلب الإعلانات المنتهية:', error);
                return;
            }

            if (!expiredAds || expiredAds.length === 0) {
    
                return;
            }

            console.log(`⚠️ تم العثور على ${expiredAds.length} إعلان منتهي:`, expiredAds);

            // حذف الإعلانات المنتهية
            for (const ad of expiredAds) {
                await this.deleteExpiredAdvertisement(ad.id);
            }

            console.log(`✅ تم حذف ${expiredAds.length} إعلان منتهي بنجاح`);

        } catch (error) {
            console.error('❌ خطأ في فحص الإعلانات المنتهية:', error);
        }
    }

    /**
     * حذف إعلان منتهي
     */
    async deleteExpiredAdvertisement(adId) {
        try {
            console.log(`🗑️ حذف الإعلان المنتهي: ${adId}`);
            
            // حذف الإعلان من قاعدة البيانات
            const { error } = await this.supabase
                .from('advertisements')
                .delete()
                .eq('id', adId);

            if (error) {
                console.error(`❌ خطأ في حذف الإعلان ${adId}:`, error);
                return false;
            }

            console.log(`✅ تم حذف الإعلان المنتهي ${adId} بنجاح`);
            return true;

        } catch (error) {
            console.error(`❌ خطأ في حذف الإعلان المنتهي ${adId}:`, error);
            return false;
        }
    }

    /**
     * فحص الإعلانات التي ستنتهي قريباً (خلال 24 ساعة)
     */
    async checkAdsExpiringSoon() {
        try {
            console.log('⚠️ فحص الإعلانات التي ستنتهي قريباً...');
            
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const { data: expiringSoon, error } = await this.supabase
                .from('advertisements')
                .select('id, title, end_date')
                .not('end_date', 'is', null)
                .gte('end_date', now.toISOString())
                .lte('end_date', tomorrow.toISOString())
                .eq('is_active', true);

            if (error) {
                console.error('❌ خطأ في فحص الإعلانات التي ستنتهي قريباً:', error);
                return [];
            }

            if (expiringSoon && expiringSoon.length > 0) {
                console.log(`⚠️ ${expiringSoon.length} إعلان سينتهي خلال 24 ساعة:`, expiringSoon);
            }

            return expiringSoon || [];

        } catch (error) {
            console.error('❌ خطأ في فحص الإعلانات التي ستنتهي قريباً:', error);
            return [];
        }
    }

    /**
     * جلب إعلانات أقسام التصنيفات للصفحة الرئيسية
     */
    async getCategorySectionAdvertisements(category, limit = 4) {
        try {
            console.log(`🔍 جلب إعلانات أقسام التصنيفات للتصنيف: ${category}`);
            
            // جلب الإعلانات النشطة من نوع category_sections
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('ad_type', 'category_sections')
                .eq('position', 'homepage_featured')
                .eq('category_section', category + '_homepage')  // البحث في category_section بدلاً من product_category
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            
            // console.log(`✅ تم جلب ${data?.length || 0} إعلان لأقسام التصنيفات للتصنيف ${category}`);
            
            // تحويل الإعلانات إلى تنسيق المنتجات
            const categoryProducts = [];
            
            for (const ad of data || []) {
                try {
                    let productData = null;
                    
                    // إذا كان الإعلان مرتبط بمنتج حقيقي
                    if (ad.product_id && ad.product_category) {
                        // تحديد اسم الجدول
                        let tableName = 'products_other';
                        switch (ad.product_category) {
                            case 'cake':
                                tableName = 'products_cake';
                                break;
                            case 'koshat':
                                tableName = 'products_koshat';
                                break;
                            case 'mirr':
                                tableName = 'products_mirr';
                                break;
                            case 'other':
                                tableName = 'products_other';
                                break;
                            case 'invitations':
                                tableName = 'products_invitations';
                                break;
                            case 'flowerbouquets':
                                tableName = 'products_flowerbouquets';
                                break;
                        }
                        
                        // جلب بيانات المنتج الحقيقي
                        const { data: product, error: productError } = await this.supabase
                            .from(tableName)
                            .select('*')
                            .eq('id', ad.product_id)
                            .single();
                        
                        if (!productError && product) {
                            productData = product;
                        } else {
                            console.warn(`⚠️ لم يتم العثور على المنتج ${ad.product_id} في ${tableName}:`, productError);
                        }
                    }
                    
                    // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id,
                        
                        // بيانات المنتج الحقيقي (إذا وجد)
                        name: productData?.description || ad.title || 'منتج مميز',
                        title: productData?.description || ad.title || 'منتج مميز',
                        description: productData?.description || ad.description || 'وصف المنتج',
                        price: productData?.price || 0,
                        image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                        image_url: productData?.image_urls?.[0] || ad.image_url,
                        
                        // بيانات إضافية من المنتج
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
                        
                        // معرفات الربط
                        product_id: ad.product_id,
                        product_category: ad.product_category
                    };
                    categoryProducts.push(product);
                    
                } catch (productError) {
                    console.error(`❌ خطأ في معالجة إعلان أقسام التصنيفات ${ad.id}:`, productError);
                }
            }
            
            // console.log(`✅ تم تحويل ${categoryProducts.length} إعلان إلى منتجات لأقسام التصنيفات`);
            return categoryProducts;
            
        } catch (error) {
            console.error('❌ خطأ في جلب إعلانات أقسام التصنيفات:', error);
            return [];
        }
    }

    /**
     * جلب المنتجات حسب التصنيف (للأقسام المختلفة)
     * هذه الدالة مطلوبة لعرض الإعلانات في أقسام التصنيفات
     */
    async getProductsByCategory(categoryType, limit = 9) {
        try {
            // تحويل اسم التصنيف إلى القيمة المستخدمة في قاعدة البيانات
            let dbCategory = categoryType;
            switch (categoryType) {
                case 'mirror':
                    dbCategory = 'mirr';
                    break;
                case 'koshat':
                case 'cake':
                case 'other':
                case 'invitations':
                case 'flowerbouquets':
                    dbCategory = categoryType;
                    break;
                default:
                    dbCategory = categoryType;
            }
            
            // جلب إعلانات أقسام التصنيفات فقط للتصنيف المحدد
            const { data: ads, error: adsError } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .eq('ad_type', 'category_sections')
                .eq('category_section', dbCategory)
                .eq('product_category', dbCategory)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (adsError) {
                console.error(`❌ خطأ في جلب الإعلانات للتصنيف ${dbCategory}:`, adsError);
                throw adsError;
            }
            

            
            // تحويل الإعلانات إلى منتجات
            const categoryProducts = [];
            
            for (const ad of ads || []) {
                try {
                    let productData = null;
                    
                    // إذا كان الإعلان مرتبط بمنتج حقيقي
                    if (ad.product_id && ad.product_category) {
                        // تحديد اسم الجدول
                        let tableName = 'products_other';
                        switch (ad.product_category) {
                            case 'cake':
                                tableName = 'products_cake';
                                break;
                            case 'koshat':
                                tableName = 'products_koshat';
                                break;
                            case 'mirr':
                                tableName = 'products_mirr';
                                break;
                            case 'other':
                                tableName = 'products_other';
                                break;
                            case 'invitations':
                                tableName = 'products_invitations';
                                break;
                            case 'flowerbouquets':
                                tableName = 'products_flowerbouquets';
                                break;
                        }
                        
                        // جلب بيانات المنتج الحقيقي
                        const { data: product, error: productError } = await this.supabase
                            .from(tableName)
                            .select('*')
                            .eq('id', ad.product_id)
                            .single();
                        
                        if (!productError && product) {
                            productData = product;
                        } else {
                            console.warn(`⚠️ لم يتم العثور على المنتج ${ad.product_id} في ${tableName}:`, productError);
                        }
                    }
                    
                    // إنشاء كائن المنتج مع دمج بيانات الإعلان والمنتج
                    const product = {
                        id: ad.id,
                        ad_id: ad.id,
                        
                        // بيانات المنتج الحقيقي (إذا وجد)
                        name: productData?.description || ad.title || 'منتج مميز',
                        title: productData?.description || ad.title || 'منتج مميز',
                        description: productData?.description || ad.description || 'وصف المنتج',
                        price: productData?.price || 0,
                        image_urls: productData?.image_urls || (ad.image_url ? [ad.image_url] : []),
                        image_url: productData?.image_urls?.[0] || ad.image_url,
                        
                        // بيانات إضافية من المنتج
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
                        
                        // معرفات الربط
                        product_id: ad.product_id,
                        product_category: ad.product_category
                    };
                    categoryProducts.push(product);
                    
                } catch (productError) {
                    console.error(`❌ خطأ في معالجة إعلان أقسام التصنيفات ${ad.id}:`, productError);
                }
            }
            
            // console.log(`✅ تم تحويل ${categoryProducts.length} إعلان إلى منتجات لأقسام التصنيفات`);
            return categoryProducts;
            
        } catch (error) {
            console.error('❌ خطأ في جلب إعلانات أقسام التصنيفات:', error);
            return [];
        }
    }
}

// إنشاء نسخة عامة من الخدمة
window.advertisingService = new AdvertisingService();

