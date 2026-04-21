            // Global variables
            let allProducts = [];
            let currentFilter = 'all';
            
            // UI Helper for managing navigation and UI updates
            const UIHelper = {
                // Update navigation based on user authentication and admin status
                async updateNavigation() {
                    try {
                        // Wait for AuthService to be available
                        if (!window.AuthService) {
                            await new Promise((resolve) => {
                                const checkInterval = setInterval(() => {
                                    if (window.AuthService) {
                                        clearInterval(checkInterval);
                                        resolve();
                                    }
                                }, 100);
                                
                                setTimeout(() => {
                                    clearInterval(checkInterval);
                                    console.error('❌ AuthService not loaded after 5 seconds');
                                    resolve();
                                }, 5000);
                            });
                        }
                        
                        if (!window.AuthService) {
                            console.error('❌ AuthService not available');
                            return;
                        }
                        
                        const isLoggedIn = await window.AuthService.isLoggedIn();
                        const user = await window.AuthService.getCurrentUser();
                        
                        // Check if user is admin
                        let isAdmin = false;
                        if (isLoggedIn && user) {
                            try {
                                // Check user role from database
                                const { data: userProfile, error } = await window.supabaseClient
                                    .from('users')
                                    .select('role')
                                    .eq('id', user.id)
                                    .single();
                                
                                if (!error && userProfile) {
                                    isAdmin = userProfile.role === 'admin';
                                }
                            } catch (error) {
                                console.error('Error checking admin status:', error);
                            }
                        }
                        
                        // Update desktop navigation - Show admin dashboard button in header
                        const adminDashboardBtnDesktop = document.getElementById('admin-dashboard-btn-desktop');
                        if (adminDashboardBtnDesktop) {
                            if (isAdmin) {
                                adminDashboardBtnDesktop.classList.remove('hidden');

                            } else {
                                adminDashboardBtnDesktop.classList.add('hidden');
                            }
                        }
                        
                        // Update mobile navigation - Show admin dashboard button in header
                        const adminDashboardBtnMobile = document.getElementById('admin-dashboard-btn-mobile');
                        if (adminDashboardBtnMobile) {
                            if (isAdmin) {
                                adminDashboardBtnMobile.classList.remove('hidden');

                            } else {
                                adminDashboardBtnMobile.classList.add('hidden');
                            }
                        }
                        
                        // Update mobile menu - Show admin section
                        const adminMenuMobile = document.getElementById('admin-menu-mobile');
                        if (adminMenuMobile) {
                            if (isAdmin) {
                                adminMenuMobile.classList.remove('hidden');

                            } else {
                                adminMenuMobile.classList.add('hidden');
                            }
                        }
                        
                        // Mobile navigation is now handled by the buttons in header
                        

                    } catch (error) {
                        console.error('❌ Error updating navigation:', error);
                    }
                },
                
                // Show success message
                showSuccess(message) {
                    
                    // Create success notification
                    const successDiv = document.createElement('div');
                    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                    successDiv.innerHTML = `
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            ${message}
                        </div>
                    `;
                    document.body.appendChild(successDiv);
                    
                    // Remove after 3 seconds
                    setTimeout(() => {
                        successDiv.remove();
                    }, 3000);
                }
            };
            

        

            
            // Confirm sign out function
            function confirmSignOut() {
                document.getElementById('signout-confirm-modal').classList.add('active');
            }
            
            // Close sign out confirmation modal
            function closeSignOutModal() {
                document.getElementById('signout-confirm-modal').classList.remove('active');
            }
            
            // Proceed with sign out
            async function proceedSignOut() {
                closeSignOutModal();
                await handleSignOut();
            }
            
            // Show success modal and redirect
            function showSignOutSuccess() {
                document.getElementById('signout-success-modal').classList.add('active');
            }
            
            // Redirect to home page
            function redirectToHome() {
                window.location.href = 'index.html';
            }
            
            // Global sign out function
            async function handleSignOut() {
                try {
                    // Wait for AuthService to be available
                    if (!window.AuthService) {
                        console.error('❌ AuthService not available');
                        alert('خطأ في تحميل خدمة المصادقة');
                        return;
                    }
                    
                    const result = await window.AuthService.signOut();
                    if (result.success) {
                        showSignOutSuccess();
                        // Redirect after 2 seconds
                        setTimeout(() => {
                            redirectToHome();
                        }, 2000);
                    } else {
                        alert('حدث خطأ أثناء تسجيل الخروج: ' + (result.error || 'خطأ غير معروف'));
                    }
                } catch (error) {
                    console.error('Sign out error:', error);
                    alert('حدث خطأ أثناء تسجيل الخروج: ' + error.message);
                }
            }
            
        // Update favorites count badge
        function updateFavoritesCountBadge() {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const count = favorites.length;
            

            
            // Update all badges
            const badges = [
                'favorites-count-badge',
                'favorites-count-badge-mobile',
                'favorites-count-badge-auth',
                'favorites-count-badge-mobile-auth',
                'favorites-count-badge-desktop'
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

        // Update auth buttons (mobile and desktop)
        async function updateMobileAuthButtons() {
                // Wait for AuthService to be available
                if (!window.AuthService) {
                    await new Promise((resolve) => {
                        const checkInterval = setInterval(() => {
                            if (window.AuthService) {
                                clearInterval(checkInterval);
                                resolve();
                            }
                        }, 100);
                        
                        setTimeout(() => {
                            clearInterval(checkInterval);
                            console.error('❌ AuthService not loaded after 5 seconds');
                            resolve();
                        }, 5000);
                    });
                }
                
                if (!window.AuthService) {
                    console.error('❌ AuthService not available');
                    return;
                }
                
                const isLoggedIn = await window.AuthService.isLoggedIn();
                const user = await window.AuthService.getCurrentUser();
                const mobileAuthButtons = document.querySelector('.auth-buttons-mobile');
                const desktopAuthButtons = document.querySelector('.auth-buttons');
                
                
                // Update mobile auth buttons
                if (mobileAuthButtons) {
                    if (isLoggedIn) {
                        mobileAuthButtons.innerHTML = `
                            <span class="block py-2 text-gray-700">مرحباً، ${user?.user_metadata?.full_name || user?.email}</span>
                            <button onclick="confirmSignOut()" class="block py-2 text-red-600 font-medium">تسجيل الخروج</button>
                        `;
            
                    } else {
                        mobileAuthButtons.innerHTML = `
                            <!-- تم إزالة المفضلة لأنها موجودة في الهيدر -->
                        `;
            
                    }
                }
                
                // Update desktop auth buttons
                if (desktopAuthButtons) {
                    if (isLoggedIn) {
                        desktopAuthButtons.innerHTML = `
                            <span class="text-gray-700 mr-2">مرحباً، ${user?.user_metadata?.full_name || user?.email}</span>
                            <button onclick="confirmSignOut()" class="px-6 py-2 text-red-600 border-2 border-red-600 rounded-full font-medium hover:bg-red-600 hover:text-white transition-all">
                                تسجيل الخروج
                            </button>
                        `;
            
                    } else {
                        desktopAuthButtons.innerHTML = `
                            <!-- تم إزالة زر تسجيل الدخول -->
                        `;
            
                    }
                }
                
                // Update navigation (including admin button)
                await UIHelper.updateNavigation();
                
                // Update favorites count badge
                updateFavoritesCountBadge();
            }
            
            // دالة لتحديث الشبكة حسب حجم الشاشة
            function updateGridLayout() {
                const featuredGrid = document.getElementById('featured-products-grid');
                const recommendedGrid = document.getElementById('recommended-products-grid');
                
                if (featuredGrid && featuredGrid.style.display === 'grid') {
                    updateGridColumns(featuredGrid);
                }
                if (recommendedGrid && recommendedGrid.style.display === 'grid') {
                    updateGridColumns(recommendedGrid);
                }
            }
            
            // دالة لتحديث عدد الأعمدة في الشبكة - دائماً 3 أعمدة
            function updateGridColumns(container) {
                container.classList.remove('grid-cols-1', 'grid-cols-2', 'grid-cols-3');
                container.classList.add('grid-cols-3');
            }
            
            // مراقبة تغيير حجم الشاشة
            window.addEventListener('resize', updateGridLayout);
            
            // Load and display products
            async function loadProducts() {
                try {
                    
                    // العناصر المطلوبة
                    const featuredLoading = document.getElementById('products-loading');
                    const featuredGrid = document.getElementById('featured-products-grid');
                    const featuredNoProducts = document.getElementById('no-products-message');
                    
                    // إظهار مؤشر التحميل
                    if (featuredLoading) featuredLoading.style.display = 'block';
                    
                    // إخفاء الشبكة
                    if (featuredGrid) featuredGrid.style.display = 'none';
                    
                    // إخفاء رسالة عدم وجود منتجات
                    if (featuredNoProducts) featuredNoProducts.style.display = 'none';
                    
                    // التحقق من خدمة الإعلانات
                    if (!window.advertisingService) {
                        console.error('❌ AdvertisingService not available!');
                        throw new Error('AdvertisingService not available');
                    }
                    
                    // جلب المنتجات المميزة
                    const featuredAds = await window.advertisingService.getFeaturedProducts(9); // 3x3 grid
                    
                    // إخفاء مؤشر التحميل
                    if (featuredLoading) featuredLoading.style.display = 'none';
                    
                    // عرض المنتجات المميزة
                    if (featuredAds && featuredAds.length > 0) {
                        displayCategoryProducts(document.getElementById('featured-products-grid'), featuredAds, 'featured');
                        
                        // تسجيل ظهور الإعلانات
                        featuredAds.forEach(product => {
                            if (product.ad_id) {
                                window.advertisingService.recordImpression(product.ad_id);
                            }
                        });
                    } else {
                        if (featuredNoProducts) featuredNoProducts.style.display = 'block';
                    }

                    
                } catch (error) {
                    console.error('❌ خطأ في تحميل المنتجات:', error);
                    
                    // إخفاء مؤشر التحميل
                    if (featuredLoading) featuredLoading.style.display = 'none';
                    
                    // إظهار رسالة الخطأ
                    if (featuredNoProducts) {
                        featuredNoProducts.querySelector('h3').textContent = 'خطأ في تحميل المنتجات';
                        featuredNoProducts.querySelector('p').textContent = 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.';
                        featuredNoProducts.style.display = 'block';
                    }
                }
            }
            
            // خلط المنتجات عشوائياً (جميع المنتجات من جميع الفئات)
            function shuffleProducts() {
                if (allProducts && allProducts.length > 1) {
                    // خلط جميع المنتجات عشوائياً
                    const shuffled = [...allProducts];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    allProducts = shuffled;
                }
            }








            


            // Display products in grid
            function displayProducts(products, containerId) {
                
                const container = document.getElementById(containerId);
                let noProductsMessage;
                
                // البحث عن رسالة عدم وجود منتجات حسب نوع الحاوية
                if (containerId === 'recommended-products-grid') {
                    noProductsMessage = document.getElementById('recommended-no-products');
                } else if (containerId === 'koshat-products-grid') {
                    noProductsMessage = document.getElementById('koshat-no-products');
                } else if (containerId === 'cake-products-grid') {
                    noProductsMessage = document.getElementById('cake-no-products');
                } else if (containerId === 'mirror-products-grid') {
                    noProductsMessage = document.getElementById('mirror-no-products');
                } else if (containerId === 'other-products-grid') {
                    noProductsMessage = document.getElementById('other-no-products');
                } else if (containerId === 'invitations-products-grid') {
                    noProductsMessage = document.getElementById('invitations-no-products');
                } else {
                    noProductsMessage = document.getElementById('no-products-message');
                }
                
                if (!container) {
                    console.error('❌ لم يتم العثور على الحاوية:', containerId);
                    return;
                }
                
                if (!products || products.length === 0) {
                    container.style.display = 'none';
                    if (noProductsMessage) {
                        noProductsMessage.style.display = 'block';
                    }
                    return;
                }
                
                // استخدم نفس تصميم بطاقات صفحة الكوشات لجميع الأقسام
                container.style.display = 'grid';
                if (noProductsMessage) {
                    noProductsMessage.style.display = 'none';
                }
                const sectionType = containerId === 'featured-products-grid' ? 'featured'
                    : containerId === 'recommended-products-grid' ? 'recommended'
                    : containerId.includes('koshat') ? 'koshat'
                    : containerId.includes('cake') ? 'cake'
                    : containerId.includes('mirror') ? 'mirr'
                    : containerId.includes('other') ? 'other'
                    : containerId.includes('invitations') ? 'invitations'
                    : 'featured';
                displayCategoryProducts(container, products, sectionType);
                return;
            }

            /**
             * تحميل المنتجات والإعلانات لكل قسم من أقسام التصنيفات
             * باستخدام خدمة الإعلانات الذكية
             */
            async function loadCategorySectionProducts() {
                try {
                    // التحقق من خدمة الإعلانات الذكية
                    if (!window.smartCategoryAdvertisingService) {
                        console.error('❌ خدمة الإعلانات الذكية غير متوفرة');
                        return;
                    }

                    // تهيئة الخدمة
                    await window.smartCategoryAdvertisingService.initialize();

                    // التصنيفات المتوفرة
                    const categories = [
                        { id: 'koshat', name: 'كوشات', loadingId: 'koshat-loading', gridId: 'koshat-products-grid', noProductsId: 'koshat-no-products' },
                        { id: 'cake', name: 'تورتات', loadingId: 'cake-loading', gridId: 'cake-products-grid', noProductsId: 'cake-no-products' },
                        { id: 'mirr', name: 'مرايا', loadingId: 'mirror-loading', gridId: 'mirror-products-grid', noProductsId: 'mirror-no-products' },
                        { id: 'other', name: 'ديكورات', loadingId: 'other-loading', gridId: 'other-products-grid', noProductsId: 'other-no-products' },
                        { id: 'invitations', name: 'دعوات', loadingId: 'invitations-loading', gridId: 'invitations-products-grid', noProductsId: 'invitations-no-products' },
                        { id: 'flowerbouquets', name: 'بوكيهات ورد', loadingId: 'flowerbouquets-loading', gridId: 'flowerbouquets-products-grid', noProductsId: 'flowerbouquets-no-products' }
                    ];

                    // تحميل المنتجات والإعلانات لكل تصنيف باستخدام الخدمة الذكية
                    for (const category of categories) {
                        try {
                            // استخدام الخدمة الذكية لتحميل القسم
                            await window.smartCategoryAdvertisingService.loadCategorySection(
                                category.id, 
                                category.gridId
                            );
                            
                            // الحصول على إحصائيات القسم
                            const stats = window.smartCategoryAdvertisingService.getCategorySectionStats(category.id);
                            
                        } catch (error) {
                            console.error(`❌ خطأ في تحميل ${category.name}:`, error);
                            
                            // إظهار رسالة الخطأ
                            const noProductsElement = document.getElementById(category.noProductsId);
                            if (noProductsElement) {
                                noProductsElement.querySelector('h3').textContent = 'خطأ في تحميل المنتجات';
                                noProductsElement.querySelector('p').textContent = 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.';
                                noProductsElement.style.display = 'block';
                            }
                        }
                    }
                    
                } catch (error) {
                    console.error('❌ خطأ في تحميل أقسام التصنيفات:', error);
                }
            }

            /**
             * الحصول على اسم التصنيف بالعربية
             */
            function getCategoryName(category) {
                const categoryNames = {
                    'koshat': 'كوشات',
                    'cake': 'تورتات وشكولاتات',
                    'mirr': 'مرايا',
                    'other': 'ديكورات متنوعة',
                    'invitations': 'دعوات وتوزيعات',
                    'flowerbouquets': 'بوكيهات ورد'
                };
                return categoryNames[category] || category;
            }

        // ===== وظائف إدارة المفضلة =====
        

        

        

        









        
        // Get category name in Arabic
        function getCategoryName(category) {
                const categories = {
                    'koshat': 'كوشات',
                    'mirr': 'مرايا',
                    'cake': 'تورتات',
                    'other': 'ديكورات متنوعة',
                    'invitations': 'دعوات وتوزيعات',
                    'flowerbouquets': 'بوكيهات ورد'
                };
                return categories[category] || category;
            }
            
            
            // Format date
            function formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('ar-EG');
            }
            
            // Open product details page
            function openProductDetails(productId, adId = null) {
                // تسجيل النقر على الإعلان إذا كان موجوداً
                if (adId && window.advertisingService) {
                    try {
                        window.advertisingService.recordClick(adId);
                    } catch (error) {
                        console.error('❌ خطأ في تسجيل النقر:', error);
                    }
                } else {
                    // محاولة العثور على معرف الإعلان من العنصر
                    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
                    if (productElement) {
                        const elementAdId = productElement.getAttribute('data-ad-id');
                        if (elementAdId && window.advertisingService) {
                            try {
                                window.advertisingService.recordClick(elementAdId);
                            } catch (error) {
                                console.error('❌ خطأ في تسجيل النقر:', error);
                            }
                        }
                    }
                }
                
                // الانتقال إلى صفحة تفاصيل المنتج
                window.location.href = `pages/products/product-details.html?id=${productId}`;
            }

            // Filter products by category
            function filterProducts(category) {
                if (category === 'all') {
                    return allProducts;
                }
                
                // Map Arabic category names to database values
                const categoryMap = {
                    'koshat': 'koshat',
                    'cake': 'cake',
                    'decor': 'mirr', // Assuming 'decor' maps to 'mirr' (mirrors)
                    'other': 'other'
                };
                
                const dbCategory = categoryMap[category];
                return allProducts.filter(product => product.category === dbCategory);
            }

            // Apply filter and update display
            function applyFilter(category) {
                currentFilter = category;
                
                // Filter and display products
                const filteredProducts = filterProducts(category);
                
                displayProducts(filteredProducts, 'featured-products-grid');
            }
            
            // Make loadProducts available globally
            window.loadProducts = loadProducts;



            // تحميل المنتجات عند تحميل الصفحة
            document.addEventListener('DOMContentLoaded', function() {
                // انتظار تحميل خدمة الإعلانات ثم تحميل المنتجات
                waitForAdvertisingService();
                

            });
            
            // انتظار تحميل خدمة الإعلانات
            async function waitForAdvertisingService() {
                try {
                    // انتظار خدمة الإعلانات
                    while (!window.advertisingService) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    // تحميل المنتجات المميزة (الإعلانات)
                    await loadProducts();
                    
                } catch (error) {
                    console.error('❌ Error waiting for AdvertisingService:', error);
                }
            }
            
            // إضافة زر اختبار للإعلانات
            function addTestButton() {
                const container = document.querySelector('.container');
                if (container) {
                    const testButton = document.createElement('button');
                    testButton.innerHTML = '🧪 اختبار الإعلانات';
                    testButton.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    testButton.onclick = async function() {
                        try {
                            if (window.advertisingService) {
                                const result = await window.advertisingService.debugGetAllAdvertisements();
                                if (result) {
                                    alert(`نتائج اختبار الإعلانات:\n\n📊 جميع الإعلانات: ${result.all?.length || 0}\n✅ الإعلانات النشطة: ${result.active?.length || 0}\n📅 الإعلانات بمواعيد صحيحة: ${result.validDates?.length || 0}`);
                                }
                            } else {
                                alert('خدمة الإعلانات غير متوفرة');
                            }
                        } catch (error) {
                            alert('خطأ في اختبار الإعلانات: ' + error.message);
                        }
                    };
                    document.body.appendChild(testButton);
                    
                    // إضافة زر إعادة تحميل المنتجات
                    const reloadButton = document.createElement('button');
                    reloadButton.innerHTML = '🔄 إعادة تحميل';
                    reloadButton.className = 'fixed bottom-4 right-32 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    reloadButton.onclick = async function() {
                        try {

                            await loadProducts();
                        } catch (error) {
                            console.error('❌ Error in manual reload:', error);
                            alert('خطأ في إعادة التحميل: ' + error.message);
                        }
                    };
                    document.body.appendChild(reloadButton);

                    // إضافة زر تنظيف فوري
                    const cleanupButton = document.createElement('button');
                    cleanupButton.innerHTML = '🧹 تنظيف فوري';
                    cleanupButton.className = 'fixed bottom-4 right-60 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    cleanupButton.onclick = async function() {
                        try {
                            if (window.advertisingService) {

                                await window.advertisingService.autoCleanup();
                                alert('تم التنظيف! سيتم تحديث الصفحة تلقائياً');
                                setTimeout(() => location.reload(), 2000);
                            } else {
                                alert('خدمة الإعلانات غير متوفرة');
                            }
                        } catch (error) {
                            console.error('❌ خطأ في التنظيف:', error);
                            alert('خطأ في التنظيف: ' + error.message);
                        }
                    };
                    document.body.appendChild(cleanupButton);
                }
            }
        
        // Hero Carousel JavaScript
        class HeroCarousel {
            constructor() {
                this.currentSlide = 0;
                this.slides = [
                    {
                        title: 'مرحبًا بك في زينة',
                        description: 'موقعك الأول لاختيار كل ما يخص المناسبات والأفراح. كوشات، تورتات، شوكولاتة، دعوات وديكورات.. كل ما تحتاجه لتجعل يومك مميزًا في مكان واحد.',
                        buttonText: 'ابدأ رحلتك',
                        buttonLink: '#featured-products'
                    },
                    {
                        title: 'تنوع يلبي كل الأذواق',
                        description: 'من الكوشات الفخمة إلى المرايا والدعوات الأنيقة، نوفر لك خيارات واسعة تناسب جميع الأذواق والمناسبات.',
                        buttonText: 'تصفح التصنيفات',
                        buttonLink: '#categories'
                    },
                    {
                        title: 'لأن لحظاتك تستحق الأفضل',
                        description: 'في زينة نهتم بالجودة والتفاصيل، لتجد منتجات تعكس شخصيتك وتترك أثرًا لا يُنسى في مناسبتك الخاصة.',
                        buttonText: 'اكتشف المنتجات',
                        buttonLink: '#featured-products'
                    },
                    {
                        title: 'زينة.. لمناسبات تبقى في الذاكرة',
                        description: 'ابدأ رحلتك الآن مع زينة، واختر من بين أجمل المنتجات لتصنع لحظاتك المميزة.',
                        buttonText: 'ابدأ الآن',
                        buttonLink: '#featured-products'
                    }
                ];
                
                this.carousel = document.getElementById('hero-carousel');
                this.indicatorsContainer = document.getElementById('carousel-indicators');
                
                this.init();
            }
            
            init() {
                this.createIndicators();
                this.showSlide(0);
                this.setupEventListeners();
                this.startAutoPlay();
            }
            
            createIndicators() {
                this.indicatorsContainer.innerHTML = '';
                this.slides.forEach((_, index) => {
                    const indicator = document.createElement('button');
                    indicator.className = 'carousel-indicator';
                    indicator.addEventListener('click', () => this.showSlide(index));
                    this.indicatorsContainer.appendChild(indicator);
                });
            }
            
            showSlide(index) {
                this.currentSlide = index;
                const slide = this.slides[index];
                
                // Update indicators
                const indicators = this.indicatorsContainer.querySelectorAll('.carousel-indicator');
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === index);
                });
                
                // Update content
                this.carousel.innerHTML = `
                    <div class="flex items-center justify-center h-full">
                        <!-- Content -->
                        <div class="text-center text-gray-800 px-8 max-w-4xl">
                            <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-lg leading-tight">${slide.title}</h1>
                            <p class="text-lg md:text-xl lg:text-2xl text-shadow max-w-3xl mx-auto leading-relaxed opacity-90">${slide.description}</p>
                        </div>
                    </div>
                `;
            }
            
            nextSlide() {
                const nextIndex = (this.currentSlide + 1) % this.slides.length;
                this.showSlide(nextIndex);
            }
            
            prevSlide() {
                const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
                this.showSlide(prevIndex);
            }
            
            setupEventListeners() {
                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') {
                        this.prevSlide();
                    } else if (e.key === 'ArrowRight') {
                        this.nextSlide();
                    }
                });
            }
            
            startAutoPlay() {
                setInterval(() => {
                    this.nextSlide();
                }, 4000); // Change slide every 4 seconds
            }
        }

        // منع التمرير التلقائي عند تحميل الصفحة
        if (window.location.hash) {
            // إزالة hash من URL بدون تمرير
            history.replaceState(null, null, window.location.pathname);
        }
        
        // Simple JavaScript for basic interactions
        document.addEventListener('DOMContentLoaded', async function() {
            // Add styles for governorate display
            GovernorateDisplay.addStyles();
            
            // Initialize hero carousel
            const heroCarousel = new HeroCarousel();
            window.heroCarousel = heroCarousel; // Make it globally accessible
            
            // Initialize smart category advertising service
            if (typeof SmartCategoryAdvertisingService !== 'undefined') {
                window.smartCategoryAdvertisingService = new SmartCategoryAdvertisingService();
            }
            
            // Update mobile auth buttons and navigation
            await updateMobileAuthButtons();
            
            // Load products immediately for better performance
            loadProducts().catch(error => {
                console.error('Error loading products:', error);
            });
            
            // Load category section products and advertisements
            loadCategorySectionProducts().catch(error => {
                console.error('Error loading category section products:', error);
            });
            
                    // ضمان ظهور الهيدر
        function ensureHeaderVisibility() {
            const header = document.querySelector('header');
            if (header) {
                header.style.display = 'block';
                header.style.visibility = 'visible';
                header.style.opacity = '1';
                header.style.position = 'sticky';
                header.style.top = '0';
                header.style.zIndex = '50';
                header.style.backgroundColor = 'white';

            }
        }
        
        // Mobile menu functionality
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // التأكد من ظهور الهيدر عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', ensureHeaderVisibility);
        window.addEventListener('load', ensureHeaderVisibility);
        // إعادة التأكد بعد فترة قصيرة
        setTimeout(ensureHeaderVisibility, 100);
        setTimeout(ensureHeaderVisibility, 500);
        setTimeout(ensureHeaderVisibility, 1000);
        
        // معالجة التغييرات في hash
        window.addEventListener('hashchange', function() {
            if (window.location.hash === '#product-request-section') {
                // عند تغيير hash، نتمرير إلى القسم
                setTimeout(() => {
                    const productRequestSection = document.getElementById('product-request-section');
                    if (productRequestSection) {
                        const header = document.querySelector('header.sticky');
                        const headerHeight = header ? header.offsetHeight : 0;
                        const sectionTop = productRequestSection.offsetTop;
                        const targetScrollPosition = sectionTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetScrollPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        });
            

            

            

            

            

            
            // Add search event listeners

            

            

            


            
            // Product card click handlers - Removed as cards now have onclick handlers
            

            

            
            // Make functions available globally
            window.handleSignOut = handleSignOut;
            window.confirmSignOut = confirmSignOut;
            window.closeSignOutModal = closeSignOutModal;
            window.proceedSignOut = proceedSignOut;
            window.showSignOutSuccess = showSignOutSuccess;
            window.redirectToHome = redirectToHome;
            
            // Close custom modals when clicking outside
            document.addEventListener('click', function(e) {
                const signoutConfirmModal = document.getElementById('signout-confirm-modal');
                const signoutSuccessModal = document.getElementById('signout-success-modal');
                
                if (signoutConfirmModal && e.target === signoutConfirmModal) {
                    closeSignOutModal();
                }
                
                if (signoutSuccessModal && e.target === signoutSuccessModal) {
                    redirectToHome();
                }
            });
            
            // Close modals with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeSignOutModal();
                }
            });
            
            // Listen for auth state changes
            if (window.AuthService) {
                window.AuthService.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_IN') {
                        await UIHelper.updateNavigation();
                        await updateMobileAuthButtons();
                        await loadProducts(); // Reload products to show user's products
                        UIHelper.showSuccess('تم تسجيل الدخول بنجاح!');
                    } else if (event === 'SIGNED_OUT') {
                        await UIHelper.updateNavigation();
                        await updateMobileAuthButtons();
                        await loadProducts(); // Reload products to hide user's products
                        UIHelper.showSuccess('تم تسجيل الخروج بنجاح!');
                    }
                });
            }
            
            // Update favorites count badge on page load
            updateFavoritesCountBadge();
            
            // Force update after a short delay to ensure DOM is ready
            setTimeout(() => {
                updateFavoritesCountBadge();

            }, 500);
            
            // تهيئة المفضلة بعد تحميل الصفحة
            setTimeout(() => {
                // تم إزالة دوال المفضلة والسلايدر

            }, 1000);
            
            // Listen for changes in localStorage (favorites)
            window.addEventListener('storage', function(e) {
                if (e.key === 'favorites') {
                    updateFavoritesCountBadge();
                }
            });
            
            // مستمع للحدث المخصص لضمان التزامن
            window.addEventListener('favoritesChanged', function(e) {

                updateFavoritesCountBadge();
            });

                    // إعداد أزرار "أضف منتجك" في الهيدر
        setupHeaderButtons();
        
        // إعداد نموذج طلب المنتج بعد تحميل الصفحة بالكامل
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupProductRequestForm);
        } else {
            // Page already loaded, wait a bit more for scripts
            setTimeout(setupProductRequestForm, 1000);
        }
        });
        
        // إعداد أزرار الهيدر
        function setupHeaderButtons() {
            
            // زر "أضف منتجك" في الهيدر - الآن يعمل كرابط عادي
            const addProductRequestBtn = document.getElementById('add-product-request-btn');
            if (addProductRequestBtn) {
                // إزالة preventDefault للسماح بالانتقال الطبيعي
                addProductRequestBtn.addEventListener('click', function(e) {
                    // السماح بالانتقال الطبيعي إلى الصفحة
                });
            } else {
                console.error('❌ Add product request button not found');
            }
            
            // أزرار "أضف منتجك" في القائمة المتحركة - الآن تعمل كروابط عادية
            const mobileAddProductRequestBtns = document.querySelectorAll('a[href="pages/products/add-product-request.html"]');
            mobileAddProductRequestBtns.forEach((btn, index) => {
                btn.addEventListener('click', function(e) {
                    // السماح بالانتقال الطبيعي إلى الصفحة
                });
            });
        }
        


        // إعداد نموذج طلب المنتج
        let citiesService;
        let selectedCities = new Set();
        let currentGovernorates = [];
        let uploadedImages = [];
        let draggedElement = null;
        let draggedIndex = null;

        function setupProductRequestForm() {
            
            // Wait for all required services to be available
            waitForServices().then(() => {
                // Initialize advanced governorate filter
                setupAdvancedGovernorateFilter();
                
                // Initialize cities filter
                initializeCitiesFilter();
                
                // Setup form event listeners
                setupFormEventListeners();
                
                // Setup image upload
                setupImageUpload();
                
                // Setup global error banner
                setupGlobalErrorBanner();
                

            }).catch(error => {
                console.error('❌ Failed to setup Product Request Form:', error);
            });
        }
        
        // Wait for all required services to be available
        function waitForServices() {
            return new Promise((resolve, reject) => {
                const maxAttempts = 50; // 5 seconds max
                let attempts = 0;
                
                const checkServices = () => {
                    attempts++;
                    
                    const services = {
                        'CitiesService': typeof CitiesService !== 'undefined',
                        'ProductRequestsService': typeof ProductRequestsService !== 'undefined',
                        'Supabase': typeof supabaseClient !== 'undefined'
                    };
                    
                    const allAvailable = Object.values(services).every(available => available);
                    
                    if (allAvailable) {
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.error('❌ Timeout waiting for services');
                        reject(new Error('Services timeout'));
                    } else {
                        setTimeout(checkServices, 100);
                    }
                };
                
                checkServices();
            });
        }
        
        // Setup form event listeners
        function setupFormEventListeners() {
            const form = document.getElementById('product-request-form');
            const categorySelect = document.getElementById('request-category');
            
            // Form submission
            form.addEventListener('submit', submitProductRequest);
            
            // Category change
            categorySelect.addEventListener('change', handleCategoryChange);
            
            // Setup validation event listeners
            setupValidationEventListeners();
        }
        
        // Setup validation event listeners
        function setupValidationEventListeners() {
            // Clear errors when user starts typing/selecting
            const descriptionField = document.getElementById('request-description');
            const categoryField = document.getElementById('request-category');
            const whatsappField = document.getElementById('request-whatsapp');
            const facebookField = document.getElementById('request-facebook');
            const instagramField = document.getElementById('request-instagram');
            
            descriptionField.addEventListener('input', () => clearFieldError('request-description'));
            categoryField.addEventListener('change', () => clearFieldError('request-category'));
            whatsappField.addEventListener('input', () => {
                clearFieldError('request-whatsapp');
                validateSocialMediaFields();
            });
            facebookField.addEventListener('input', () => {
                clearFieldError('request-facebook');
                validateSocialMediaFields();
            });
            instagramField.addEventListener('input', () => {
                clearFieldError('request-instagram');
                validateSocialMediaFields();
            });
            
            // Clear governorate error when selection changes
            const governorateCheckboxes = document.querySelectorAll('.governorate-checkbox');
            governorateCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    // Clear error after a short delay to allow the selection to update
                    setTimeout(() => {
                        if (currentGovernorates.length > 0) {
                            clearFieldError('request-governorate');
                        }
                    }, 100);
                });
            });
            
            // Clear subcategory error when selection changes
            document.addEventListener('change', (e) => {
                if (e.target.closest('#request-subcategory-options')) {
                    // Clear error after a short delay to allow the selection to update
                    setTimeout(() => {
                        const selectedSubcategories = document.querySelectorAll('#request-subcategory-options input[type="checkbox"]:checked');
                        if (selectedSubcategories.length > 0) {
                            clearFieldError('request-subcategory');
                        }
                    }, 100);
                }
            });
        }
        
        // Validate social media fields in real-time
        function validateSocialMediaFields() {
            const whatsapp = document.getElementById('request-whatsapp').value.trim();
            const facebook = document.getElementById('request-facebook').value.trim();
            const instagram = document.getElementById('request-instagram').value.trim();
            
            // Clear social media error if at least one is filled
            if (whatsapp || facebook || instagram) {
                clearFieldError('social-media');
            }
            
            // Validate individual fields if they are filled
            if (whatsapp && !isValidWhatsAppNumber(whatsapp)) {
                showFieldError('request-whatsapp', 'يرجى إدخال رقم واتساب صحيح');
            } else if (whatsapp) {
                clearFieldError('request-whatsapp');
            }
            
                            if (facebook && !isValidFacebookUrl(facebook)) {
                    showFieldError('request-facebook', 'يرجى إدخال رابط فيسبوك صحيح (يقبل جميع أنواع الروابط: صفحات، مجموعات، أحداث، منشورات، صور، فيديوهات، hashtags، روابط قصيرة)');
                } else if (facebook) {
                    clearFieldError('request-facebook');
                }
            
            if (instagram && !isValidInstagramUsername(instagram)) {
                showFieldError('request-instagram', 'يرجى إدخال اسم مستخدم إنستجرام صحيح');
            } else if (instagram) {
                clearFieldError('request-instagram');
            }
        }
        
        // Global Error Banner Functions
        function showGlobalErrorBanner() {
            const banner = document.getElementById('global-error-banner');
            if (banner) {
                banner.classList.remove('hidden');
                // Use setTimeout to ensure the element is visible before animating
                setTimeout(() => {
                    banner.classList.add('show');
                }, 10);
                
                // Scroll to the banner smoothly
                banner.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }
        
        function hideGlobalErrorBanner() {
            const banner = document.getElementById('global-error-banner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => {
                    banner.classList.add('hidden');
                }, 300);
            }
        }
        
        // Handle category change
        function handleCategoryChange() {
            const selectedCategory = this.value;
            const subcategoryGroup = document.getElementById('request-subcategory-group');
            const subcategoryOptions = document.getElementById('request-subcategory-options');
            
            // Clear subcategory options
            subcategoryOptions.innerHTML = '';
            
            // Clear any existing subcategory errors
            clearFieldError('request-subcategory');
            
            if (selectedCategory && subcategories[selectedCategory]) {
                // Add subcategory options as checkboxes
                subcategories[selectedCategory].forEach(sub => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'flex items-center';
                    checkboxDiv.innerHTML = `
                        <input type="checkbox" 
                               id="sub-${sub.value}" 
                               value="${sub.value}" 
                               class="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2">
                        <label for="sub-${sub.value}" class="mr-2 text-sm text-gray-700 cursor-pointer">
                            ${sub.label}
                        </label>
                    `;
                    subcategoryOptions.appendChild(checkboxDiv);
                });
                
                // Show subcategory group
                subcategoryGroup.style.display = 'block';
            } else {
                // Hide subcategory group
                subcategoryGroup.style.display = 'none';
            }
        }
        
        // Subcategory definitions - Updated to match category page filters
        const subcategories = {
            'koshat': [
                { value: 'koshat-wedding', label: 'كوشات زفاف' },
                { value: 'koshat-engagement', label: 'كوشات خطوبة' }
            ],
            'mirr': [
                { value: 'mirror-wedding', label: 'مرآة زفاف' },
                { value: 'mirror-engagement', label: 'مرآة خطوبة' },
                { value: 'mirror-decorative', label: 'مرآة ديكور' }
            ],
            'cake': [
                { value: 'cake-wedding', label: 'تورتة زفاف' },
                { value: 'cake-engagement', label: 'تورتة خطوبة' },
                { value: 'cake-birthday', label: 'تورتة عيد ميلاد' },
                { value: 'cake-chocolate', label: 'تورتة شوكولاتة' },
                { value: 'cake-fruit', label: 'تورتة فواكه' },
                { value: 'cake-chocolate-tray', label: 'صينية شوكولاتة' }
            ],
            'other': [
                { value: 'other-birthday', label: 'ديكور عيد ميلاد' },
                { value: 'other-hospital', label: 'استقبال المولود بالمستشفى' },
                { value: 'other-bride', label: 'ديكور استقبال عروسة' },
                { value: 'other-party', label: 'ديكور حفلات بسيطة' }
            ],
            'invitations': [
                { value: 'invitation-wedding', label: 'دعوة زفاف' },
                { value: 'invitation-engagement', label: 'دعوة خطوبة' },
                { value: 'invitation-chocolate', label: 'توزيعات بالشوكولاتة' },
                { value: 'invitation-perfumed', label: 'توزيعات بالبرفان' },
                { value: 'invitation-gift', label: 'توزيعات مع هدية صغيرة' },
                { value: 'invitation-digital', label: 'دعوة رقمية' },
                { value: 'invitation-innovative', label: 'دعوة مبتكرة' }
            ]
        };
        

        
        // Setup Global Error Banner Event Listeners
        function setupGlobalErrorBanner() {
            // Close button event listener
            const closeBtn = document.getElementById('close-error-banner');
            if (closeBtn) {
                closeBtn.addEventListener('click', hideGlobalErrorBanner);
            }
        }
        
        // Setup Advanced Governorate Filter
        function setupAdvancedGovernorateFilter() {
            const dropdownBtn = document.getElementById('request-governorate-dropdown-btn');
            const dropdownContent = document.getElementById('request-governorate-dropdown-content');
            const checkboxes = document.querySelectorAll('.governorate-checkbox');
            const selectAllBtn = document.getElementById('request-select-all-governorates');
            const clearAllBtn = document.getElementById('request-clear-all-governorates');
            const selectedContainer = document.getElementById('request-selected-governorates');

            // Toggle dropdown
            dropdownBtn.addEventListener('click', function() {
                dropdownContent.classList.toggle('hidden');
                dropdownBtn.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
                    dropdownContent.classList.add('hidden');
                    dropdownBtn.classList.remove('active');
                }
            });
            
            // Hover event removed - no validation needed

            // Handle checkbox changes
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    updateSelectedGovernorates();
                    updatePlaceholder();
                    updateCitiesFilter(currentGovernorates);
                });
            });

            // Select all
            selectAllBtn.addEventListener('click', function() {
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
                updateSelectedGovernorates();
                updatePlaceholder();
                updateCitiesFilter(currentGovernorates);
            });

            // Clear all
            clearAllBtn.addEventListener('click', function() {
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                updateSelectedGovernorates();
                updatePlaceholder();
                updateCitiesFilter(currentGovernorates);
            });

            function updateSelectedGovernorates() {
                const selected = [];
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        selected.push(checkbox.value);
                    }
                });
                currentGovernorates = selected;
                displaySelectedGovernorates();
                
                // Clear governorate error if governorates are selected
                if (selected.length > 0) {
                    clearFieldError('request-governorate');
                }
            }

            function updatePlaceholder() {
                const placeholder = document.getElementById('request-governorate-placeholder');
                if (currentGovernorates.length === 0) {
                    placeholder.textContent = 'اختر المحافظات';
                } else if (currentGovernorates.length === 1) {
                    placeholder.textContent = currentGovernorates[0];
                } else {
                    placeholder.textContent = `${currentGovernorates.length} محافظة مختارة`;
                }
            }

            function displaySelectedGovernorates() {
                if (currentGovernorates.length === 0) {
                    selectedContainer.innerHTML = '';
                    return;
                }

                selectedContainer.innerHTML = currentGovernorates.map(gov => `
                    <div class="selected-governorate-tag">
                        ${gov}
                        <button class="remove-governorate" onclick="removeRequestGovernorate('${gov}')">×</button>
                    </div>
                `).join('');
            }
        }

        // Remove specific governorate from request form
        function removeRequestGovernorate(governorate) {
            const checkbox = document.querySelector(`.governorate-checkbox[value="${governorate}"]`);
            if (checkbox) {
                checkbox.checked = false;
                currentGovernorates = currentGovernorates.filter(g => g !== governorate);
                
                const placeholder = document.getElementById('request-governorate-placeholder');
                placeholder.textContent = currentGovernorates.length === 0 ? 'اختر المحافظات' : 
                    currentGovernorates.length === 1 ? currentGovernorates[0] :
                    `${currentGovernorates.length} محافظة مختارة`;
                
                displaySelectedGovernorates();
                updateCitiesFilter(currentGovernorates);
            }
        }

        // Initialize Cities Filter
        function initializeCitiesFilter() {
            try {
                // Wait for CitiesService to be available
                if (typeof CitiesService === 'undefined') {
                    setTimeout(() => initializeCitiesFilter(), 100);
                    return;
                }
                
                // Initialize CitiesService
                citiesService = new CitiesService();
                
                // Setup cities filter functionality
                setupCitiesFilter();
            } catch (error) {
                console.error('❌ Error initializing CitiesService:', error);
                // Retry after a delay
                setTimeout(() => initializeCitiesFilter(), 500);
            }
        }
        
        // Setup Cities Filter
        function setupCitiesFilter() {
            const citiesTrigger = document.getElementById('request-cities-trigger');
            const citiesDropdown = document.getElementById('request-cities-dropdown');
            const citiesSearch = document.getElementById('request-cities-search');
            const selectAllCitiesBtn = document.getElementById('request-select-all-cities-btn');
            const clearAllCitiesBtn = document.getElementById('request-clear-all-cities-btn');
            const applyCitiesFilterBtn = document.getElementById('request-apply-cities-filter');

            // Toggle dropdown
            citiesTrigger.addEventListener('click', function() {
                citiesDropdown.classList.toggle('show');
                citiesTrigger.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                if (!citiesTrigger.contains(event.target) && !citiesDropdown.contains(event.target)) {
                    citiesDropdown.classList.remove('show');
                    citiesTrigger.classList.remove('active');
                }
            });

            // Search functionality
            citiesSearch.addEventListener('input', function() {
                filterCities(this.value);
            });

            // Select all cities
            selectAllCitiesBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('.city-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    selectedCities.add(checkbox.value);
                });
                updateCitiesDisplay();
            });

            // Clear all cities
            clearAllCitiesBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('.city-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                selectedCities.clear();
                updateCitiesDisplay();
            });

            // Apply filter
            applyCitiesFilterBtn.addEventListener('click', function() {
                citiesDropdown.classList.remove('show');
                citiesTrigger.classList.remove('active');
            });
        }
        

        
        // Update Cities Filter based on selected governorates
        function updateCitiesFilter(selectedGovernorates) {
            
            const citiesGroup = document.getElementById('request-cities-group');
            const citiesList = document.getElementById('request-cities-list');
            const citiesTrigger = document.getElementById('request-cities-trigger');
            const citiesSearch = document.getElementById('request-cities-search');

            if (selectedGovernorates.length === 0) {
                // Hide cities filter if no governorates selected
                citiesGroup.style.display = 'none';
                selectedCities.clear();
                updateCitiesDisplay();
                return;
            }

            // Show cities filter
            citiesGroup.style.display = 'block';

            // Check if citiesService is available
            if (!citiesService) {
                console.error('❌ CitiesService not available');
                return;
            }

            // Get all cities for selected governorates
            let allCities = [];
            selectedGovernorates.forEach(governorate => {
                try {
                    const cities = citiesService.getCitiesForGovernorate(governorate);
                    if (cities && cities.length > 0) {
                        allCities = allCities.concat(cities);
                    }
                } catch (error) {
                    console.error(`Error getting cities for ${governorate}:`, error);
                }
            });

            // Remove duplicates
            allCities = [...new Set(allCities)];



            // Populate cities list
            citiesList.innerHTML = allCities.map(city => `
                <div class="city-item">
                    <label class="city-checkbox">
                        <input type="checkbox" value="${city}" class="city-input">
                        <span class="city-name">${city}</span>
                    </label>
                </div>
            `).join('');

            // Add event listeners to new checkboxes
            const cityCheckboxes = document.querySelectorAll('.city-input');
            cityCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        selectedCities.add(this.value);
                    } else {
                        selectedCities.delete(this.value);
                    }
                    updateCitiesDisplay();
                });
            });

            // Clear search
            citiesSearch.value = '';
            
            // Update display
            updateCitiesDisplay();
        }
        
        // Filter cities based on search term
        function filterCities(searchTerm) {
            const cityItems = document.querySelectorAll('.city-item');
            
            cityItems.forEach(item => {
                const cityName = item.querySelector('.city-name').textContent.toLowerCase();
                const matches = cityName.includes(searchTerm.toLowerCase());
                item.style.display = matches ? 'block' : 'none';
            });
        }
        
        // Update cities display
        function updateCitiesDisplay() {
            const selectedCount = document.getElementById('request-cities-selected-count');
            const selectedCitiesContainer = document.getElementById('request-selected-cities');
            const triggerText = document.querySelector('#request-cities-trigger .trigger-text');

            // Update count
            if (selectedCities.size === 0) {
                selectedCount.style.display = 'none';
                triggerText.textContent = 'اختر المناطق/المدن (اختياري)';
            } else {
                selectedCount.style.display = 'inline-block';
                selectedCount.textContent = selectedCities.size;
                triggerText.textContent = `${selectedCities.size} منطقة مختارة`;
            }

            // Update selected cities tags
            if (selectedCities.size === 0) {
                selectedCitiesContainer.innerHTML = '';
            } else {
                selectedCitiesContainer.innerHTML = Array.from(selectedCities).map(city => `
                    <div class="selected-city-tag">
                        ${city}
                        <button class="remove-city" onclick="removeCity('${city}')">×</button>
                    </div>
                `).join('');
            }
        }
        
        // Remove specific city
        function removeCity(city) {
            selectedCities.delete(city);
            
            // Uncheck the corresponding checkbox
            const checkbox = document.querySelector(`.city-input[value="${city}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            updateCitiesDisplay();
        }
        
        // Get selected cities for form submission
        function getSelectedCities() {
            return Array.from(selectedCities);
        }
        
        // Setup image upload
        function setupImageUpload() {
            const uploadArea = document.getElementById('request-upload-area');
            const imageUpload = document.getElementById('request-image-upload');
            const imagePreview = document.getElementById('request-image-preview');
            
            // Initialize image counter
            updateImageCounter();
            
            // Click to upload
            uploadArea.addEventListener('click', () => {
                // Check if already at limit
                if (uploadedImages.length >= 3) {
                    showNotification('يمكنك تحميل 3 صور كحد أقصى فقط', 'error');
                    return;
                }
                imageUpload.click();
            });
            
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                // Check if adding files would exceed limit
                if (uploadedImages.length >= 3) {
                    showNotification('يمكنك تحميل 3 صور كحد أقصى فقط', 'error');
                    return;
                }
                
                const files = e.dataTransfer.files;
                handleImageFiles(files);
            });
            
            // File input change
            imageUpload.addEventListener('change', (e) => {
                handleImageFiles(e.target.files);
                // Clear input to allow selecting same file again
                e.target.value = '';
            });
        }
        
        // Handle image files
        function handleImageFiles(files) {
            // Check if adding these files would exceed the limit
            const currentCount = uploadedImages.length;
            const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            
            if (currentCount + newFiles.length > 3) {
                showNotification('يمكنك تحميل 3 صور كحد أقصى فقط', 'error');
                return;
            }
            
            // Process each image file
            newFiles.forEach(file => {
                processAndAddImage(file);
            });
        }
        
        // Process image: compress and add preview
        async function processAndAddImage(file) {
            try {
                // Compress image before adding
                const compressedFile = await compressImage(file);
                addImagePreview(compressedFile);
            } catch (error) {
                console.error('Error processing image:', error);
                // Fallback to original file if compression fails
                addImagePreview(file);
            }
        }
        
        // Compress image to reduce quality and size
        async function compressImage(file) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions (max width: 800px, maintain aspect ratio)
                    const maxWidth = 800;
                    let { width, height } = img;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with reduced quality (0.7 = 70% quality)
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7);
                };
                
                img.src = URL.createObjectURL(file);
            });
        }
        
        // Add image preview with drag and drop functionality
        function addImagePreview(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item sortable-image';
                imageItem.draggable = true;
                imageItem.setAttribute('data-index', uploadedImages.length);
                
                // Calculate file size in KB
                const fileSizeKB = (file.size / 1024).toFixed(1);
                
                imageItem.innerHTML = `
                    <div class="image-drag-handle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                    <img src="${e.target.result}" alt="${file.name}" class="w-full h-32 object-cover rounded-lg">
                    <div class="image-number">${uploadedImages.length + 1}</div>
                    <div class="image-info text-xs text-gray-500 mt-1 text-center">
                        ${fileSizeKB} KB
                    </div>
                    <button type="button" class="image-remove" onclick="removeImage(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                `;
                
                // Add drag and drop event listeners
                imageItem.addEventListener('dragstart', handleDragStart);
                imageItem.addEventListener('dragover', handleDragOver);
                imageItem.addEventListener('drop', handleDrop);
                imageItem.addEventListener('dragenter', handleDragEnter);
                imageItem.addEventListener('dragleave', handleDragLeave);
                
                const imagePreview = document.getElementById('request-image-preview');
                if (imagePreview) {
                    imagePreview.appendChild(imageItem);
                }
                uploadedImages.push({ src: e.target.result, name: file.name, file: file });
                
                // Hide instructions after first image
                const instructions = document.querySelector('.image-sort-instructions');
                if (instructions) {
                    instructions.style.display = 'none';
                }
                
                // Update image counter
                updateImageCounter();
            };
            reader.readAsDataURL(file);
        }
        
        // Drag and drop functions for image sorting
        function handleDragStart(e) {
            draggedElement = this;
            draggedIndex = parseInt(this.getAttribute('data-index'));
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDragEnter(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            this.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (draggedElement !== this) {
                const dropIndex = parseInt(this.getAttribute('data-index'));
                
                // Reorder the uploadedImages array
                const draggedImage = uploadedImages[draggedIndex];
                uploadedImages.splice(draggedIndex, 1);
                uploadedImages.splice(dropIndex, 0, draggedImage);
                
                // Reorder the DOM elements
                const imagePreview = document.getElementById('request-image-preview');
                if (imagePreview) {
                    const allImages = Array.from(imagePreview.querySelectorAll('.sortable-image'));
                    const draggedDOM = allImages[draggedIndex];
                    
                    if (draggedIndex < dropIndex) {
                        imagePreview.insertBefore(draggedDOM, allImages[dropIndex].nextSibling);
                    } else {
                        imagePreview.insertBefore(draggedDOM, allImages[dropIndex]);
                    }
                }
                
                // Update order
                updateImageOrder();
                
                // Show success message
                showSortSuccess();
            }
            
            draggedElement.classList.remove('dragging');
            draggedElement = null;
            draggedIndex = null;
        }

        function showSortSuccess() {
            const message = document.createElement('div');
            message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center';
            message.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                تم تغيير ترتيب الصور بنجاح
            `;
            
            document.body.appendChild(message);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                message.remove();
            }, 3000);
        }

        function updateImageOrder() {
            const imagePreview = document.getElementById('request-image-preview');
            if (!imagePreview) return;
            
            const imageItems = imagePreview.querySelectorAll('.sortable-image');
            imageItems.forEach((item, index) => {
                item.setAttribute('data-index', index);
                const numberElement = item.querySelector('.image-number');
                if (numberElement) {
                    numberElement.textContent = index + 1;
                }
            });
            
            // Update image counter after reordering
            updateImageCounter();
        }
        
        // Remove image
        function removeImage(button) {
            const imagePreview = document.getElementById('request-image-preview');
            if (!imagePreview) return;
            
            const imageItem = button.parentElement;
            const index = Array.from(imagePreview.children).indexOf(imageItem);
            uploadedImages.splice(index, 1);
            imageItem.remove();
            
            // Update image numbers and data-index attributes
            updateImageOrder();
            
            // Update image counter
            updateImageCounter();
            
            // Show instructions if no images left
            if (uploadedImages.length === 0) {
                const instructions = document.querySelector('.image-sort-instructions');
                if (instructions) {
                    instructions.style.display = 'block';
                }
            }
        }
        
        // Update image counter display
        function updateImageCounter() {
            const counter = document.getElementById('image-counter');
            if (counter) {
                counter.textContent = `${uploadedImages.length}/3`;
                
                // Change color based on count
                if (uploadedImages.length >= 3) {
                    counter.classList.add('text-red-500');
                    counter.classList.remove('text-green-500', 'text-yellow-500');
                } else if (uploadedImages.length >= 2) {
                    counter.classList.add('text-yellow-500');
                    counter.classList.remove('text-green-500', 'text-red-500');
                } else {
                    counter.classList.add('text-green-500');
                    counter.classList.remove('text-yellow-500', 'text-red-500');
                }
            }
        }



        // إرسال طلب المنتج
        async function submitProductRequest(e) {
            e.preventDefault();
            
            // Clear all previous errors
            clearAllFieldErrors();
            
            // Validate form before submission
            if (!validateForm()) {
                return; // Stop submission if validation fails
            }
            
            // Check image count
            if (uploadedImages.length === 0) {
                showNotification('يجب رفع صورة واحدة على الأقل للمنتج', 'error');
                return;
            }
            
            // Get form data after validation
            const description = document.getElementById('request-description').value.trim();
            const price = document.getElementById('request-price').value;
            const category = document.getElementById('request-category').value;
            
            // Get selected subcategories
            const selectedSubcategories = [];
            const subcategoryCheckboxes = document.querySelectorAll('#request-subcategory-options input[type="checkbox"]:checked');
            subcategoryCheckboxes.forEach(checkbox => {
                selectedSubcategories.push(checkbox.value);
            });
            
            const selectedGovernorates = currentGovernorates;
            const whatsapp = document.getElementById('request-whatsapp').value;
            const facebook = document.getElementById('request-facebook').value;
            const instagram = document.getElementById('request-instagram').value;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            showLoading(submitBtn);
            
            try {
                // Get selected cities
                const selectedCitiesArray = getSelectedCities();
                
                // Prepare request data
                const requestData = {
                    description: description,
                    price: price || null,
                    category: category,
                    subcategory: selectedSubcategories.length > 0 ? selectedSubcategories : null,
                    governorate: selectedGovernorates.join(', '),
                    cities: selectedCitiesArray.length > 0 ? selectedCitiesArray.join(', ') : null,
                    whatsapp: whatsapp,
                    facebook: facebook || null,
                    instagram: instagram || null
                };
                
                // Convert uploaded images to File objects
                const imageFiles = [];
                for (let i = 0; i < uploadedImages.length; i++) {
                    if (uploadedImages[i].file) {
                        imageFiles.push(uploadedImages[i].file);
                    } else {
                        // Convert data URL to File object
                        const response = await fetch(uploadedImages[i].src);
                        const blob = await response.blob();
                        const file = new File([blob], uploadedImages[i].name, { type: blob.type });
                        imageFiles.push(file);
                    }
                }
                
                // Submit request
                const productRequestsService = new ProductRequestsService();
                const result = await productRequestsService.submitProductRequest(requestData, imageFiles);
                
                if (result.success) {
                    // ✅ 1. رسالة النجاح
                    showSuccessMessage('تم إرسال طلبك بنجاح! سنقوم بمراجعته وإضافته للموقع قريباً.');
                    
                    // ✅ 2. مسح النموذج
                    e.target.reset();
                    uploadedImages.length = 0;
                    const imagePreview = document.getElementById('request-image-preview');
                    imagePreview.innerHTML = '';
                    
                    // ✅ 3. مسح فلتر المدن
                    selectedCities.clear();
                    updateCitiesDisplay();
                    
                    // ✅ 4. إخفاء مجموعات التصنيفات
                    document.getElementById('request-subcategory-group').style.display = 'none';
                    document.getElementById('request-cities-group').style.display = 'none';
                    
                    // ✅ 5. إعادة عرض تعليمات الصور
                    const instructions = document.createElement('div');
                    instructions.className = 'image-sort-instructions mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg col-span-2 md:col-span-4';
                    instructions.innerHTML = `
                        <div class="flex items-center text-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span class="text-sm font-medium">اسحب الصور لترتيبها - الصورة الأولى ستكون الصورة الرئيسية</span>
                        </div>
                    `;
                    imagePreview.appendChild(instructions);
                    
                    // ✅ 6. إعادة تعيين اختيارات المحافظات
                    currentGovernorates = [];
                    const governorateCheckboxes = document.querySelectorAll('.governorate-checkbox');
                    governorateCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });
                    
                    // ✅ 7. تحديث النص التوضيحي
                    const placeholder = document.getElementById('request-governorate-placeholder');
                    if (placeholder) {
                        placeholder.textContent = 'اختر المحافظات';
                    }
                    
                    // ✅ 8. مسح عرض المحافظات المختارة
                    const selectedContainer = document.getElementById('request-selected-governorates');
                    if (selectedContainer) {
                        selectedContainer.innerHTML = '';
                    }
                    
                    // ✅ 9. إعادة تحميل الصفحة مع البقاء في نفس العنوان
                    setTimeout(() => {
                        // حفظ موقع النموذج في الذاكرة المؤقتة
                        sessionStorage.setItem('scrollToForm', 'true');
                        location.reload();
                    }, 2000); // انتظار ثانيتين لعرض رسالة النجاح
                } else {
                    submitBtn.innerHTML = originalText;
                    showErrorMessage('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
                }
            } catch (error) {
                submitBtn.innerHTML = originalText;
                showErrorMessage('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
                console.error('Error:', error);
            }
        }
        
                // Form validation function
        function validateForm() {
            let isValid = true;
            
            // Validate description
            const description = document.getElementById('request-description').value.trim();
            if (!description) {
                showFieldError('request-description', 'هذا الحقل مطلوب');
                isValid = false;
            }
            
            // Validate category
            const category = document.getElementById('request-category').value;
            if (!category) {
                showFieldError('request-category', 'يرجى اختيار التصنيف الرئيسي');
                isValid = false;
            }
            
            // Validate subcategory (only if category is selected)
            if (category) {
                const subcategoryCheckboxes = document.querySelectorAll('#request-subcategory-options input[type="checkbox"]:checked');
                if (subcategoryCheckboxes.length === 0) {
                    showFieldError('request-subcategory', 'يرجى اختيار التصنيف الفرعي');
                    isValid = false;
                }
            }
            
            // Validate governorate
            if (currentGovernorates.length === 0) {
                showFieldError('request-governorate', 'يرجى اختيار محافظة واحدة على الأقل');
                isValid = false;
            }
            
            // Validate social media - at least one must be filled
            const whatsapp = document.getElementById('request-whatsapp').value.trim();
            const facebook = document.getElementById('request-facebook').value.trim();
            const instagram = document.getElementById('request-instagram').value.trim();
            
            if (!whatsapp && !facebook && !instagram) {
                showFieldError('social-media', 'يجب ملء حقل واحد على الأقل من وسائل التواصل الاجتماعي');
                isValid = false;
            } else {
                // Clear social media error if at least one is filled
                clearFieldError('social-media');
            }
            
            // Validate individual social media fields if they are filled
            if (whatsapp && !isValidWhatsAppNumber(whatsapp)) {
                showFieldError('request-whatsapp', 'يرجى إدخال رقم واتساب صحيح');
                isValid = false;
            }
            
            if (facebook && !isValidFacebookUrl(facebook)) {
                showFieldError('request-facebook', 'يرجى إدخال رابط فيسبوك صحيح (يقبل جميع أنواع الروابط: صفحات، مجموعات، أحداث، منشورات، صور، فيديوهات، hashtags، روابط قصيرة)');
                isValid = false;
            }
            
            if (instagram && !isValidInstagramUsername(instagram)) {
                showFieldError('request-instagram', 'يرجى إدخال اسم مستخدم إنستجرام صحيح');
                isValid = false;
            }
            
            // Show global error banner if validation fails
            if (!isValid) {
                showGlobalErrorBanner();
            } else {
                hideGlobalErrorBanner();
            }
            
            return isValid;
        }
        
        // Validate WhatsApp number format
        function isValidWhatsAppNumber(phone) {
            // Remove all non-digit characters
            const cleanPhone = phone.replace(/\D/g, '');
            
            // Check if it's a valid Egyptian phone number
            // Egyptian numbers start with 01 and are 11 digits long
            if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
                return true;
            }
            
            // Check if it's a valid international format
            if (cleanPhone.length === 12 && cleanPhone.startsWith('20')) {
                return true;
            }
            
            // Check if it's a valid international format with +
            if (phone.startsWith('+') && (cleanPhone.length === 12 || cleanPhone.length === 11)) {
                return true;
            }
            
            return false;
        }
        
        // Validate Facebook URL format - يقبل جميع أنواع روابط الفيس بوك
        function isValidFacebookUrl(url) {
            // تنظيف الرابط من المسافات
            url = url.trim();
            
            // إذا كان الرابط فارغاً، يعتبر صحيحاً (حقل اختياري)
            if (!url) {
                return true;
            }
            
            // نمط مبسط وشامل لجميع أنواع روابط فيسبوك
            // يقبل أي رابط يحتوي على facebook.com أو fb.me
            const facebookRegex = /^https?:\/\/(www\.)?(facebook\.com|fb\.me)\/.+/;
            
            return facebookRegex.test(url);
        }
        
        // Validate Instagram username format
        function isValidInstagramUsername(username) {
            const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
            return instagramRegex.test(username);
        }
        
        // Show field error
        function showFieldError(fieldId, message) {
            const errorElement = document.getElementById(`${fieldId}-error`);
            let fieldElement = document.getElementById(fieldId);
            
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
                errorElement.classList.add('show');
                
                // Add error styling to field
                if (fieldElement) {
                    fieldElement.classList.add('field-error');
                }
                
                // Special handling for governorate and subcategory
                if (fieldId === 'request-governorate') {
                    const dropdownBtn = document.getElementById('request-governorate-dropdown-btn');
                    if (dropdownBtn) {
                        dropdownBtn.classList.add('field-error');
                        // Also add error styling to the entire governorate section
                        const governorateSection = dropdownBtn.closest('.simple-governorate-filter');
                        if (governorateSection) {
                            governorateSection.classList.add('field-error');
                        }
                    }
                } else if (fieldId === 'request-subcategory') {
                    const subcategoryGroup = document.getElementById('request-subcategory-group');
                    if (subcategoryGroup) {
                        subcategoryGroup.classList.add('field-error');
                        // Add error styling to the subcategory options container
                        const subcategoryOptions = document.getElementById('request-subcategory-options');
                        if (subcategoryOptions) {
                            subcategoryOptions.classList.add('field-error');
                        }
                    }
                }
            }
        }
        
        // Clear field error
        function clearFieldError(fieldId) {
            const errorElement = document.getElementById(`${fieldId}-error`);
            let fieldElement = document.getElementById(fieldId);
            
            if (errorElement) {
                errorElement.classList.add('hidden');
                errorElement.classList.remove('show');
                
                // Remove error styling from field
                if (fieldElement) {
                    fieldElement.classList.remove('field-error');
                }
                
                // Special handling for governorate and subcategory
                if (fieldId === 'request-governorate') {
                    const dropdownBtn = document.getElementById('request-governorate-dropdown-btn');
                    if (dropdownBtn) {
                        dropdownBtn.classList.remove('field-error');
                        // Also remove error styling from the entire governorate section
                        const governorateSection = dropdownBtn.closest('.simple-governorate-filter');
                        if (governorateSection) {
                            governorateSection.classList.remove('field-error');
                        }
                    }
                } else if (fieldId === 'request-subcategory') {
                    const subcategoryGroup = document.getElementById('request-subcategory-group');
                    if (subcategoryGroup) {
                        subcategoryGroup.classList.remove('field-error');
                        // Remove error styling from the subcategory options container
                        const subcategoryOptions = document.getElementById('request-subcategory-options');
                        if (subcategoryOptions) {
                            subcategoryOptions.classList.remove('field-error');
                        }
                    }
                }
            }
        }
        
        // Clear all field errors
        function clearAllFieldErrors() {
            const errorElements = document.querySelectorAll('.validation-error');
            const fieldElements = document.querySelectorAll('.field-error');
            
            errorElements.forEach(element => {
                element.classList.add('hidden');
                element.classList.remove('show');
            });
            
            fieldElements.forEach(element => {
                element.classList.remove('field-error');
            });
            
            // Also clear any special error styling
            const governorateSection = document.querySelector('.simple-governorate-filter.field-error');
            if (governorateSection) {
                governorateSection.classList.remove('field-error');
            }
            
            const subcategoryGroup = document.getElementById('request-subcategory-group');
            if (subcategoryGroup && subcategoryGroup.classList.contains('field-error')) {
                subcategoryGroup.classList.remove('field-error');
            }
            
            const subcategoryOptions = document.getElementById('request-subcategory-options');
            if (subcategoryOptions && subcategoryOptions.classList.contains('field-error')) {
                subcategoryOptions.classList.remove('field-error');
            }
        }
        
        // Show loading state
        function showLoading(button) {
            button.innerHTML = `
                <svg class="animate-spin h-5 w-5 inline ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإرسال...
            `;
            button.disabled = true;
        }
        
        // Show success message
        function showSuccessMessage(message) {
            // Show success notification
            showNotification(message, 'success');
        }
        
        // Show error message
        function showErrorMessage(message, fieldId = null) {
            if (fieldId) {
                showFieldError(fieldId, message);
            } else {
                showNotification(message, 'error');
            }
        }


        
        // الانتقال التلقائي للنموذج بعد إعادة التحميل
        function scrollToFormAfterReload() {
            if (sessionStorage.getItem('scrollToForm') === 'true') {
                // إزالة العلامة من الذاكرة المؤقتة
                sessionStorage.removeItem('scrollToForm');
                
                // انتظار قليل لضمان تحميل الصفحة
                setTimeout(() => {
                    const formSection = document.getElementById('product-request-section');
                    if (formSection) {
                        // الانتقال السلس للنموذج مع تعويض ارتفاع الهيدر
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const formTop = formSection.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: formTop,
                            behavior: 'smooth'
                        });
                        
                        // إضافة تأثير بصري للنموذج
                        formSection.style.transition = 'all 0.3s ease';
                        formSection.style.transform = 'scale(1.02)';
                        formSection.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                        
                        setTimeout(() => {
                            formSection.style.transform = 'scale(1)';
                            formSection.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        }, 300);
                    }
                }, 500);
            }
        }
        
        // تشغيل الانتقال التلقائي عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', scrollToFormAfterReload);
        
        // Load category products
        document.addEventListener('DOMContentLoaded', loadCategoryProducts);
        
        // Function to load products for each category
        async function loadCategoryProducts() {
            
            // Load products for each category
            await Promise.all([
                loadCategoryProductsByType('koshat', 'koshat'),
                loadCategoryProductsByType('cake', 'cake'),
                loadCategoryProductsByType('mirr', 'mirror'),
                loadCategoryProductsByType('other', 'other'),
                loadCategoryProductsByType('invitations', 'invitations')
            ]);
        }
        
        // Function to load products for a specific category
        async function loadCategoryProductsByType(categoryType, sectionId) {
            try {
                
                const loadingElement = document.getElementById(`${sectionId}-loading`);
                const gridElement = document.getElementById(`${sectionId}-products-grid`);
                const noProductsElement = document.getElementById(`${sectionId}-no-products`);
                
                if (!loadingElement || !gridElement || !noProductsElement) {
                    console.error(`❌ Missing elements for ${sectionId}`);
                    return;
                }
                
                // Show loading
                loadingElement.classList.remove('hidden');
                gridElement.classList.add('hidden');
                noProductsElement.classList.add('hidden');
                
                // Get products - PRIORITY: Ads first, then regular products
                let products = [];
                
                // 1. FIRST: Try to get advertisements (paid priority)
                if (window.advertisingService) {
                    try {
                        const ads = await window.advertisingService.getProductsByCategory(categoryType, 9);
                        if (ads && ads.length > 0) {
                            products = ads;
                        }
                    } catch (error) {
                        console.error(`No ads found for ${categoryType}:`, error);
                    }
                }
                
                // تم إزالة المنتجات العادية - الإعلانات فقط
                
                // Hide loading
                loadingElement.classList.add('hidden');
                
                if (products.length > 0) {
                    // إخفاء رسالة "لا توجد منتجات" عند وجود منتجات
                    if (noProductsElement) {
                        noProductsElement.classList.add('hidden');
                    }
                    
                    // Display products in 3x3 grid
                    displayCategoryProducts(gridElement, products, categoryType);
                    gridElement.classList.remove('hidden');
                    
                } else {
                    // إخفاء شبكة المنتجات عند عدم وجود منتجات
                    if (gridElement) {
                        gridElement.classList.add('hidden');
                    }
                    
                    // إظهار رسالة "لا توجد منتجات" مع النص الصحيح
                    if (noProductsElement) {
                        const titleElement = noProductsElement.querySelector('h3');
                        const messageElement = noProductsElement.querySelector('p');
                        
                        if (titleElement) titleElement.textContent = 'لا توجد منتجات في هذا التصنيف';
                        if (messageElement) messageElement.textContent = 'سنقوم بإضافة منتجات جديدة قريباً';
                        
                        noProductsElement.classList.remove('hidden');
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error loading ${categoryType} products:`, error);
                
                // Hide loading and show error
                const loadingElement = document.getElementById(`${sectionId}-loading`);
                const noProductsElement = document.getElementById(`${sectionId}-no-products`);
                
                if (loadingElement) loadingElement.classList.add('hidden');
                if (noProductsElement) {
                    // تغيير رسالة الخطأ لتكون أكثر وضوحاً
                    const titleElement = noProductsElement.querySelector('h3');
                    const messageElement = noProductsElement.querySelector('p');
                    
                    if (titleElement) titleElement.textContent = 'خطأ في تحميل المنتجات';
                    if (messageElement) messageElement.textContent = 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.';
                    
                    noProductsElement.classList.remove('hidden');
                }
            }
        }
        
        // Function to display products in 3x3 grid
        function displayCategoryProducts(gridElement, products, categoryType) {
            // Limit to 9 products maximum
            const limitedProducts = products.slice(0, 9);
            
            // Create HTML for products
            const productsHTML = limitedProducts.map((product, index) => {
                // Handle different product formats
                let imageUrl, productName, productPrice, productId;
                
                if (product.ad_id) {
                    // This is an advertisement
                    imageUrl = product.image_url || 'https://placehold.co/300x200/EEE/31343C?text=لا+توجد+صورة';
                    productName = product.name || product.description || 'منتج مميز';
                    productPrice = product.price || 0;
                    productId = product.product_id || product.id;
                } else {
                    // This is a regular product
                    imageUrl = product.image_urls && product.image_urls.length > 0 
                        ? product.image_urls[0] 
                        : 'https://placehold.co/300x200/EEE/31343C?text=لا+توجد+صورة';
                    productName = product.description || 'منتج';
                    productPrice = product.price || 0;
                    productId = product.id;
                }
                
                // تم إزالة اسم التصنيف للمنتجات المميزة والموصى بها
                // let categoryDisplay = '';
                // if (categoryType === 'featured' || categoryType === 'recommended') {
                //     categoryDisplay = `<div class="category-product-name mb-2">${productName}</div>`;
                // }
                
                return `
                    <div class="category-product-card" onclick="openProductDetails('${productId}', '${product.ad_id || ''}')">
                        <img src="${imageUrl}" 
                             alt="${productName}" 
                             loading="lazy"
                             decoding="async">
                        <div class="category-product-info">
                            <div class="mb-2">
                                <div class="flex flex-wrap gap-1">
                                    ${product.governorate ? `<span class="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">${product.governorate}</span>` : ''}
                                    ${product.cities && product.cities.trim() !== '' && product.cities !== 'جميع المدن' ? `<span class="inline-flex items-center bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">${product.cities.split(',')[0].trim()}</span>` : ''}
                                </div>
                            </div>
                            <div class="category-product-price">${productPrice > 0 ? 'ج.م ' + productPrice : 'سعر عند الطلب'}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Update grid content
            gridElement.innerHTML = productsHTML;
        }
    

