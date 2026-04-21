/* data module for invitations */

async function loadCategoryFeaturedAds() {
            try {
                if (!window.advertisingService) {
                    setTimeout(loadCategoryFeaturedAds, 1000);
                    return;
                }

                const featuredAds = await window.advertisingService.getCategoryFeaturedProducts('invitations', 4);
                
                displayCategoryFeaturedAds(featuredAds);
                
                // تسجيل ظهور الإعلانات
                featuredAds.forEach(ad => {
                    if (ad.ad_id && window.advertisingService) {
                        window.advertisingService.recordImpression(ad.ad_id);
                    }
                });
                
            } catch (error) {
                showNoFeaturedAds();
            }
        }

        // عرض الإعلانات المميزة في التصنيف

