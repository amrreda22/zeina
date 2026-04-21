/**
 * خدمة الإعلانات المبسطة - بدون نظام مستخدمين معقد
 * تناسب المستخدم الوحيد في النظام
 */

class SimpleAdvertisingService {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
    }

    /**
     * تهيئة الخدمة
     */
    async initialize() {
        try {
            // التحقق من وجود عميل Supabase
            if (!this.supabase) {
                console.error('عميل Supabase غير متوفر');
                return false;
            }

            console.log('تم تهيئة خدمة الإعلانات المبسطة بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في تهيئة خدمة الإعلانات:', error);
            return false;
        }
    }

    /**
     * جلب جميع الإعلانات النشطة
     */
    async getActiveAdvertisements() {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الإعلانات النشطة:', error);
            return [];
        }
    }

    /**
     * جلب جميع الإعلانات (للإدارة)
     */
    async getAllAdvertisements() {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب جميع الإعلانات:', error);
            return [];
        }
    }

    /**
     * إضافة إعلان جديد
     */
    async addAdvertisement(adData) {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .insert([{
                    ad_type: adData.ad_type,
                    position: adData.position,
                    title: adData.title,
                    description: adData.description,
                    image_url: adData.image_url,
                    link_url: adData.link_url,
                    is_active: adData.is_active !== undefined ? adData.is_active : true,
                    priority: adData.priority || 1,
                    start_date: adData.start_date || new Date().toISOString(),
                    end_date: adData.end_date
                }])
                .select()
                .single();

            if (error) throw error;
            
            return {
                success: true,
                data: data,
                message: 'تم إضافة الإعلان بنجاح'
            };
        } catch (error) {
            console.error('خطأ في إضافة الإعلان:', error);
            return {
                success: false,
                error: error.message || 'حدث خطأ في إضافة الإعلان'
            };
        }
    }

    /**
     * تحديث إعلان موجود
     */
    async updateAdvertisement(adId, adData) {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .update({
                    ad_type: adData.ad_type,
                    position: adData.position,
                    title: adData.title,
                    description: adData.description,
                    image_url: adData.image_url,
                    link_url: adData.link_url,
                    is_active: adData.is_active,
                    priority: adData.priority,
                    start_date: adData.start_date,
                    end_date: adData.end_date,
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
     * تحديث حالة الإعلان (تفعيل/إيقاف)
     */
    async updateAdvertisementStatus(adId, status) {
        try {
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
     * جلب إعلان بواسطة المعرف
     */
    async getAdvertisementById(adId) {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('id', adId)
                .single();

            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('خطأ في جلب الإعلان:', error);
            return null;
        }
    }

    /**
     * جلب الإعلانات حسب النوع
     */
    async getAdvertisementsByType(adType) {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('ad_type', adType)
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الإعلانات حسب النوع:', error);
            return [];
        }
    }

    /**
     * جلب الإعلانات حسب الموقع
     */
    async getAdvertisementsByPosition(position) {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('position', position)
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الإعلانات حسب الموقع:', error);
            return [];
        }
    }
}

// تصدير الخدمة للاستخدام العام
window.SimpleAdvertisingService = SimpleAdvertisingService;
