/* events module for cake */

async function initializeSmartAdvertising() {
            try {
                // انتظار تحميل Supabase
                if (!window.supabaseClient) {
                    await new Promise((resolve) => {
                        const checkInterval = setInterval(() => {
                            if (window.supabaseClient) {
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
                
                // إنشاء خدمة الإعلانات الذكية
                window.smartCategoryAdvertising = new SmartCategoryAdvertisingService();
                await window.smartCategoryAdvertising.initialize();
                
                // تحميل قسم التصنيف مع الإعلانات
                await loadCategorySectionWithAds();
                
            } catch (error) {
                console.error('❌ خطأ في تهيئة خدمة الإعلانات الذكية:', error);
            }
        }

        // تحميل قسم التصنيف مع الإعلانات

