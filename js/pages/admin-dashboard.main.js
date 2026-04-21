        // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªØ­Ù…ÙŠÙ„ adminSecurity
        let adminSecurityCheckStarted = false;
        
        function checkAdminSecurity() {
            if (adminSecurityCheckStarted) {
                return; // Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø±
            }
            
            if (!window.adminSecurity) {
                console.log('â³ Waiting for adminSecurity to load...');
                adminSecurityCheckStarted = true;
                setTimeout(checkAdminSecurity, 100);
                return;
            }
            console.log('âœ… adminSecurity loaded successfully');
        }
        
        // Ø¨Ø¯Ø¡ Ø§Ù„ØªØ­Ù‚Ù‚ Ø¹Ù†Ø¯ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø© - Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø© ÙÙ‚Ø·
        setTimeout(checkAdminSecurity, 100);
        
        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù†Ø¯ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©
        window.onload = async function() {
            // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ adminSecurity
            while (!window.adminSecurity) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            await loadDashboardData();
            await loadUserInfo();
            await loadRecentActivity();
            
            // Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø­Ø§Ù„Ø© Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©
            restorePageState();
        };
        
        // Ù†Ø¸Ø§Ù… Ø¨Ø¯ÙŠÙ„ Ù„Ø¶Ù…Ø§Ù† Ø¹Ù…Ù„ Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø©
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM Content Loaded - Ø¥Ø¹Ø¯Ø§Ø¯ Ù†Ø¸Ø§Ù… Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø©');
            
            // ØªØ£Ø®ÙŠØ± Ù‚ØµÙŠØ± Ù„Ø¶Ù…Ø§Ù† ØªØ­Ù…ÙŠÙ„ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¹Ù†Ø§ØµØ±
            setTimeout(() => {
                restorePageState();
            }, 500);
        });
        
        // Ù…Ø±Ø§Ù‚Ø¨Ø© ØªØºÙŠÙŠØ±Ø§Øª Ø§Ù„ØµÙØ­Ø©
        window.addEventListener('beforeunload', function() {
            console.log('Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø© Ù‚Ø¨Ù„ Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„ØµÙØ­Ø©');
            // Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ© Ù‚Ø¨Ù„ Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„ØµÙØ­Ø©
            const currentPanel = getCurrentActivePanel();
            if (currentPanel) {
                saveCurrentPageState(currentPanel);
            }
        });
        
        // Ù…Ø±Ø§Ù‚Ø¨Ø© ØªØºÙŠÙŠØ±Ø§Øª Ø§Ù„ØµÙØ­Ø© Ø¹Ù†Ø¯ Ø§Ù„ØªØ­Ø¯ÙŠØ«
        window.addEventListener('load', function() {
            console.log('ØªÙ… ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø© - Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø©');
            // Ù…Ø­Ø§ÙˆÙ„Ø© Ø¥Ø¶Ø§ÙÙŠØ© Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø©
            setTimeout(() => {
                restorePageState();
            }, 1000);
        });
        
        // Ø¥Ø¶Ø§ÙØ© Ø£Ø²Ø±Ø§Ø± Ø§Ø®ØªØ¨Ø§Ø± ÙÙŠ Console
        window.testPageState = {
            save: function(page) {
                saveCurrentPageState(page);
                console.log(`ØªÙ… Ø­ÙØ¸ Ø­Ø§Ù„Ø© Ø§Ù„ØµÙØ­Ø©: ${page}`);
            },
            restore: function() {
                restorePageState();
            },
            clear: function() {
                localStorage.removeItem('adminCurrentPage');
                localStorage.removeItem('adminPageTimestamp');
                console.log('ØªÙ… Ù…Ø³Ø­ Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©');
            },
            show: function() {
                const savedPage = localStorage.getItem('adminCurrentPage');
                const timestamp = localStorage.getItem('adminPageTimestamp');
                console.log('Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©:', { savedPage, timestamp });
            }
        };
        
        console.log('ðŸš€ Ù†Ø¸Ø§Ù… Ø­ÙØ¸ Ø­Ø§Ù„Ø© Ø§Ù„ØµÙØ­Ø© Ø¬Ø§Ù‡Ø²!');
        console.log('Ø§Ø³ØªØ®Ø¯Ù… window.testPageState.save("advertising") Ù„Ø­ÙØ¸ Ø­Ø§Ù„Ø©');
        console.log('Ø§Ø³ØªØ®Ø¯Ù… window.testPageState.restore() Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø©');
        console.log('Ø§Ø³ØªØ®Ø¯Ù… window.testPageState.show() Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©');

        // Ø­Ø³Ø§Ø¨ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„ØµÙˆØ± Ø§Ù„ØªÙØµÙŠÙ„ÙŠØ©
        async function calculateImageStatistics() {
            try {
                let totalImages = 0;
                let productsWithImages = 0;
                let productsWithoutImages = 0;
                const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
                
                for (const table of tables) {
                    try {
                        const { data: products, error: productsError } = await window.supabaseClient
                            .from(table)
                            .select('image_urls');
                        
                        if (!productsError && products) {
                            products.forEach(product => {
                                if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
                                    totalImages += product.image_urls.length;
                                    productsWithImages++;
                                } else {
                                    productsWithoutImages++;
                                }
                            });
                        } else if (productsError) {
                            console.error(`Error loading images from ${table}:`, productsError);
                        }
                    } catch (tableError) {
                        console.error(`Error accessing table ${table}:`, tableError);
                    }
                }
                
                return {
                    totalImages,
                    productsWithImages,
                    productsWithoutImages,
                    averageImagesPerProduct: productsWithImages > 0 ? (totalImages / productsWithImages).toFixed(1) : 0
                };
            } catch (error) {
                console.error('Error calculating image statistics:', error);
                return {
                    totalImages: 0,
                    productsWithImages: 0,
                    productsWithoutImages: 0,
                    averageImagesPerProduct: 0
                };
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©
        async function loadDashboardData() {
            try {
                // Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ø¹Ù…ÙŠÙ„ Supabase
                if (!window.supabaseClient) {
                    console.error('Supabase client not initialized');
                    return;
                }

                // Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†
                const { data: users, error: usersError } = await window.supabaseClient
                    .from('users')
                    .select('*');

                if (!usersError && users) {
                    document.getElementById('totalUsers').textContent = users.length;
                    document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'Ù†Ø´Ø·').length;
                } else if (usersError) {
                    console.error('Error loading users:', usersError);
                }

                // Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„
                let totalProducts = 0;
                const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
                
                for (const table of tables) {
                    try {
                        const { data: products, error: productsError } = await window.supabaseClient
                            .from(table)
                            .select('*');
                        
                        if (!productsError && products) {
                            totalProducts += products.length;
                        } else if (productsError) {
                            console.error(`Error loading ${table}:`, productsError);
                        }
                    } catch (tableError) {
                        console.error(`Error accessing table ${table}:`, tableError);
                    }
                }
                
                document.getElementById('totalProducts').textContent = totalProducts;
                
                // Ø­Ø³Ø§Ø¨ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„ØµÙˆØ±
                const imageStats = await calculateImageStatistics();
                document.getElementById('totalImages').textContent = imageStats.totalImages;
                document.getElementById('avgImagesPerProduct').textContent = imageStats.averageImagesPerProduct;
                
                // Ø¥Ø¶Ø§ÙØ© Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© ÙÙŠ console Ù„Ù„Ù…Ø·ÙˆØ±ÙŠÙ†
                console.log('ðŸ“Š Image Statistics:', {
                    totalImages: imageStats.totalImages,
                    productsWithImages: imageStats.productsWithImages,
                    productsWithoutImages: imageStats.productsWithoutImages,
                    averageImagesPerProduct: imageStats.averageImagesPerProduct
                });

                // Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø³Ø¬Ù„Ø§Øª
                const { data: logs, error: logsError } = await window.supabaseClient
                    .from('admin_logs')
                    .select('*')
                    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

                if (!logsError && logs) {
                    document.getElementById('recentLogs').textContent = logs.length;
                } else if (logsError) {
                    console.error('Error loading logs:', logsError);
                }

                // Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
                try {
                    if (window.ProductRequestsService) {
                        const service = new window.ProductRequestsService();
                        await service.ensureInitialized();
                        const statsResult = await service.getRequestStatistics();
                        
                        if (statsResult.success) {
                            document.getElementById('pendingRequests').textContent = statsResult.data.pending;
                        }
                    }
                } catch (error) {
                    console.error('Error loading request statistics:', error);
                    document.getElementById('pendingRequests').textContent = '0';
                }

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
        async function loadUserInfo() {
            try {
                // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ adminSecurity
                while (!window.adminSecurity) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                const currentUser = await adminSecurity.getCurrentUser();
                if (currentUser) {
                    const userInfoDiv = document.getElementById('userInfo');
                    userInfoDiv.innerHTML = `
                        <div class="user-name">${currentUser.fullName}</div>
                        <div class="user-role">${currentUser.role === 'admin' ? 'Ù…Ø¯ÙŠØ±' : 'Ù…Ø­Ø±Ø±'}</div>
                    `;
                } else {
                    console.log('No current user found');
                }
            } catch (error) {
                console.error('Error loading user info:', error);
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù†Ø´Ø§Ø· Ø§Ù„Ø£Ø®ÙŠØ±
        async function loadRecentActivity() {
            try {
                // Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ø¹Ù…ÙŠÙ„ Supabase
                if (!window.supabaseClient) {
                    console.error('Supabase client not initialized');
                    return;
                }

                const { data: logs, error } = await window.supabaseClient
                    .from('admin_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) {
                    throw error;
                }

                const activityList = document.getElementById('activityList');
                activityList.innerHTML = '';

                if (logs && logs.length > 0) {
                    logs.forEach(log => {
                        const activityItem = createActivityItem(log);
                        activityList.appendChild(activityItem);
                    });
                } else {
                    activityList.innerHTML = '<li class="activity-item">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ù†Ø´Ø·Ø© Ø­Ø¯ÙŠØ«Ø©</li>';
                }

            } catch (error) {
                console.error('Error loading recent activity:', error);
            }
        }

        // Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù†ØµØ± Ø§Ù„Ù†Ø´Ø§Ø·
        function createActivityItem(log) {
            const li = document.createElement('li');
            li.className = 'activity-item';

            const icons = {
                'admin_login': 'ðŸ”',
                'failed_login': 'âŒ',
                'user_added': 'âž•',
                'user_deleted': 'ðŸ—‘ï¸',
                'session_timeout': 'â°',
                'default': 'ðŸ“'
            };

            const icon = icons[log.action] || icons.default;
            const actionText = getActionText(log.action);

            li.innerHTML = `
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${actionText}</div>
                    <div class="activity-time">${new Date(log.created_at).toLocaleString('ar-EG')}</div>
                </div>
            `;

            return li;
        }

        // ØªØ±Ø¬Ù…Ø© Ù†ÙˆØ¹ Ø§Ù„Ù†Ø´Ø§Ø·
        function getActionText(action) {
            const actions = {
                'admin_login': 'ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ù…Ø¯ÙŠØ±',
                'failed_login': 'Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ ÙØ§Ø´Ù„Ø©',
                'user_added': 'Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªØ®Ø¯Ù… Ø¬Ø¯ÙŠØ¯',
                'user_deleted': 'Ø­Ø°Ù Ù…Ø³ØªØ®Ø¯Ù…',
                'session_timeout': 'Ø§Ù†ØªÙ‡Ø§Ø¡ Ù…Ù‡Ù„Ø© Ø§Ù„Ø¬Ù„Ø³Ø©',
                'default': 'Ù†Ø´Ø§Ø· ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…'
            };

            return actions[action] || actions.default;
        }

        // Ø¹Ø±Ø¶ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±
        function showReports() {
            navigateToRoute('reports');
            
            // Ø¥Ø¶Ø§ÙØ© Ø²Ø± Ø§Ù„Ø¹ÙˆØ¯Ø©
            if (!document.getElementById('back-to-dashboard')) {
                const backBtn = document.createElement('button');
                backBtn.id = 'back-to-dashboard';
                backBtn.className = 'nav-btn';
                backBtn.innerHTML = 'ðŸ”™ Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©';
                backBtn.onclick = backToDashboard;
                document.querySelector('.header-content').appendChild(backBtn);
            }
        }

        // Ø¥Ø®ÙØ§Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…
        function hideAllSections() {
            document.querySelector('.welcome-section').style.display = 'none';
            document.querySelector('.stats-grid').style.display = 'none';
            document.querySelector('.quick-actions').style.display = 'none';
            document.querySelector('.recent-activity').style.display = 'none';
            document.getElementById('advertising-panel').style.display = 'none';
            document.getElementById('reports-section').style.display = 'none';
            document.getElementById('product-requests-section').style.display = 'none';
        }

        // Ø¹Ø±Ø¶ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
        function showProductRequests() {
            // Ø¥Ø®ÙØ§Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø£Ø®Ø±Ù‰
            hideAllSections();
            
            // Ø¥Ø¸Ù‡Ø§Ø± Ù‚Ø³Ù… Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
            document.getElementById('product-requests-section').style.display = 'block';
            
            // Ø¥Ø¶Ø§ÙØ© Ø²Ø± Ø§Ù„Ø¹ÙˆØ¯Ø©
            if (!document.getElementById('back-to-dashboard')) {
                const backBtn = document.createElement('button');
                backBtn.id = 'back-to-dashboard';
                backBtn.className = 'nav-btn';
                backBtn.innerHTML = 'ðŸ”™ Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©';
                backBtn.onclick = backToDashboard;
                document.querySelector('.header-content').appendChild(backBtn);
            }
            
            // ØªØ­Ù…ÙŠÙ„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
            loadProductRequests();
            
            // ØªÙ‡ÙŠØ¦Ø© ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù†
            setTimeout(() => {
                initializeEditRequestCitiesFilter();
            }, 100);
        }

        // Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
        function backToDashboard() {
            // Ø¥Ø²Ø§Ù„Ø© Ø²Ø± Ø§Ù„Ø¹ÙˆØ¯Ø©
            const backBtn = document.getElementById('back-to-dashboard');
            if (backBtn) backBtn.remove();
            
            // Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
            showDashboardHome();
        }

        // Ø¹Ø±Ø¶ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„ÙˆØ­Ø©
        function showDashboardHome() {
            // Ø¥Ø®ÙØ§Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…
            hideAllSections();
            
            // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
            document.querySelector('.welcome-section').style.display = 'block';
            document.querySelector('.stats-grid').style.display = 'grid';
            document.querySelector('.quick-actions').style.display = 'grid';
            document.querySelector('.recent-activity').style.display = 'block';
            
            // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø³Ø§Ø±
            updateURL('dashboard');
            saveCurrentRoute('dashboard');
        }

        // ØªØ­Ø¯ÙŠØ« URL Ø¨Ø¯ÙˆÙ† Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©
        function updateURL(route) {
            try {
                const newURL = `/admin/${route === 'dashboard' ? '' : route}`;
                window.history.pushState({ route }, 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', newURL);
                console.log(`ØªÙ… ØªØ­Ø¯ÙŠØ« URL Ø¥Ù„Ù‰: ${newURL}`);
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« URL:', error);
            }
        }

        // Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ ÙÙŠ localStorage
        function saveCurrentRoute(route) {
            try {
                localStorage.setItem('adminCurrentRoute', route);
                localStorage.setItem('adminRouteTimestamp', Date.now().toString());
                console.log(`ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø±: ${route}`);
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø±:', error);
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±
        async function loadReports() {
            // Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªÙ…Ø¹ÙŠ Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ù„Ø£Ø²Ø±Ø§Ø± Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±
            const reportButtons = document.querySelectorAll('[data-report]');
            reportButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ÙØ¦Ø© Ø§Ù„Ù†Ø´Ø·Ø© Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø²Ø±Ø§Ø±
                    reportButtons.forEach(btn => btn.classList.remove('active'));
                    // Ø¥Ø¶Ø§ÙØ© Ø§Ù„ÙØ¦Ø© Ø§Ù„Ù†Ø´Ø·Ø© Ù„Ù„Ø²Ø± Ø§Ù„Ù…Ø­Ø¯Ø¯
                    this.classList.add('active');
                    
                    // ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø­Ø¯Ø¯
                    const reportType = this.getAttribute('data-report');
                    loadSpecificReport(reportType);
                });
            });
            
            // ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ (Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª)
            loadSpecificReport('products');
        }

        // ØªØ­Ù…ÙŠÙ„ ØªÙ‚Ø±ÙŠØ± Ù…Ø­Ø¯Ø¯
        async function loadSpecificReport(reportType) {
            const reportsContent = document.getElementById('reports-content');
            reportsContent.innerHTML = '<div class="text-center py-8">Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø±ÙŠØ±...</div>';
            
            try {
                switch (reportType) {
                    case 'products':
                        await loadProductsReport();
                        break;
                    case 'users':
                        await loadUsersReport();
                        break;
                    case 'images':
                        await loadImagesReport();
                        break;
                    case 'performance':
                        await loadPerformanceReport();
                        break;
                    default:
                        reportsContent.innerHTML = '<div class="text-center py-8 text-gray-500">Ù†ÙˆØ¹ Ø§Ù„ØªÙ‚Ø±ÙŠØ± ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ</div>';
                }
            } catch (error) {
                console.error('Error loading report:', error);
                reportsContent.innerHTML = '<div class="text-center py-8 text-red-500">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø±ÙŠØ±</div>';
            }
        }

        // ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
        async function loadProductsReport() {
            try {
                const reportsContent = document.getElementById('reports-content');
                let totalProducts = 0;
                let productsByCategory = {};
                let productsWithoutImages = 0;
                let recentProducts = [];
                const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
                
                for (const table of tables) {
                    try {
                        const { data: products, error } = await window.supabaseClient
                            .from(table)
                            .select('*')
                            .order('created_at', { ascending: false });
                        
                        if (!error && products) {
                            const categoryName = getCategoryDisplayName(table);
                            productsByCategory[categoryName] = products.length;
                            totalProducts += products.length;
                            
                            // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø¨Ø¯ÙˆÙ† ØµÙˆØ±
                            products.forEach(product => {
                                if (!product.image_urls || !Array.isArray(product.image_urls) || product.image_urls.length === 0) {
                                    productsWithoutImages++;
                                }
                            });
                            
                            // Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø«Ø© Ù…Ø¤Ø®Ø±Ø§Ù‹
                            recentProducts.push(...products.slice(0, 3));
                        }
                    } catch (error) {
                        console.error(`Error loading ${table}:`, error);
                    }
                }
                
                // ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø­Ø³Ø¨ Ø§Ù„ØªØ§Ø±ÙŠØ®
                recentProducts.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
                recentProducts = recentProducts.slice(0, 5);
                
                const reportHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ“Š Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø¹Ø§Ù…Ø©</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª:</span>
                                    <span class="font-bold text-blue-600">${totalProducts}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø¨Ø¯ÙˆÙ† ØµÙˆØ±:</span>
                                    <span class="font-bold text-orange-600">${productsWithoutImages}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ù†Ø³Ø¨Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ø¹ ØµÙˆØ±:</span>
                                    <span class="font-bold text-green-600">${totalProducts > 0 ? ((totalProducts - productsWithoutImages) / totalProducts * 100).toFixed(1) : 0}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ“‚ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ</h3>
                            <div class="space-y-3">
                                ${Object.entries(productsByCategory).map(([category, count]) => `
                                    <div class="flex justify-between">
                                        <span>${category}:</span>
                                        <span class="font-bold text-purple-600">${count}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ•’ Ø¢Ø®Ø± Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª</h3>
                            <div class="space-y-2">
                                ${recentProducts.map(product => `
                                    <div class="text-sm p-2 bg-gray-50 rounded">
                                        <div class="font-medium">${product.name || product.description || 'Ù…Ù†ØªØ¬'}</div>
                                        <div class="text-gray-600">${new Date(product.updated_at || product.created_at).toLocaleDateString('ar-EG')}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                reportsContent.innerHTML = reportHTML;
                
            } catch (error) {
                console.error('Error loading products report:', error);
                document.getElementById('reports-content').innerHTML = '<div class="text-center py-8 text-red-500">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</div>';
            }
        }

        // ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†
        async function loadUsersReport() {
            try {
                const { data: users, error } = await window.supabaseClient
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const totalUsers = users.length;
                const activeUsers = users.filter(u => u.status === 'Ù†Ø´Ø·').length;
                const newUsers = users.filter(u => {
                    const userDate = new Date(u.created_at);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return userDate > weekAgo;
                }).length;
                
                const recentUsers = users.slice(0, 5);
                
                const reportHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ‘¥ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†:</span>
                                    <span class="font-bold text-blue-600">${totalUsers}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù†Ø´Ø·ÙŠÙ†:</span>
                                    <span class="font-bold text-green-600">${activeUsers}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø¬Ø¯Ø¯ (Ø£Ø³Ø¨ÙˆØ¹):</span>
                                    <span class="font-bold text-purple-600">${newUsers}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ“ˆ Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù†Ù…Ùˆ</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Ù†Ø³Ø¨Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù†Ø´Ø·ÙŠÙ†:</span>
                                    <span class="font-bold text-green-600">${totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : 0}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ù…Ø¹Ø¯Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ:</span>
                                    <span class="font-bold text-blue-600">${newUsers}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ†• Ø¢Ø®Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†</h3>
                            <div class="space-y-2">
                                ${recentUsers.map(user => `
                                    <div class="text-sm p-2 bg-gray-50 rounded">
                                        <div class="font-medium">${user.full_name || user.email}</div>
                                        <div class="text-gray-600">${new Date(user.created_at).toLocaleDateString('ar-EG')}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('reports-content').innerHTML = reportHTML;
                
            } catch (error) {
                console.error('Error loading users report:', error);
                document.getElementById('reports-content').innerHTML = '<div class="text-center py-8 text-red-500">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†</div>';
            }
        }

        // ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØµÙˆØ±
        async function loadImagesReport() {
            try {
                const imageStats = await calculateImageStatistics();
                const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
                let imagesByCategory = {};
                
                // Ø­Ø³Ø§Ø¨ Ø§Ù„ØµÙˆØ± Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
                for (const table of tables) {
                    try {
                        const { data: products, error } = await window.supabaseClient
                            .from(table)
                            .select('image_urls');
                        
                        if (!error && products) {
                            const categoryName = getCategoryDisplayName(table);
                            let categoryImages = 0;
                            
                            products.forEach(product => {
                                if (product.image_urls && Array.isArray(product.image_urls)) {
                                    categoryImages += product.image_urls.length;
                                }
                            });
                            
                            imagesByCategory[categoryName] = categoryImages;
                        }
                    } catch (error) {
                        console.error(`Error loading images from ${table}:`, error);
                    }
                }
                
                const reportHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ–¼ï¸ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„ØµÙˆØ±</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØµÙˆØ±:</span>
                                    <span class="font-bold text-blue-600">${imageStats.totalImages}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ø¹ ØµÙˆØ±:</span>
                                    <span class="font-bold text-green-600">${imageStats.productsWithImages}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø¨Ø¯ÙˆÙ† ØµÙˆØ±:</span>
                                    <span class="font-bold text-orange-600">${imageStats.productsWithoutImages}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ“¸ Ø§Ù„ØµÙˆØ± Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ</h3>
                            <div class="space-y-3">
                                ${Object.entries(imagesByCategory).map(([category, count]) => `
                                    <div class="flex justify-between">
                                        <span>${category}:</span>
                                        <span class="font-bold text-purple-600">${count}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ“Š Ù…ØªÙˆØ³Ø· Ø§Ù„ØµÙˆØ±</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Ù…ØªÙˆØ³Ø· Ø§Ù„ØµÙˆØ±/Ù…Ù†ØªØ¬:</span>
                                    <span class="font-bold text-green-600">${imageStats.averageImagesPerProduct}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ù†Ø³Ø¨Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ø¹ ØµÙˆØ±:</span>
                                    <span class="font-bold text-blue-600">${(imageStats.productsWithImages + imageStats.productsWithoutImages) > 0 ? (imageStats.productsWithImages / (imageStats.productsWithImages + imageStats.productsWithoutImages) * 100).toFixed(1) : 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('reports-content').innerHTML = reportHTML;
                
            } catch (error) {
                console.error('Error loading images report:', error);
                document.getElementById('reports-content').innerHTML = '<div class="text-center py-8 text-red-500">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØµÙˆØ±</div>';
            }
        }

        // ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø£Ø¯Ø§Ø¡
        async function loadPerformanceReport() {
            try {
                const pageLoadTime = performance.now();
                const memoryUsage = performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null;
                
                const reportHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">âš¡ Ø£Ø¯Ø§Ø¡ Ø§Ù„ØµÙØ­Ø©</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>ÙˆÙ‚Øª Ø§Ù„ØªØ­Ù…ÙŠÙ„:</span>
                                    <span class="font-bold text-blue-600">${pageLoadTime.toFixed(2)}ms</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>ØªØ§Ø±ÙŠØ® Ø§Ù„ØªÙ‚Ø±ÙŠØ±:</span>
                                    <span class="font-bold text-green-600">${new Date().toLocaleDateString('ar-EG')}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ’¾ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø°Ø§ÙƒØ±Ø©</h3>
                            <div class="space-y-3">
                                ${memoryUsage ? `
                                    <div class="flex justify-between">
                                        <span>Ø§Ù„Ø°Ø§ÙƒØ±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø©:</span>
                                        <span class="font-bold text-blue-600">${memoryUsage.used} MB</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø°Ø§ÙƒØ±Ø©:</span>
                                        <span class="font-bold text-green-600">${memoryUsage.total} MB</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Ø­Ø¯ Ø§Ù„Ø°Ø§ÙƒØ±Ø©:</span>
                                        <span class="font-bold text-purple-600">${memoryUsage.limit} MB</span>
                                    </div>
                                ` : '<div class="text-gray-500">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø°Ø§ÙƒØ±Ø© ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©</div>'}
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-4 text-center">ðŸ”§ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù…ØªØµÙØ­:</span>
                                    <span class="font-bold text-blue-600">${navigator.userAgent.split(' ').pop()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ù†Ø¸Ø§Ù… Ø§Ù„ØªØ´ØºÙŠÙ„:</span>
                                    <span class="font-bold text-green-600">${navigator.platform}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ø§Ù„Ù„ØºØ©:</span>
                                    <span class="font-bold text-purple-600">${navigator.language}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('reports-content').innerHTML = reportHTML;
                
            } catch (error) {
                console.error('Error loading performance report:', error);
                document.getElementById('reports-content').innerHTML = '<div class="text-center py-8 text-red-500">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø£Ø¯Ø§Ø¡</div>';
            }
        }

        // Ø¯Ø§Ù„Ø© Ù…Ø³Ø§Ø¹Ø¯Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ø³Ù… Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶
        function getCategoryDisplayName(tableName) {
            const categoryMap = {
                'products_cake': 'ØªÙˆØ±ØªØ§Øª',
                'products_koshat': 'ÙƒÙˆØ´Ø§Øª',
                'products_mirr': 'Ù…Ø±Ø§ÙŠØ§',
                'products_other': 'Ø¯ÙŠÙƒÙˆØ±Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©',
                'products_invitations': 'Ø¯Ø¹ÙˆØ§Øª ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª',
                'products_flowerbouquets': 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ù„ÙˆØ±Ø¯'
            };
            return categoryMap[tableName] || tableName;
        }

        // ØªØ­Ù…ÙŠÙ„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
        async function loadProductRequests(status = 'all') {
            try {
                // Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ÙˆØ¬ÙˆØ¯ ProductRequestsService
                if (!window.ProductRequestsService) {
                    console.error('ProductRequestsService not available');
                    return;
                }

                const service = new window.ProductRequestsService();
                await service.ensureInitialized();

                let result;
                if (status === 'all') {
                    result = await service.getAllProductRequests();
                } else {
                    result = await service.getProductRequestsByStatus(status);
                }

                if (result.success) {
                    displayProductRequests(result.data, status);
                } else {
                    console.error('Error loading product requests:', result.error);
                }
            } catch (error) {
                console.error('Error in loadProductRequests:', error);
            }
        }

        // Ø¹Ø±Ø¶ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
        function displayProductRequests(requests, status) {
            const requestsList = document.getElementById('requests-list');
            const noRequestsMessage = document.getElementById('no-requests-message');

            if (!requests || requests.length === 0) {
                requestsList.style.display = 'none';
                noRequestsMessage.style.display = 'block';
                return;
            }

            requestsList.style.display = 'block';
            noRequestsMessage.style.display = 'none';

            // ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙ‡Ø§ Ù„Ø§Ø­Ù‚Ø§Ù‹ (Ù…Ø¹ Ø¯Ø¹Ù… Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª)
            if (!window.currentRequests) {
                window.currentRequests = [];
            }
            
            // Ø¯Ù…Ø¬ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù…Ø¹ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯Ø© (Ù„Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª)
            requests.forEach(newRequest => {
                const existingIndex = window.currentRequests.findIndex(r => r.id == newRequest.id);
                if (existingIndex !== -1) {
                    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯ Ù…Ø¹ Ø§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª
                    window.currentRequests[existingIndex] = {
                        ...window.currentRequests[existingIndex],
                        ...newRequest,
                        // Ø§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
                        description: window.currentRequests[existingIndex].description || newRequest.description,
                        price: window.currentRequests[existingIndex].price || newRequest.price,
                        category: window.currentRequests[existingIndex].category || newRequest.category,
                        subcategory: window.currentRequests[existingIndex].subcategory || newRequest.subcategory,
                        governorate: window.currentRequests[existingIndex].governorate || newRequest.governorate,
                        cities: window.currentRequests[existingIndex].cities || newRequest.cities,
                        whatsapp: window.currentRequests[existingIndex].whatsapp || newRequest.whatsapp,
                        facebook: window.currentRequests[existingIndex].facebook || newRequest.facebook,
                        instagram: window.currentRequests[existingIndex].instagram || newRequest.instagram,
                        image_urls: window.currentRequests[existingIndex].image_urls || newRequest.image_urls
                    };
                } else {
                    // Ø¥Ø¶Ø§ÙØ© Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯
                    window.currentRequests.push(newRequest);
                }
            });

            // Ø¹Ø±Ø¶ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…ÙØ­Ø¯Ø«Ø©
            requestsList.innerHTML = window.currentRequests.map(request => createRequestCard(request)).join('');

            // Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªÙ…Ø¹ÙŠ Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ù„Ù„Ø£Ø²Ø±Ø§Ø±
            addRequestEventListeners();
        }

        // Ø¥Ù†Ø´Ø§Ø¡ Ø¨Ø·Ø§Ù‚Ø© Ø·Ù„Ø¨
        function createRequestCard(request) {
            const statusClass = `status-${request.status}`;
            const statusText = getStatusText(request.status);
            const createdAt = new Date(request.created_at).toLocaleString('ar-EG');

            // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„ÙØ±Ø¹ÙŠ - Ø¯Ø¹Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
            let subcategoryDisplay = 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
            if (request.subcategory) {
                if (Array.isArray(request.subcategory)) {
                    subcategoryDisplay = request.subcategory.join(', ');
                } else if (typeof request.subcategory === 'string') {
                    try {
                        const parsed = JSON.parse(request.subcategory);
                        if (Array.isArray(parsed)) {
                            subcategoryDisplay = parsed.join(', ');
                        } else {
                            subcategoryDisplay = parsed || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
                        }
                    } catch (e) {
                        subcategoryDisplay = request.subcategory;
                    }
                }
            }

            // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø³Ø¹Ø± - Ø¯Ø¹Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
            let priceDisplay = 'Ø§Ù„Ø³Ø¹Ø± Ø¹Ù†Ø¯ Ø§Ù„Ø·Ù„Ø¨';
            if (request.price) {
                if (typeof request.price === 'number' && request.price > 0) {
                    priceDisplay = request.price + ' Ø¬.Ù…';
                } else if (typeof request.price === 'string' && request.price.trim() !== '') {
                    priceDisplay = request.price + ' Ø¬.Ù…';
                }
            }

            // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª - Ø¯Ø¹Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
            let governorateDisplay = 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
            if (request.governorate) {
                if (Array.isArray(request.governorate)) {
                    governorateDisplay = request.governorate.join(', ');
                } else if (typeof request.governorate === 'string') {
                    governorateDisplay = request.governorate;
                }
            }

            // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ù† - Ù„Ù„Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª ÙÙ‚Ø·
            let colorsDisplay = '';
            if (request.category === 'flowerbouquets' && request.colors) {
                const colors = request.colors.split(',').map(color => color.trim()).filter(color => color);
                if (colors.length > 0) {
                    const colorLabels = {
                        'red': 'Ø£Ø­Ù…Ø±',
                        'pink': 'ÙˆØ±Ø¯ÙŠ', 
                        'white': 'Ø£Ø¨ÙŠØ¶',
                        'yellow': 'Ø£ØµÙØ±',
                        'purple': 'Ø¨Ù†ÙØ³Ø¬ÙŠ',
                        'orange': 'Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ',
                        'blue': 'Ø£Ø²Ø±Ù‚',
                        'mixed': 'Ù…Ø®ØªÙ„Ø·'
                    };
                    const displayColors = colors.map(color => colorLabels[color] || color).join(', ');
                    colorsDisplay = `<p><strong>Ø§Ù„Ø£Ù„ÙˆØ§Ù†:</strong> ${displayColors}</p>`;
                }
            }

            return `
                <div class="request-card" data-request-id="${request.id}">
                    <div class="request-header">
                        <h3 class="font-semibold text-lg">Ø·Ù„Ø¨ Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬</h3>
                        <span class="request-status ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><strong>Ø§Ù„ØªØµÙ†ÙŠÙ:</strong> ${getCategoryName(request.category)}</p>
                            <p><strong>Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„ÙØ±Ø¹ÙŠ:</strong> ${subcategoryDisplay}</p>
                            <p><strong>Ø§Ù„ÙˆØµÙ:</strong> ${request.description || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</p>
                            <p><strong>Ø§Ù„Ø³Ø¹Ø±:</strong> ${priceDisplay}</p>
                            <p><strong>Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª:</strong> ${governorateDisplay}</p>
                            ${colorsDisplay}
                            <p><strong>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø·Ù„Ø¨:</strong> ${createdAt}</p>
                        </div>
                        
                        <div>
                            <p><strong>Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨:</strong> ${request.whatsapp || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</p>
                            <p><strong>ÙÙŠØ³Ø¨ÙˆÙƒ:</strong> ${request.facebook || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</p>
                            <p><strong>Ø¥Ù†Ø³ØªØ¬Ø±Ø§Ù…:</strong> ${request.instagram || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</p>
                        </div>
                    </div>
                    
                    ${request.image_urls && request.image_urls.length > 0 ? `
                        <div class="request-images">
                            ${request.image_urls.map(img => `
                                <img src="${img.url || img}" alt="ØµÙˆØ±Ø© Ø§Ù„Ù…Ù†ØªØ¬" class="request-image">
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="request-actions">
                        <button class="btn-view" onclick="viewRequestDetails('${request.id}')">Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„</button>
                        ${request.status === 'pending' ? `
                            <button class="btn-edit" onclick="editRequest('${request.id}')">ØªØ¹Ø¯ÙŠÙ„</button>
                            <button class="btn-approve" onclick="approveRequest('${request.id}')">Ù…ÙˆØ§ÙÙ‚Ø©</button>
                            <button class="btn-reject" onclick="rejectRequest('${request.id}')">Ø±ÙØ¶</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªÙ…Ø¹ÙŠ Ø§Ù„Ø£Ø­Ø¯Ø§Ø«
        function addRequestEventListeners() {
            // Ù…Ø³ØªÙ…Ø¹ÙŠ Ø£Ø­Ø¯Ø§Ø« Ø£Ø²Ø±Ø§Ø± Ø§Ù„ÙÙ„ØªØ±
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ÙØ¦Ø© Ø§Ù„Ù†Ø´Ø·Ø© Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø²Ø±Ø§Ø±
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    // Ø¥Ø¶Ø§ÙØ© Ø§Ù„ÙØ¦Ø© Ø§Ù„Ù†Ø´Ø·Ø© Ù„Ù„Ø²Ø± Ø§Ù„Ù…Ø­Ø¯Ø¯
                    this.classList.add('active');
                    
                    // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©
                    const status = this.getAttribute('data-status');
                    loadProductRequests(status);
                });
            });
        }

        // Ø¹Ø±Ø¶ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function viewRequestDetails(requestId) {
            try {
                console.log('Viewing details for request:', requestId);
                
                // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø·Ù„Ø¨ ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©
                const requestCard = document.querySelector(`[data-request-id="${requestId}"]`);
                if (!requestCard) {
                    console.warn('Request card not found in DOM');
                }

                // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø®Ø²Ù†Ø©
                const requestData = getRequestDataById(requestId);
                if (!requestData) {
                    alert('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                    return;
                }

                console.log('Request data retrieved:', requestData);

                // Ø¹Ø±Ø¶ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø©
                showRequestDetailsModal(requestData);
            } catch (error) {
                console.error('Error in viewRequestDetails:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¹Ø±Ø¶ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
            }
        }

        // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ø¨ÙˆØ§Ø³Ø·Ø© ID
        function getRequestDataById(requestId) {
            // Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ø­Ø§Ù„ÙŠØ§Ù‹
            const requestsList = document.getElementById('requests-list');
            const requestCard = requestsList.querySelector(`[data-request-id="${requestId}"]`);
            
            if (requestCard) {
                // Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù† Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©
                return extractRequestDataFromCard(requestCard);
            }
            
            // Ø¥Ø°Ø§ Ù„Ù… Ù†Ø¬Ø¯ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø©ØŒ Ù†Ø­Ø§ÙˆÙ„ Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø®Ø²Ù†Ø©
            if (window.currentRequests && window.currentRequests.length > 0) {
                const storedRequest = window.currentRequests.find(req => req.id == requestId);
                if (storedRequest) {
                    return formatRequestData(storedRequest);
                }
            }
            
            return null;
        }

        // Ø¯Ø§Ù„Ø© Ù…Ø­Ø³Ù†Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ù…Ø¹ Ø¯Ø¹Ù… Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª
        function getRequestDataForEdit(requestId) {
            // Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø®Ø²Ù†Ø© Ø£ÙˆÙ„Ø§Ù‹ (Ø£Ø­Ø¯Ø« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª)
            if (window.currentRequests && window.currentRequests.length > 0) {
                const storedRequest = window.currentRequests.find(req => req.id == requestId);
                if (storedRequest) {
                    console.log('ðŸ” Found request in currentRequests:', storedRequest);
                    return storedRequest;
                }
            }
            
            // Ø¥Ø°Ø§ Ù„Ù… Ù†Ø¬Ø¯ ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø®Ø²Ù†Ø©ØŒ Ù†Ø­Ø§ÙˆÙ„ Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
            console.log('ðŸ” Request not found in currentRequests, searching in database...');
            return null;
        }

        // ØªÙ†Ø³ÙŠÙ‚ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨
        function formatRequestData(request) {
            try {
                const createdAt = new Date(request.created_at).toLocaleString('ar-EG');
                const statusText = getStatusText(request.status);
                const categoryName = getCategoryName(request.category);
                
                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø³Ø¹Ø± - Ø¯Ø¹Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
                let priceText = 'Ø§Ù„Ø³Ø¹Ø± Ø¹Ù†Ø¯ Ø§Ù„Ø·Ù„Ø¨';
                if (request.price) {
                    if (typeof request.price === 'number' && request.price > 0) {
                        priceText = request.price + ' Ø¬.Ù…';
                    } else if (typeof request.price === 'string' && request.price.trim() !== '') {
                        priceText = request.price + ' Ø¬.Ù…';
                    }
                }
                
                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„ÙØ±Ø¹ÙŠ - Ø¯Ø¹Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
                let subcategoryText = 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
                if (request.subcategory) {
                    if (Array.isArray(request.subcategory)) {
                        subcategoryText = request.subcategory.join(', ');
                    } else if (typeof request.subcategory === 'string') {
                        try {
                            const parsed = JSON.parse(request.subcategory);
                            if (Array.isArray(parsed)) {
                                subcategoryText = parsed.join(', ');
                            } else {
                                subcategoryText = parsed || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
                            }
                        } catch (e) {
                            subcategoryText = request.subcategory;
                        }
                    }
                }
                
                return {
                    id: request.id,
                    description: request.description || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    category: categoryName,
                    subcategory: subcategoryText,
                    price: priceText,
                    governorate: request.governorate || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    cities: request.cities || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    whatsapp: request.whatsapp || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    facebook: request.facebook || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    instagram: request.instagram || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    status: statusText,
                    created_at: createdAt,
                    image_urls: request.image_urls || []
                };
            } catch (error) {
                console.error('Error formatting request data:', error);
                return null;
            }
        }

        // Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ù…Ù† Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©
        function extractRequestDataFromCard(requestCard) {
            try {
                // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙÙ‚Ø±Ø§Øª ÙÙŠ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø©
                const paragraphs = requestCard.querySelectorAll('p');
                const requestData = {
                    id: requestCard.getAttribute('data-request-id'),
                    description: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    category: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    subcategory: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    price: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    governorate: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    cities: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    whatsapp: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    facebook: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    instagram: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    status: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    created_at: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
                    image_urls: []
                };

                // Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„ÙÙ‚Ø±Ø§Øª Ø¹Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                paragraphs.forEach(p => {
                    const text = p.textContent || '';
                    const strong = p.querySelector('strong');
                    
                    if (strong) {
                        const label = strong.textContent.trim();
                        const value = p.textContent.replace(label, '').trim();
                        
                        if (label.includes('Ø§Ù„ÙˆØµÙ')) {
                            requestData.description = value;
                        } else if (label.includes('Ø§Ù„ØªØµÙ†ÙŠÙ:')) {
                            requestData.category = value;
                        } else if (label.includes('Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„ÙØ±Ø¹ÙŠ:')) {
                            requestData.subcategory = value;
                        } else if (label.includes('Ø§Ù„Ø³Ø¹Ø±')) {
                            requestData.price = value;
                        } else if (label.includes('Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª')) {
                            requestData.governorate = value;
                        } else if (label.includes('Ø§Ù„Ù…Ù†Ø§Ø·Ù‚') || label.includes('Ø§Ù„Ù…Ø¯Ù†')) {
                            requestData.cities = value;
                        } else if (label.includes('Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨')) {
                            requestData.whatsapp = value;
                        } else if (label.includes('ÙÙŠØ³Ø¨ÙˆÙƒ')) {
                            requestData.facebook = value;
                        } else if (label.includes('Ø¥Ù†Ø³ØªØ¬Ø±Ø§Ù…')) {
                            requestData.instagram = value;
                        } else if (label.includes('ØªØ§Ø±ÙŠØ® Ø§Ù„Ø·Ù„Ø¨')) {
                            requestData.created_at = value;
                        }
                    }
                });

                // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø­Ø§Ù„Ø©
                const statusElement = requestCard.querySelector('.request-status');
                if (statusElement) {
                    requestData.status = statusElement.textContent.trim();
                }

                // Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„ØµÙˆØ±
                const images = requestCard.querySelectorAll('.request-image');
                images.forEach(img => {
                    requestData.image_urls.push({
                        url: img.src,
                        original_name: img.alt
                    });
                });

                console.log('Extracted request data:', requestData);
                return requestData;
            } catch (error) {
                console.error('Error extracting request data:', error);
                return null;
            }
        }

        // Ø¹Ø±Ø¶ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø© Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function showRequestDetailsModal(requestData) {
            const modal = document.getElementById('request-details-modal');
            const content = document.getElementById('request-details-content');

            // Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØªÙØ§ØµÙŠÙ„
            content.innerHTML = createRequestDetailsHTML(requestData);

            // Ø¹Ø±Ø¶ Ø§Ù„Ù†Ø§ÙØ°Ø©
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }

        // Ø¥Ù†Ø´Ø§Ø¡ HTML Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function createRequestDetailsHTML(requestData) {
            const statusClass = `status-${requestData.status === 'ÙÙŠ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±' ? 'pending' : requestData.status === 'ØªÙ…Øª Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©' ? 'approved' : 'rejected'}`;
            
            return `
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨:</span>
                    <span class="request-detail-value">#${requestData.id}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø§Ù„Ø­Ø§Ù„Ø©:</span>
                    <span class="request-detail-value">
                        <span class="request-status ${statusClass}">${requestData.status}</span>
                    </span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø§Ù„ØªØµÙ†ÙŠÙ:</span>
                    <span class="request-detail-value">${requestData.category}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø§Ù„ÙˆØµÙ:</span>
                    <span class="request-detail-value">${requestData.description}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø§Ù„Ø³Ø¹Ø±:</span>
                    <span class="request-detail-value">${requestData.price}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª:</span>
                    <span class="request-detail-value">${requestData.governorate}</span>
                </div>
                
                ${requestData.category === 'flowerbouquets' && requestData.colors ? `
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø§Ù„Ø£Ù„ÙˆØ§Ù†:</span>
                    <span class="request-detail-value">${requestData.colors}</span>
                </div>
                ` : ''}
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø±Ù‚Ù… Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨:</span>
                    <span class="request-detail-value">${requestData.whatsapp}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø±Ø§Ø¨Ø· Ø§Ù„ÙÙŠØ³Ø¨ÙˆÙƒ:</span>
                    <span class="request-detail-value">${requestData.facebook}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">Ø±Ø§Ø¨Ø· Ø§Ù„Ø¥Ù†Ø³ØªØ¬Ø±Ø§Ù…:</span>
                    <span class="request-detail-value">${requestData.instagram}</span>
                </div>
                
                <div class="request-detail-item">
                    <span class="request-detail-label">ØªØ§Ø±ÙŠØ® Ø§Ù„Ø·Ù„Ø¨:</span>
                    <span class="request-detail-value">${requestData.created_at}</span>
                </div>
                
                ${requestData.image_urls && requestData.image_urls.length > 0 ? `
                    <div class="request-detail-item">
                        <span class="request-detail-label">Ø§Ù„ØµÙˆØ± Ø§Ù„Ù…Ø±ÙÙ‚Ø©:</span>
                        <div class="request-images-grid">
                            ${requestData.image_urls.map((img, index) => {
                                const imageUrl = typeof img === 'string' ? img : (img.url || img);
                                return `
                                    <div class="request-image-item">
                                        <img src="${imageUrl}" alt="ØµÙˆØ±Ø© ${index + 1}" loading="lazy" onerror="this.style.display='none'">
                                        <div class="request-image-overlay">
                                            <button onclick="openImageInNewTab('${imageUrl}')">Ø¹Ø±Ø¶</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }

        // ÙØªØ­ Ø§Ù„ØµÙˆØ±Ø© ÙÙŠ ØªØ¨ÙˆÙŠØ¨ Ø¬Ø¯ÙŠØ¯
        function openImageInNewTab(imageUrl) {
            window.open(imageUrl, '_blank');
        }

        // Ø¥ØºÙ„Ø§Ù‚ Ù†Ø§ÙØ°Ø© ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function closeRequestDetails() {
            const modal = document.getElementById('request-details-modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        // Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø¹Ù†Ø¯ Ø§Ù„Ù†Ù‚Ø± Ø®Ø§Ø±Ø¬Ù‡Ø§
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('request-details-modal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        closeRequestDetails();
                    }
                });
            }
        });

        // Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø¹Ù†Ø¯ Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('request-details-modal');
                if (modal && modal.style.display !== 'none') {
                    closeRequestDetails();
                }
                
                const editModal = document.getElementById('edit-ad-modal');
                if (editModal && editModal.style.display !== 'none') {
                    hideEditAdModal();
                }
            }
        });

        // Ø¥ØºÙ„Ø§Ù‚ Ù†ÙˆØ§ÙØ° Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¹Ù†Ø¯ Ø§Ù„Ù†Ù‚Ø± Ø®Ø§Ø±Ø¬Ù‡Ø§
        document.addEventListener('DOMContentLoaded', function() {
            const editModal = document.getElementById('edit-ad-modal');
            if (editModal) {
                editModal.addEventListener('click', function(e) {
                    if (e.target === editModal) {
                        hideEditAdModal();
                    }
                });
            }
        });

        // ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function editRequest(requestId) {
            console.log('ðŸ” [DEBUG] ===== STARTING editRequest =====');
            console.log('ðŸ” [DEBUG] Request ID:', requestId);

            // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø·Ù„Ø¨ ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©
            const requestCard = document.querySelector(`[data-request-id="${requestId}"]`);
            if (!requestCard) {
                console.warn('Request card not found in DOM');
            }

            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø®Ø²Ù†Ø© (Ø£Ø­Ø¯Ø« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª)
            const requestData = getRequestDataForEdit(requestId);
            if (!requestData) {
                alert('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                return;
            }

            console.log('ðŸ” [DEBUG] âœ… Request data retrieved for edit:', requestData);

            // Ø¹Ø±Ø¶ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø© Ù„Ù„ØªØ¹Ø¯ÙŠÙ„
            showEditRequestModal(requestData);
        }

        // Ø¹Ø±Ø¶ Ù†Ø§ÙØ°Ø© ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function showEditRequestModal(requestData) {
            console.log('ðŸ” [DEBUG] ===== STARTING showEditRequestModal =====');
            console.log('ðŸ” [DEBUG] Request data for edit:', requestData);

            // Ù…Ù„Ø¡ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø§Ù„ÙŠØ©
            document.getElementById('edit-request-id').value = requestData.id;
            document.getElementById('edit-request-description').value = requestData.description || '';
            
            // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø³Ø¹Ø± - Ø¥Ø²Ø§Ù„Ø© "Ø¬.Ù…" Ø¥Ø°Ø§ ÙƒØ§Ù† Ù…ÙˆØ¬ÙˆØ¯Ø§Ù‹
            let priceValue = requestData.price || '';
            if (typeof priceValue === 'string' && priceValue.includes('Ø¬.Ù…')) {
                priceValue = priceValue.replace('Ø¬.Ù…', '').trim();
            }
            document.getElementById('edit-request-price').value = priceValue;
            
            // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ÙØ¦Ø© - ØªØ­ÙˆÙŠÙ„ Ù…Ù† Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©
            let categoryValue = requestData.category || 'koshat';
            if (typeof categoryValue === 'string') {
                const categoryMap = {
                    'ÙƒÙˆØ´Ø§Øª': 'koshat',
                    'Ù…Ø±Ø§ÙŠØ§': 'mirr',
                    'ØªÙˆØ±ØªØ©': 'cake',
                    'Ø¯ÙŠÙƒÙˆØ±Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©': 'other',
                    'Ø¯Ø¹ÙˆØ§Øª ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª': 'invitations',
                    'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ù„ÙˆØ±Ø¯': 'flowerbouquets'
                };
                categoryValue = categoryMap[categoryValue] || categoryValue;
            }
            document.getElementById('edit-request-category').value = categoryValue;
            
            document.getElementById('edit-request-whatsapp').value = requestData.whatsapp || '';
            document.getElementById('edit-request-facebook').value = requestData.facebook || '';
            document.getElementById('edit-request-instagram').value = requestData.instagram || '';
            
            // Ù…Ù„Ø¡ Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ù„Ù„Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª
            if (categoryValue === 'flowerbouquets' && requestData.colors) {
                const colorFilterSection = document.getElementById('edit-request-color-filter-section');
                colorFilterSection.style.display = 'block';
                
                const colors = requestData.colors.split(',').map(color => color.trim()).filter(color => color);
                colors.forEach(color => {
                    const colorBtn = document.querySelector(`.edit-color-option-simple[data-color="${color}"]`);
                    if (colorBtn) {
                        colorBtn.classList.add('active');
                    }
                });
                updateEditRequestSelectedColorsDisplay();
            } else {
                const colorFilterSection = document.getElementById('edit-request-color-filter-section');
                colorFilterSection.style.display = 'none';
            }

            // Ù…Ù„Ø¡ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª
            let governorates = [];
            if (requestData.governorate && requestData.governorate !== 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯') {
                if (Array.isArray(requestData.governorate)) {
                    governorates = requestData.governorate;
                } else if (typeof requestData.governorate === 'string') {
                    try {
                        if (requestData.governorate.startsWith('[') && requestData.governorate.endsWith(']')) {
                            const parsed = JSON.parse(requestData.governorate);
                            if (Array.isArray(parsed)) {
                                governorates = parsed;
                            }
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for governorate, treating as regular string');
                    }
                    
                    if (governorates.length === 0) {
                        if (requestData.governorate.includes(',')) {
                            governorates = requestData.governorate.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (requestData.governorate !== 'null' && requestData.governorate !== '') {
                            governorates = [requestData.governorate];
                        }
                    }
                }
            }
            populateEditRequestGovernorates(governorates);

            // Ù…Ù„Ø¡ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ©
            let subcategories = [];
            if (requestData.subcategory && requestData.subcategory !== 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯') {
                if (Array.isArray(requestData.subcategory)) {
                    subcategories = requestData.subcategory;
                } else if (typeof requestData.subcategory === 'string') {
                    try {
                        const parsed = JSON.parse(requestData.subcategory);
                        if (Array.isArray(parsed)) {
                            subcategories = parsed;
                        } else {
                            subcategories = [parsed];
                        }
                    } catch (e) {
                        if (requestData.subcategory.includes(',')) {
                            subcategories = requestData.subcategory.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else {
                            subcategories = [requestData.subcategory];
                        }
                    }
                }
            }
            populateEditRequestSubcategories(requestData.category, subcategories);

            // Ù…Ù„Ø¡ Ø§Ù„Ù…Ø¯Ù†
            let cities = [];
            if (requestData.cities && requestData.cities !== 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯') {
                if (Array.isArray(requestData.cities)) {
                    cities = requestData.cities;
                } else if (typeof requestData.cities === 'string') {
                    try {
                        if (requestData.cities.startsWith('[') && requestData.cities.endsWith(']')) {
                            const parsed = JSON.parse(requestData.cities);
                            if (Array.isArray(parsed)) {
                                cities = parsed;
                            }
                        }
                    } catch (e) {
                        if (requestData.cities.includes(',')) {
                            cities = requestData.cities.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (requestData.cities !== 'null' && requestData.cities !== '') {
                            cities = [requestData.cities];
                        }
                    }
                }
            }
            populateEditRequestCities(governorates, cities);

            // Ø¹Ø±Ø¶ Ø§Ù„ØµÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠØ©
            let imageUrls = [];
            if (requestData.image_urls && requestData.image_urls.length > 0) {
                imageUrls = requestData.image_urls.map(img => img.url || img);
            }
            displayEditRequestCurrentImages(imageUrls);

            console.log('ðŸ” [DEBUG] ===== showEditRequestModal COMPLETED =====');

            // Ø¹Ø±Ø¶ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø©
            document.getElementById('editRequestModal').style.display = 'block';
            
            // ØªÙ‡ÙŠØ¦Ø© ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ø¹Ù†Ø¯ ÙØªØ­ Ø§Ù„Ù†Ø§ÙØ°Ø©
            setTimeout(() => {
                initializeEditRequestCitiesFilter();
                initializeEditRequestColorFilter();
            }, 100);
        }

        // Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø·Ù„Ø¨
        async function approveRequest(requestId) {

            try {
                if (!window.ProductRequestsService) {
                    console.error('ProductRequestsService not available');
                    return;
                }

                // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø£Ø­Ø¯Ø« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ (Ø¨Ø¹Ø¯ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª)
                const currentRequest = window.currentRequests.find(r => r.id == requestId);
                if (!currentRequest) {
                    alert('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                    return;
                }

                console.log('ðŸ” [DEBUG] Approving request with latest data:', currentRequest);

                const service = new window.ProductRequestsService();
                await service.ensureInitialized();

                // ØªÙ…Ø±ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø© Ù„Ù„Ù…ÙˆØ§ÙÙ‚Ø©
                const result = await service.approveProductRequest(requestId, currentRequest);
                if (result.success) {
                    // Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ù…Ø¨Ø§Ø´Ø±Ø©
                    loadProductRequests();
                    loadDashboardData();
                } else {
                    alert('Ø®Ø·Ø£ ÙÙŠ Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ù†ØªØ¬: ' + result.error);
                }
            } catch (error) {
                console.error('Error approving request:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ù†ØªØ¬');
            }
        }

        // Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨
        async function rejectRequest(requestId) {
            if (!confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬ØŸ')) {
                return;
            }
            
            try {
                if (!window.ProductRequestsService) {
                    console.error('ProductRequestsService not available');
                    return;
                }

                // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø£Ø­Ø¯Ø« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨ (Ø¨Ø¹Ø¯ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª)
                const currentRequest = window.currentRequests.find(r => r.id == requestId);
                if (!currentRequest) {
                    alert('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                    return;
                }

                console.log('ðŸ” [DEBUG] Rejecting request with latest data:', currentRequest);

                const service = new window.ProductRequestsService();
                await service.ensureInitialized();

                // ØªÙ…Ø±ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø© Ù„Ù„Ø±ÙØ¶
                const result = await service.rejectProductRequest(requestId, currentRequest);
                if (result.success) {
                    alert('ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬ Ø¨Ù†Ø¬Ø§Ø­');
                    // Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª
                    loadProductRequests();
                    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª
                    loadDashboardData();
                } else {
                    alert('Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬: ' + result.error);
                }
            } catch (error) {
                console.error('Error rejecting request:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬');
            }
        }

        // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù†Øµ Ø§Ù„Ø­Ø§Ù„Ø©
        function getStatusText(status) {
            const statusMap = {
                'pending': 'ÙÙŠ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±',
                'approved': 'ØªÙ…Øª Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©',
                'rejected': 'Ù…Ø±ÙÙˆØ¶',
                'processing': 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©',
                'completed': 'Ù…ÙƒØªÙ…Ù„'
            };
            return statusMap[status] || status;
        }

        // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ø³Ù… Ø§Ù„ØªØµÙ†ÙŠÙ
        function getCategoryName(category) {
            const categoryMap = {
                'koshat': 'ÙƒÙˆØ´Ø§Øª',
                'mirr': 'Ù…Ø±Ø§ÙŠØ§',
                'cake': 'ØªÙˆØ±ØªØ©',
                'other': 'Ø¯ÙŠÙƒÙˆØ±Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©',
                'invitations': 'Ø¯Ø¹ÙˆØ§Øª ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª',
                'flowerbouquets': 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ù„ÙˆØ±Ø¯'
            };
            return categoryMap[category] || category;
        }

        // ===== Ø¯ÙˆØ§Ù„ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ =====

        // Ù…Ù„Ø¡ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function populateEditRequestGovernorates(selectedGovernorates) {
            const governorates = [
                "ØªÙˆØµÙŠÙ„ Ù„ÙƒÙ„ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª","Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©","Ø§Ù„Ø¬ÙŠØ²Ø©","Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ©","Ø§Ù„Ø´Ø±Ù‚ÙŠØ©","Ø§Ù„ØºØ±Ø¨ÙŠØ©","Ø§Ù„Ù…Ù†ÙˆÙÙŠØ©","Ø§Ù„Ù‚Ù„ÙŠÙˆØ¨ÙŠØ©","Ø§Ù„Ø¨Ø­ÙŠØ±Ø©","ÙƒÙØ± Ø§Ù„Ø´ÙŠØ®","Ø¯Ù…ÙŠØ§Ø·","Ø§Ù„Ø¯Ù‚Ù‡Ù„ÙŠØ©","Ø§Ù„Ù…Ù†ÙŠØ§","Ø£Ø³ÙŠÙˆØ·","Ø³ÙˆÙ‡Ø§Ø¬","Ù‚Ù†Ø§","Ø§Ù„Ø£Ù‚ØµØ±","Ø£Ø³ÙˆØ§Ù†","Ø¨Ù†ÙŠ Ø³ÙˆÙŠÙ","Ø§Ù„ÙÙŠÙˆÙ…","Ø§Ù„ÙˆØ§Ø¯ÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯","Ø´Ù…Ø§Ù„ Ø³ÙŠÙ†Ø§Ø¡","Ø¬Ù†ÙˆØ¨ Ø³ÙŠÙ†Ø§Ø¡","Ø§Ù„Ø¨Ø­Ø± Ø§Ù„Ø£Ø­Ù…Ø±","Ù…Ø·Ø±ÙˆØ­","Ø¨ÙˆØ±Ø³Ø¹ÙŠØ¯","Ø§Ù„Ø¥Ø³Ù…Ø§Ø¹ÙŠÙ„ÙŠØ©","Ø§Ù„Ø³ÙˆÙŠØ³"
            ];
            
            let selected = [];
            if (selectedGovernorates && selectedGovernorates !== '' && selectedGovernorates !== 'null') {
                if (Array.isArray(selectedGovernorates)) {
                    selected = selectedGovernorates;
                } else if (typeof selectedGovernorates === 'string') {
                    try {
                        if (selectedGovernorates.startsWith('[') && selectedGovernorates.endsWith(']')) {
                            const parsed = JSON.parse(selectedGovernorates);
                            if (Array.isArray(parsed)) {
                                selected = parsed;
                            }
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for governorates, treating as regular string');
                    }
                    
                    if (selected.length === 0) {
                        if (selectedGovernorates.includes(',')) {
                            selected = selectedGovernorates.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (selectedGovernorates !== 'null' && selectedGovernorates !== '') {
                            selected = [selectedGovernorates];
                        }
                    }
                }
            }
            
            console.log('ðŸ” Processed selected governorates for edit:', selected);
            
            const container = document.getElementById('edit-request-governorate-checkboxes');
            if (container) {
                container.innerHTML = governorates.map(gov => `
                    <label style="display: flex; align-items: center; gap: 8px; padding: 5px; cursor: pointer;">
                        <input type="checkbox" value="${gov}" ${selected.includes(gov) ? 'checked' : ''} style="width: 16px; height: 16px;">
                        <span style="font-size: 14px;">${gov}</span>
                    </label>
                `).join('');

                // Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªÙ…Ø¹ÙŠ Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ù„ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø¯Ù† Ø¹Ù†Ø¯ ØªØºÙŠÙŠØ± Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª
                const governorateCheckboxes = container.querySelectorAll('input[type="checkbox"]');
                governorateCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const selectedGovernorates = [];
                        governorateCheckboxes.forEach(cb => {
                            if (cb.checked) {
                                selectedGovernorates.push(cb.value);
                            }
                        });
                        
                        // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø¯Ù† Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
                        populateEditRequestCities(selectedGovernorates, []);
                    });
                });
            } else {
                console.error('âŒ edit-request-governorate-checkboxes container not found');
            }
        }

        // Ù…Ù„Ø¡ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ© ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function populateEditRequestSubcategories(category, selectedSubcategory) {
            console.log('ðŸ” [DEBUG] ===== STARTING populateEditRequestSubcategories =====');
            console.log('ðŸ” [DEBUG] Category:', category);
            console.log('ðŸ” [DEBUG] Selected subcategory data:', selectedSubcategory);

            const subcategories = {
                'koshat': [
                    { value: 'ÙƒÙˆØ´Ø§Øª Ø²ÙØ§Ù', label: 'ÙƒÙˆØ´Ø§Øª Ø²ÙØ§Ù' },
                    { value: 'ÙƒÙˆØ´Ø§Øª Ø®Ø·ÙˆØ¨Ø©', label: 'ÙƒÙˆØ´Ø§Øª Ø®Ø·ÙˆØ¨Ø©' }
                ],
                'mirr': [
                    { value: 'Ù…Ø±Ø§ÙŠØ§ Ø²ÙØ§Ù', label: 'Ù…Ø±Ø§ÙŠØ§ Ø²ÙØ§Ù' },
                    { value: 'Ù…Ø±Ø§ÙŠØ§ Ø®Ø·ÙˆØ¨Ø©', label: 'Ù…Ø±Ø§ÙŠØ§ Ø®Ø·ÙˆØ¨Ø©' },
                    { value: 'Ù…Ø±Ø§ÙŠØ§ Ø¯ÙŠÙƒÙˆØ±', label: 'Ù…Ø±Ø§ÙŠØ§ Ø¯ÙŠÙƒÙˆØ±' }
                ],
                'cake': [
                    { value: 'ØªÙˆØ±ØªØ© Ø²ÙØ§Ù', label: 'ØªÙˆØ±ØªØ© Ø²ÙØ§Ù' },
                    { value: 'ØªÙˆØ±ØªØ© Ø®Ø·ÙˆØ¨Ø©', label: 'ØªÙˆØ±ØªØ© Ø®Ø·ÙˆØ¨Ø©' },
                    { value: 'ØªÙˆØ±ØªØ© Ø¹ÙŠØ¯ Ù…ÙŠÙ„Ø§Ø¯', label: 'ØªÙˆØ±ØªØ© Ø¹ÙŠØ¯ Ù…ÙŠÙ„Ø§Ø¯' },
                    { value: 'ØªÙˆØ±ØªØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©', label: 'ØªÙˆØ±ØªØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©' },
                    { value: 'ØªÙˆØ±ØªØ© ÙÙˆØ§ÙƒÙ‡', label: 'ØªÙˆØ±ØªØ© ÙÙˆØ§ÙƒÙ‡' },
                    { value: 'ØµÙŠÙ†ÙŠØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©', label: 'ØµÙŠÙ†ÙŠØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©' }
                ],
                'other': [
                    { value: 'Ø¯ÙŠÙƒÙˆØ± Ø¹ÙŠØ¯ Ù…ÙŠÙ„Ø§Ø¯', label: 'Ø¯ÙŠÙƒÙˆØ± Ø¹ÙŠØ¯ Ù…ÙŠÙ„Ø§Ø¯' },
                    { value: 'Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ù…ÙˆÙ„ÙˆØ¯ Ø¨Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰', label: 'Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ù…ÙˆÙ„ÙˆØ¯ Ø¨Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰' },
                    { value: 'Ø¯ÙŠÙƒÙˆØ± Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø¹Ø±ÙˆØ³Ø©', label: 'Ø¯ÙŠÙƒÙˆØ± Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø¹Ø±ÙˆØ³Ø©' },
                    { value: 'Ø¯ÙŠÙƒÙˆØ± Ø­ÙÙ„Ø§Øª Ø¨Ø³ÙŠØ·Ø©', label: 'Ø¯ÙŠÙƒÙˆØ± Ø­ÙÙ„Ø§Øª Ø¨Ø³ÙŠØ·Ø©' }
                ],
                'invitations': [
                    { value: 'Ø¯Ø¹ÙˆØ© Ø²ÙØ§Ù', label: 'Ø¯Ø¹ÙˆØ© Ø²ÙØ§Ù' },
                    { value: 'Ø¯Ø¹ÙˆØ© Ø®Ø·ÙˆØ¨Ø©', label: 'Ø¯Ø¹ÙˆØ© Ø®Ø·ÙˆØ¨Ø©' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª ÙØ±Ø­', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª ÙØ±Ø­' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø®Ø·ÙˆØ¨Ø©', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø®Ø·ÙˆØ¨Ø©' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø¨Ø§Ù„Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø¨Ø§Ù„Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø¨Ø§Ù„Ø¹Ø·ÙˆØ± / Ø§Ù„Ø¨Ø±ÙØ§Ù†', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø¨Ø§Ù„Ø¹Ø·ÙˆØ± / Ø§Ù„Ø¨Ø±ÙØ§Ù†' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ù…Ø¹ Ù‡Ø¯ÙŠØ© ØµØºÙŠØ±Ù‡', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ù…Ø¹ Ù‡Ø¯ÙŠØ© ØµØºÙŠØ±Ù‡' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø³Ø¨ÙˆØ¹', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø³Ø¨ÙˆØ¹' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø£Ø·ÙØ§Ù„', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø£Ø·ÙØ§Ù„' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª ÙˆØ±Ø¯', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª ÙˆØ±Ø¯' },
                    { value: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø´Ù…ÙˆØ¹', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø´Ù…ÙˆØ¹' },
                    { value: 'Ø¯Ø¹ÙˆØ© Ø±Ù‚Ù…ÙŠØ©', label: 'Ø¯Ø¹ÙˆØ© Ø±Ù‚Ù…ÙŠØ©' }
                ],
                'flowerbouquets': [
                                { value: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø·Ø¨ÙŠØ¹ÙŠØ©', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø·Ø¨ÙŠØ¹ÙŠØ©' },
            { value: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª ØµÙ†Ø§Ø¹ÙŠØ©', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª ØµÙ†Ø§Ø¹ÙŠØ©' },
            { value: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ø³ØªØ§Ù†Ø¯', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ø³ØªØ§Ù†Ø¯' },
            { value: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ù…Ø¬ÙÙØ©', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ù…Ø¬ÙÙØ©' },
            { value: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ù…Ø´ÙƒÙ„Ø©', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ù…Ø´ÙƒÙ„Ø©' }
                ]
            };
            
            const categorySubs = subcategories[category] || [];
            
            let selected = [];
            if (selectedSubcategory && selectedSubcategory !== '' && selectedSubcategory !== 'null') {
                if (Array.isArray(selectedSubcategory)) {
                    selected = selectedSubcategory;
                } else if (typeof selectedSubcategory === 'string') {
                    try {
                        const parsed = JSON.parse(selectedSubcategory);
                        if (Array.isArray(parsed)) {
                            selected = parsed;
                        } else {
                            selected = [parsed];
                        }
                    } catch (e) {
                        if (selectedSubcategory.includes(',')) {
                            selected = selectedSubcategory.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else {
                            selected = [selectedSubcategory];
                        }
                    }
                }
            }
            
            console.log('ðŸ” Processed selected subcategories for edit:', selected);
            
            const container = document.getElementById('edit-request-subcategory-checkboxes');
            if (container) {
                container.innerHTML = categorySubs.map(sub => {
                    const isChecked = selected.includes(sub.value);
                    return `
                        <label style="display: flex; align-items: center; gap: 8px; padding: 5px; cursor: pointer;">
                            <input type="checkbox" value="${sub.value}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px;">
                            <span style="font-size: 14px;">${sub.label}</span>
                        </label>
                    `;
                }).join('');
                console.log('ðŸ” [DEBUG] âœ… Successfully populated subcategory checkboxes for edit');
            } else {
                console.error('ðŸ” [DEBUG] âŒ edit-request-subcategory-checkboxes container not found');
            }
        }

        // Ù…Ø¹Ø§Ù„Ø¬Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
        async function handleLogout() {
            try {
                // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ adminSecurity
                while (!window.adminSecurity) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                console.log('ðŸ”„ Ø¨Ø¯Ø¡ Ø¹Ù…Ù„ÙŠØ© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬...');
                await adminSecurity.logout();
            } catch (error) {
                console.error('âŒ Ø®Ø·Ø£ ÙÙŠ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬:', error);
                // Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± ÙÙŠ Ø­Ø§Ù„Ø© Ø§Ù„Ø®Ø·Ø£
                window.location.href = 'admin-login.html';
            }
        }

        // ===== Ø¨Ø§Ù‚ÙŠ Ø¯ÙˆØ§Ù„ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ =====

        // Ù…Ù„Ø¡ Ø§Ù„Ù…Ø¯Ù† ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function populateEditRequestCities(selectedGovernorates, currentCities) {
            console.log('ðŸ” PopulateEditRequestCities called with:', { selectedGovernorates, currentCities });
            
            const citiesList = document.getElementById('edit-request-cities-list');
            const citiesTrigger = document.getElementById('edit-request-cities-trigger');
            const citiesSearch = document.getElementById('edit-request-cities-search');

            if (!citiesList || !citiesTrigger || !citiesSearch) {
                console.error('âŒ Cities elements not found in populateEditRequestCities');
                return;
            }

            // Ù…Ø³Ø­ Ø§Ù„Ø§Ø®ØªÙŠØ§Ø±Ø§Øª Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©
            if (typeof editRequestSelectedCities !== 'undefined') {
                editRequestSelectedCities.clear();
            }

            if (!selectedGovernorates || selectedGovernorates.length === 0) {
                // Ø¥Ø®ÙØ§Ø¡ ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ø¥Ø°Ø§ Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ù…Ø­Ø§ÙØ¸Ø§Øª
                citiesList.innerHTML = '<div style="padding: 16px; text-align: center; color: #666;">Ø§Ø®ØªØ± Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø£ÙˆÙ„Ø§Ù‹</div>';
                updateEditRequestCitiesDisplay();
                return;
            }

            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø¯Ù† Ù„Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
            let allCities = [];
            selectedGovernorates.forEach(governorate => {
                if (typeof editRequestCitiesService !== 'undefined' && editRequestCitiesService.getCitiesForGovernorate) {
                    const cities = editRequestCitiesService.getCitiesForGovernorate(governorate);
                    allCities = allCities.concat(cities);
                }
            });

            // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØªÙƒØ±Ø§Ø±
            allCities = [...new Set(allCities)];

            // ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ø­Ø§Ù„ÙŠØ©
            let currentCitiesArray = [];
            if (currentCities) {
                if (Array.isArray(currentCities)) {
                    currentCitiesArray = currentCities;
                } else if (typeof currentCities === 'string') {
                    try {
                        if (currentCities.startsWith('[') && currentCities.endsWith(']')) {
                            const parsed = JSON.parse(currentCities);
                            if (Array.isArray(parsed)) {
                                currentCitiesArray = parsed;
                            }
                        }
                    } catch (e) {
                        if (currentCities.includes(',')) {
                            currentCitiesArray = currentCities.split(',').map(c => c.trim()).filter(c => c && c !== 'null' && c !== '');
                        } else if (currentCities !== 'null' && currentCities !== '') {
                            currentCitiesArray = [currentCities];
                        }
                    }
                }
            }

            console.log('ðŸ” All cities for governorates:', allCities);
            console.log('ðŸ” Current cities array:', currentCitiesArray);

            // Ù…Ù„Ø¡ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø¯Ù†
            citiesList.innerHTML = allCities.map(city => `
                <div class="city-item" style="padding: 8px 16px; cursor: pointer; transition: background-color 0.3s ease;">
                    <label class="city-checkbox" style="display: flex; align-items: center; gap: 8px; cursor: pointer; width: 100%;">
                        <input type="checkbox" value="${city}" class="city-input" style="width: 16px; height: 16px; accent-color: #3b82f6;" ${currentCitiesArray.includes(city) ? 'checked' : ''}>
                        <span class="city-name" style="color: #374151; font-size: 14px; flex: 1;">${city}</span>
                    </label>
                </div>
            `).join('');

            // Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªÙ…Ø¹ÙŠ Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ù„Ù„ØµÙ†Ø§Ø¯ÙŠÙ‚ Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©
            const cityCheckboxes = document.querySelectorAll('#edit-request-cities-list .city-input');
            cityCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (typeof editRequestSelectedCities !== 'undefined') {
                        if (this.checked) {
                            editRequestSelectedCities.add(this.value);
                        } else {
                            editRequestSelectedCities.delete(this.value);
                        }
                        updateEditRequestCitiesDisplay();
                    }
                });
                
                // ØªÙ‡ÙŠØ¦Ø© Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
                if (checkbox.checked && typeof editRequestSelectedCities !== 'undefined') {
                    editRequestSelectedCities.add(checkbox.value);
                }
            });

            // Ù…Ø³Ø­ Ø§Ù„Ø¨Ø­Ø«
            citiesSearch.value = '';
            
            // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¹Ø±Ø¶
            if (typeof updateEditRequestCitiesDisplay === 'function') {
                updateEditRequestCitiesDisplay();
            }
        }

        // Ø¹Ø±Ø¶ Ø§Ù„ØµÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠØ© ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function displayEditRequestCurrentImages(imageUrls) {
            const container = document.getElementById('edit-request-current-images');
            
            if (imageUrls.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 14px;">Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±</p>';
                const instructions = document.querySelector('.image-sort-instructions-edit');
                if (instructions) {
                    instructions.style.display = 'block';
                }
                return;
            }

            container.innerHTML = imageUrls.map((url, index) => `
                <div class="edit-image-item" data-index="${index}" draggable="true" style="position: relative; display: inline-block; margin: 5px; cursor: grab; transition: all 0.3s ease;">
                    <div class="edit-drag-handle" style="position: absolute; top: 2px; left: 2px; background: rgba(0, 0, 0, 0.7); color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; cursor: grab; z-index: 10; font-size: 10px;">
                        â‹®â‹®
                    </div>
                    <img src="${url}" alt="ØµÙˆØ±Ø© ${index + 1}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e1e5e9; cursor: pointer;" onclick="previewEditRequestImage('${url}')">
                    <div class="edit-image-number" style="position: absolute; bottom: 2px; left: 2px; background: #d4af37; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; z-index: 10;">
                        ${index + 1}
                    </div>
                    <button onclick="removeEditRequestImage(${index})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">Ã—</button>
                </div>
            `).join('');

            // Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªÙ…Ø¹ÙŠ Ø£Ø­Ø¯Ø§Ø« Ø§Ù„Ø³Ø­Ø¨ ÙˆØ§Ù„Ø¥ÙÙ„Ø§Øª
            const imageItems = container.querySelectorAll('.edit-image-item');
            imageItems.forEach(item => {
                item.addEventListener('dragstart', handleEditRequestDragStart);
                item.addEventListener('dragover', handleEditRequestDragOver);
                item.addEventListener('drop', handleEditRequestDrop);
                item.addEventListener('dragenter', handleEditRequestDragEnter);
                item.addEventListener('dragleave', handleEditRequestDragLeave);
            });

            // Ø¥Ø®ÙØ§Ø¡ Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø¹Ù†Ø¯ ÙˆØ¬ÙˆØ¯ ØµÙˆØ±
            const instructions = document.querySelector('.image-sort-instructions-edit');
            if (instructions) {
                instructions.style.display = 'none';
            }
        }

        // Ù…Ø¹Ø§ÙŠÙ†Ø© ØµÙˆØ±Ø© ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function previewEditRequestImage(url) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                cursor: pointer;
            `;
            
            const img = document.createElement('img');
            img.src = url;
            img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
            `;
            
            modal.appendChild(img);
            document.body.appendChild(modal);
            
            modal.onclick = () => {
                document.body.removeChild(modal);
            };
        }

        // Ø­Ø°Ù ØµÙˆØ±Ø© Ù…Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function removeEditRequestImage(index) {
            if (confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„ØµÙˆØ±Ø©ØŸ')) {
                const requestId = document.getElementById('edit-request-id').value;
                const request = window.currentRequests.find(r => r.id == requestId);
                
                if (request && request.image_urls) {
                    request.image_urls.splice(index, 1);
                    displayEditRequestCurrentImages(request.image_urls);
                    alert('ØªÙ… Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø©');
                }
            }
        }

        // Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø³Ø­Ø¨ ÙˆØ§Ù„Ø¥ÙÙ„Ø§Øª Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        let editRequestDraggedElement = null;
        let editRequestDraggedIndex = null;

        // Ø¯ÙˆØ§Ù„ Ø§Ù„Ø³Ø­Ø¨ ÙˆØ§Ù„Ø¥ÙÙ„Ø§Øª Ù„ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ± ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function handleEditRequestDragStart(e) {
            editRequestDraggedElement = this;
            editRequestDraggedIndex = parseInt(this.getAttribute('data-index'));
            this.classList.add('dragging');
            this.style.opacity = '0.5';
            this.style.transform = 'rotate(5deg)';
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleEditRequestDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleEditRequestDragEnter(e) {
            e.preventDefault();
            this.classList.add('drag-over');
            this.style.border = '2px dashed #d4af37';
            this.style.background = 'rgba(212, 175, 55, 0.1)';
        }

        function handleEditRequestDragLeave(e) {
            this.classList.remove('drag-over');
            this.style.border = '';
            this.style.background = '';
        }

        function handleEditRequestDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            this.style.border = '';
            this.style.background = '';
            
            if (editRequestDraggedElement !== this) {
                const dropIndex = parseInt(this.getAttribute('data-index'));
                const requestId = document.getElementById('edit-request-id').value;
                const request = window.currentRequests.find(r => r.id == requestId);
                
                if (request && request.image_urls) {
                    // Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ Ù…ØµÙÙˆÙØ© Ø§Ù„ØµÙˆØ±
                    const draggedImage = request.image_urls[editRequestDraggedIndex];
                    request.image_urls.splice(editRequestDraggedIndex, 1);
                    request.image_urls.splice(dropIndex, 0, draggedImage);
                    
                    // Ø¥Ø¹Ø§Ø¯Ø© Ø¹Ø±Ø¶ Ø§Ù„ØµÙˆØ± Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨ Ø§Ù„Ø¬Ø¯ÙŠØ¯
                    displayEditRequestCurrentImages(request.image_urls);
                    
                    // Ø¹Ø±Ø¶ Ø±Ø³Ø§Ù„Ø© Ù†Ø¬Ø§Ø­
                    showEditRequestSortSuccess();
                }
            }
            
            editRequestDraggedElement.classList.remove('dragging');
            editRequestDraggedElement.style.opacity = '';
            editRequestDraggedElement.style.transform = '';
            editRequestDraggedElement = null;
            editRequestDraggedIndex = null;
        }

        function showEditRequestSortSuccess() {
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 3000;
                display: flex;
                align-items: center;
                font-size: 14px;
            `;
            message.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-left: 8px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                ØªÙ… ØªØºÙŠÙŠØ± ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ± Ø¨Ù†Ø¬Ø§Ø­
            `;
            
            document.body.appendChild(message);
            
            // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø¨Ø¹Ø¯ 3 Ø«ÙˆØ§Ù†Ù
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }

        // Ø¥ØºÙ„Ø§Ù‚ Ù†Ø§ÙØ°Ø© ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
        function closeEditRequestModal() {
            document.getElementById('editRequestModal').style.display = 'none';
        }

        // Ù…ØªØºÙŠØ±Ø§Øª ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        let editRequestCitiesService;
        let editRequestSelectedCities = new Set();
        let editRequestCurrentGovernorates = [];

        // ØªÙ‡ÙŠØ¦Ø© ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function initializeEditRequestCitiesFilter() {
            console.log('ðŸ” Initializing Edit Request Cities Filter');
            
            // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªÙˆÙØ± CitiesService
            if (typeof CitiesService === 'undefined') {
                console.error('âŒ CitiesService not available');
                return;
            }
            
            // ØªÙ‡ÙŠØ¦Ø© CitiesService
            editRequestCitiesService = new CitiesService();
            console.log('âœ… CitiesService initialized for edit request');
            
            // Ø¥Ø¹Ø¯Ø§Ø¯ ÙˆØ¸Ø§Ø¦Ù ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù†
            setupEditRequestCitiesFilter();
        }

        // Ø¥Ø¹Ø¯Ø§Ø¯ ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function setupEditRequestCitiesFilter() {
            const citiesTrigger = document.getElementById('edit-request-cities-trigger');
            const citiesDropdown = document.getElementById('edit-request-cities-dropdown');
            const citiesSearch = document.getElementById('edit-request-cities-search');
            const selectAllCitiesBtn = document.getElementById('edit-request-select-all-cities-btn');
            const clearAllCitiesBtn = document.getElementById('edit-request-clear-all-cities-btn');
            const applyCitiesFilterBtn = document.getElementById('edit-request-apply-cities-filter');

            // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ø§Ù„Ø¹Ù†Ø§ØµØ±
            if (!citiesTrigger || !citiesDropdown || !citiesSearch || !selectAllCitiesBtn || !clearAllCitiesBtn || !applyCitiesFilterBtn) {
                console.error('âŒ Cities filter elements not found for edit request');
                return;
            }
            
            console.log('âœ… All cities filter elements found for edit request');

            // ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù†Ø³Ø¯Ù„Ø©
            citiesTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('ðŸ” Cities trigger clicked for edit request');
                citiesDropdown.classList.toggle('show');
                citiesTrigger.classList.toggle('active');
            });

            // Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø¹Ù†Ø¯ Ø§Ù„Ù†Ù‚Ø± Ø®Ø§Ø±Ø¬Ù‡Ø§
            document.addEventListener('click', function(event) {
                if (!citiesTrigger.contains(event.target) && !citiesDropdown.contains(event.target)) {
                    citiesDropdown.classList.remove('show');
                    citiesTrigger.classList.remove('active');
                }
            });

            // ÙˆØ¸ÙŠÙØ© Ø§Ù„Ø¨Ø­Ø«
            citiesSearch.addEventListener('input', function() {
                filterEditRequestCities(this.value);
            });

            // ØªØ­Ø¯ÙŠØ¯ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø¯Ù†
            selectAllCitiesBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('#edit-request-cities-list .city-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    editRequestSelectedCities.add(checkbox.value);
                });
                updateEditRequestCitiesDisplay();
            });

            // Ø¥Ù„ØºØ§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø¯Ù†
            clearAllCitiesBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('#edit-request-cities-list .city-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                editRequestSelectedCities.clear();
                updateEditRequestCitiesDisplay();
            });

            // ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ÙÙ„ØªØ±
            applyCitiesFilterBtn.addEventListener('click', function() {
                citiesDropdown.classList.remove('show');
                citiesTrigger.classList.remove('active');
            });
        }

        // ØªØµÙÙŠØ© Ø§Ù„Ù…Ø¯Ù† Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù…ØµØ·Ù„Ø­ Ø§Ù„Ø¨Ø­Ø«
        function filterEditRequestCities(searchTerm) {
            const cityItems = document.querySelectorAll('#edit-request-cities-list .city-item');
            
            cityItems.forEach(item => {
                const cityName = item.querySelector('.city-name').textContent.toLowerCase();
                const matches = cityName.includes(searchTerm.toLowerCase());
                item.style.display = matches ? 'block' : 'none';
            });
        }

        // ØªØ­Ø¯ÙŠØ« Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø¯Ù†
        function updateEditRequestCitiesDisplay() {
            const selectedCount = document.getElementById('edit-request-cities-selected-count');
            const selectedCitiesContainer = document.getElementById('edit-request-selected-cities');
            const triggerText = document.querySelector('#edit-request-cities-trigger .trigger-text');

            // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¹Ø¯Ø¯
            if (editRequestSelectedCities.size === 0) {
                selectedCount.style.display = 'none';
                triggerText.textContent = 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ù†Ø§Ø·Ù‚/Ø§Ù„Ù…Ø¯Ù† (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)';
            } else {
                selectedCount.style.display = 'inline-block';
                selectedCount.textContent = editRequestSelectedCities.size;
                triggerText.textContent = `${editRequestSelectedCities.size} Ù…Ù†Ø·Ù‚Ø© Ù…Ø®ØªØ§Ø±Ø©`;
            }

            // ØªØ­Ø¯ÙŠØ« Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
            if (editRequestSelectedCities.size === 0) {
                selectedCitiesContainer.innerHTML = '';
            } else {
                selectedCitiesContainer.innerHTML = Array.from(editRequestSelectedCities).map(city => `
                    <div class="selected-city-tag" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 500;">
                        ${city}
                        <button class="remove-city" onclick="removeEditRequestCity('${city}')" style="background: none; border: none; color: #1e40af; cursor: pointer; font-size: 14px; font-weight: bold; padding: 0; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background-color 0.3s ease;">Ã—</button>
                    </div>
                `).join('');
            }
        }

        // Ø¥Ø²Ø§Ù„Ø© Ù…Ø¯ÙŠÙ†Ø© Ù…Ø­Ø¯Ø¯Ø©
        function removeEditRequestCity(city) {
            editRequestSelectedCities.delete(city);
            
            // Ø¥Ù„ØºØ§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„
            const checkbox = document.querySelector(`#edit-request-cities-list .city-input[value="${city}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            updateEditRequestCitiesDisplay();
        }

        // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© Ù„ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù†Ù…ÙˆØ°Ø¬
        function getEditRequestSelectedCities() {
            return Array.from(editRequestSelectedCities);
        }

        // ===== Ø¯Ø§Ù„Ø© Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª =====

        // Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª ÙÙŠ Ø§Ù„Ø·Ù„Ø¨
        async function saveEditRequestChanges() {
            const requestId = document.getElementById('edit-request-id').value;
            
            if (!requestId) {
                alert('Ø®Ø·Ø£ ÙÙŠ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨');
                return;
            }

            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ù…ÙˆØ°Ø¬
            const description = document.getElementById('edit-request-description').value;
            const price = document.getElementById('edit-request-price').value;
            const category = document.getElementById('edit-request-category').value;
            const whatsapp = document.getElementById('edit-request-whatsapp').value;
            const facebook = document.getElementById('edit-request-facebook').value;
            const instagram = document.getElementById('edit-request-instagram').value;

            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
            const selectedGovernorates = [];
            document.querySelectorAll('#edit-request-governorate-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                selectedGovernorates.push(checkbox.value);
            });

            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
            const selectedSubcategories = [];
            document.querySelectorAll('#edit-request-subcategory-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                selectedSubcategories.push(checkbox.value);
            });

            console.log('ðŸ” Saving selected subcategories for edit:', selectedSubcategories);

            // Ø­ÙØ¸ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ© ÙƒÙ€ array Ù…Ø¨Ø§Ø´Ø±Ø©
            let subcategoryValue = null;
            if (selectedSubcategories.length > 0) {
                subcategoryValue = selectedSubcategories;
                console.log('ðŸ” Subcategory array value for edit:', subcategoryValue);
            }

            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
            const selectedCitiesArray = getEditRequestSelectedCities();
            
            // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
            const selectedColors = [];
            document.querySelectorAll('.edit-color-option-simple.active').forEach(btn => {
                selectedColors.push(btn.dataset.color);
            });

            // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
            if (!description.trim()) {
                alert('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ÙˆØµÙ Ø§Ù„Ù…Ù†ØªØ¬');
                return;
            }

            if (selectedGovernorates.length === 0) {
                alert('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ø­Ø§ÙØ¸Ø© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }

            try {
                // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ø­Ø§Ù„ÙŠ Ù„Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ±
                const currentRequest = window.currentRequests.find(r => r.id == requestId);
                
                // Ø¥Ø¹Ø¯Ø§Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ­Ø¯ÙŠØ«
                const updateData = {
                    description: description,
                    price: price || null,
                    category: category,
                    subcategory: subcategoryValue,
                    governorate: selectedGovernorates.join(', '),
                    cities: selectedCitiesArray.length > 0 ? selectedCitiesArray.join(', ') : null,
                    whatsapp: whatsapp,
                    facebook: facebook || null,
                    instagram: instagram || null,
                    colors: selectedColors.length > 0 ? selectedColors.join(', ') : null,
                    // Ø§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ± Ø§Ù„Ù…ÙØ¹Ø¯Ù„ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ÙˆØ¬ÙˆØ¯Ø©
                    image_urls: currentRequest && currentRequest.image_urls ? currentRequest.image_urls : null,
                    updated_at: new Date().toISOString()
                };

                // Ø¥Ø²Ø§Ù„Ø© Ø¹Ù…ÙˆØ¯ colors Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† Ø§Ù„ØªØµÙ†ÙŠÙ flowerbouquets
                if (category !== 'flowerbouquets' && updateData.colors !== undefined) {
                    delete updateData.colors;
                    console.log('ðŸ” Removed colors field for non-flowerbouquets category in request update');
                }

                console.log('ðŸ” [DEBUG] ===== saveEditRequestChanges - UPDATE DATA =====');
                console.log('ðŸ” [DEBUG] Request ID:', requestId);
                console.log('ðŸ” [DEBUG] Selected subcategories array:', selectedSubcategories);
                console.log('ðŸ” [DEBUG] Subcategory JSON value:', subcategoryValue);
                console.log('ðŸ” [DEBUG] Full update data:', updateData);

                // ØªØ­Ø¯ÙŠØ« ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                const { error } = await window.supabaseClient
                    .from('product_requests')
                    .update(updateData)
                    .eq('id', requestId);

                if (error) {
                    throw error;
                }

                console.log('ðŸ” [DEBUG] âœ… Database update successful for request:', requestId);

                // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…ØµÙÙˆÙØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ© Ø¨ØªÙ†Ø³ÙŠÙ‚ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ØªØ³Ù‚
                const requestIndex = window.currentRequests.findIndex(r => r.id == requestId);
                if (requestIndex !== -1) {
                    // Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„ÙØ±Ø¹ÙŠ Ù…Ø­ÙÙˆØ¸ ÙƒÙ€ array Ù…Ø¨Ø§Ø´Ø±Ø©
                    let parsedSubcategory = subcategoryValue;
                    console.log('ðŸ” [DEBUG] Subcategory for local storage:', parsedSubcategory);

                    const oldRequest = window.currentRequests[requestIndex];
                    
                    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø¹ Ø§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯Ø©
                    window.currentRequests[requestIndex] = {
                        ...window.currentRequests[requestIndex],
                        description: updateData.description,
                        price: updateData.price,
                        category: updateData.category,
                        subcategory: parsedSubcategory,
                        governorate: updateData.governorate,
                        cities: updateData.cities,
                        whatsapp: updateData.whatsapp,
                        facebook: updateData.facebook,
                        instagram: updateData.instagram,
                        image_urls: updateData.image_urls,
                        updated_at: updateData.updated_at
                    };

                    console.log('ðŸ” [DEBUG] Updated local request data:', {
                        requestId: requestId,
                        oldSubcategory: oldRequest.subcategory,
                        newSubcategory: parsedSubcategory,
                        updateData: updateData
                    });
                } else {
                    console.log('ðŸ” [DEBUG] âš ï¸ Request not found in local array for update');
                }

                alert('ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­');
                closeEditRequestModal();

                // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¹Ø±Ø¶ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙØ¹Ø¯Ù„Ø©
                console.log('ðŸ”„ Refreshing display after request update...');
                await loadProductRequests(); // Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª

                console.log('âœ… Request update completed - Subcategories should now display correctly in request cards');

            } catch (error) {
                console.error('Error updating request:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù„Ø¨: ' + error.message);
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù†Ø¯ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©
        document.addEventListener('DOMContentLoaded', async function() {
            // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ Supabase
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Loading dashboard data...');
            await loadUserInfo();
            await loadDashboardData();
            await loadRecentActivity();

            // ===== Ø±Ø¨Ø· Ù†Ù…ÙˆØ°Ø¬ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ =====
            
            // Ø±Ø¨Ø· ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù†Ù…ÙˆØ°Ø¬
            const editRequestForm = document.getElementById('editRequestForm');
            if (editRequestForm) {
                editRequestForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    await saveEditRequestChanges();
                });
            }

            // ØªØºÙŠÙŠØ± Ø§Ù„ÙØ¦Ø© ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
            const editRequestCategory = document.getElementById('edit-request-category');
            if (editRequestCategory) {
                editRequestCategory.addEventListener('change', function() {
                    populateEditRequestSubcategories(this.value, []);
                    
                    // Show/hide color filter for flowerbouquets
                    const colorFilterSection = document.getElementById('edit-request-color-filter-section');
                    if (this.value === 'flowerbouquets') {
                        colorFilterSection.style.display = 'block';
                    } else {
                        colorFilterSection.style.display = 'none';
                        // Clear selected colors
                        document.querySelectorAll('.edit-color-option-simple').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        document.getElementById('edit-request-selected-colors-simple').innerHTML = '';
                    }
                });
            }

            // Ø±ÙØ¹ Ø§Ù„ØµÙˆØ± ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
            const editRequestImageUploadArea = document.getElementById('edit-request-image-upload-area');
            const editRequestNewImagesInput = document.getElementById('edit-request-new-images');
            
            if (editRequestImageUploadArea && editRequestNewImagesInput) {
                editRequestImageUploadArea.addEventListener('click', () => editRequestNewImagesInput.click());
                
                editRequestNewImagesInput.addEventListener('change', function(e) {
                    handleEditRequestNewImages(e.target.files);
                });
            }

            // Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù†ÙˆØ§ÙØ° Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø© Ø¹Ù†Ø¯ Ø§Ù„Ù†Ù‚Ø± Ø®Ø§Ø±Ø¬Ù‡Ø§
            window.onclick = function(event) {
                const editRequestModal = document.getElementById('editRequestModal');
                
                if (event.target === editRequestModal) {
                    closeEditRequestModal();
                }
            }

            // ØªÙ‡ÙŠØ¦Ø© ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ø¹Ù†Ø¯ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©
            console.log('ðŸ” DOM Content Loaded - Initializing cities filter for edit request');
            setTimeout(() => {
                initializeEditRequestCitiesFilter();
            }, 100);
        });

        // ===== Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØµÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„ =====

        // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØµÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function handleEditRequestNewImages(files) {
            const container = document.getElementById('edit-request-current-images');
            
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imgDiv = document.createElement('div');
                        imgDiv.style.cssText = `
                            position: relative;
                            display: inline-block;
                            margin: 5px;
                        `;
                        imgDiv.innerHTML = `
                            <img src="${e.target.result}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e1e5e9; cursor: pointer;" onclick="previewEditRequestImage('${e.target.result}')">
                            <button onclick="this.parentElement.remove()" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">Ã—</button>
                        `;
                        container.appendChild(imgDiv);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙƒÙ„ 5 Ø¯Ù‚Ø§Ø¦Ù‚
        setInterval(async function() {
            console.log('Refreshing dashboard data...');
            await loadDashboardData();
            await loadRecentActivity();
        }, 5 * 60 * 1000);

        // ØªÙ‡ÙŠØ¦Ø© ÙÙ„ØªØ± Ø§Ù„Ù…Ø¯Ù† Ø¹Ù†Ø¯ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù†Ø§ÙØ°Ø©
        window.addEventListener('load', function() {
            console.log('ðŸ” Window Loaded - Initializing cities filter for edit request');
            setTimeout(() => {
                initializeEditRequestCitiesFilter();
                initializeEditRequestColorFilter();
            }, 200);
        });
        
        // ØªÙ‡ÙŠØ¦Ø© ÙÙ„ØªØ± Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function initializeEditRequestColorFilter() {
            const colorButtons = document.querySelectorAll('.edit-color-option-simple');
            const selectedColorsDiv = document.getElementById('edit-request-selected-colors-simple');
            let selectedColors = [];

            function updateEditRequestSelectedColorsDisplay() {
                if (!selectedColorsDiv) return;
                selectedColorsDiv.innerHTML = '';
                selectedColors.forEach(color => {
                    const tag = document.createElement('span');
                    tag.className = 'selected-tag';
                    tag.innerHTML = getEditRequestColorLabel(color) +
                        `<button type="button" class="remove-tag" data-color="${color}">Ã—</button>`;
                    selectedColorsDiv.appendChild(tag);
                });
            }

            function getEditRequestColorLabel(color) {
                const labels = {
                    'red': 'Ø£Ø­Ù…Ø±',
                    'pink': 'ÙˆØ±Ø¯ÙŠ',
                    'white': 'Ø£Ø¨ÙŠØ¶',
                    'yellow': 'Ø£ØµÙØ±',
                    'purple': 'Ø¨Ù†ÙØ³Ø¬ÙŠ',
                    'orange': 'Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ',
                    'blue': 'Ø£Ø²Ø±Ù‚',
                    'mixed': 'Ù…Ø®ØªÙ„Ø·'
                };
                return labels[color] || color;
            }

            colorButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const color = this.dataset.color;
                    if (selectedColors.includes(color)) {
                        selectedColors = selectedColors.filter(c => c !== color);
                        this.classList.remove('active');
                    } else {
                        selectedColors.push(color);
                        this.classList.add('active');
                    }
                    updateEditRequestSelectedColorsDisplay();
                });
            });

            if (selectedColorsDiv) {
                selectedColorsDiv.addEventListener('click', function(e) {
                    if (e.target.classList.contains('remove-tag')) {
                        const color = e.target.dataset.color;
                        selectedColors = selectedColors.filter(c => c !== color);
                        colorButtons.forEach(btn => {
                            if (btn.dataset.color === color) btn.classList.remove('active');
                        });
                        updateEditRequestSelectedColorsDisplay();
                    }
                });
            }
            
            // Ø¬Ø¹Ù„ Ø§Ù„Ø¯Ø§Ù„Ø© Ù…ØªØ§Ø­Ø© Ø¹Ø§Ù„Ù…ÙŠØ§Ù‹
            window.updateEditRequestSelectedColorsDisplay = updateEditRequestSelectedColorsDisplay;
        }

        // ===== Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯ =====
        
        // ØªØ¹Ø±ÙŠÙ Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©
        const ADMIN_ROUTES = {
            'dashboard': {
                title: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
                handler: showDashboardHome
            },
            'advertising': {
                title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª',
                handler: showAdvertisingPanel
            },
            'product-requests': {
                title: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
                handler: showProductRequests
            },
            'reports': {
                title: 'Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±',
                handler: showReports
            }
        };
        
        // ØªØ­Ø¯ÙŠØ« URL Ø¨Ø¯ÙˆÙ† Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©
        function updateURL(route) {
            try {
                const newURL = `/admin/${route === 'dashboard' ? '' : route}`;
                window.history.pushState({ route }, ADMIN_ROUTES[route]?.title || 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', newURL);
                console.log(`ØªÙ… ØªØ­Ø¯ÙŠØ« URL Ø¥Ù„Ù‰: ${newURL}`);
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« URL:', error);
            }
        }
        
        // Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ ÙÙŠ localStorage
        function saveCurrentRoute(route) {
            try {
                localStorage.setItem('adminCurrentRoute', route);
                localStorage.setItem('adminRouteTimestamp', Date.now().toString());
                console.log(`ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø±: ${route}`);
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø±:', error);
            }
        }
        
        // Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø­ÙÙˆØ¸
        function restoreRoute() {
            try {
                // Ø£ÙˆÙ„Ø§Ù‹: Ù…Ø­Ø§ÙˆÙ„Ø© Ù‚Ø±Ø§Ø¡Ø© Ù…Ù† URL
                const path = window.location.pathname;
                let route = 'dashboard';
                
                if (path.includes('/admin/')) {
                    const routePart = path.split('/admin/')[1];
                    if (routePart && ADMIN_ROUTES[routePart]) {
                        route = routePart;
                    }
                }
                
                // Ø¥Ø°Ø§ ÙƒØ§Ù† URL Ù„Ø§ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ù…Ø³Ø§Ø± Ù…Ø­Ø¯Ø¯ØŒ Ø§Ø³ØªØ®Ø¯Ù… localStorage
                if (route === 'dashboard') {
                    const savedRoute = localStorage.getItem('adminCurrentRoute');
                    const timestamp = localStorage.getItem('adminRouteTimestamp');
                    
                    if (savedRoute && timestamp) {
                        const timeDiff = Date.now() - parseInt(timestamp);
                        if (timeDiff < 3600000 && ADMIN_ROUTES[savedRoute]) { // Ø£Ù‚Ù„ Ù…Ù† Ø³Ø§Ø¹Ø©
                            route = savedRoute;
                            console.log(`Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø­ÙÙˆØ¸: ${route}`);
                        }
                    }
                }
                
                console.log(`Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ: ${route}`);
                
                // Ø¹Ø±Ø¶ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©
                if (ADMIN_ROUTES[route] && ADMIN_ROUTES[route].handler) {
                    ADMIN_ROUTES[route].handler();
                    updateURL(route);
                } else {
                    console.log('Ø§Ù„Ù…Ø³Ø§Ø± ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙØŒ Ø¹Ø±Ø¶ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©');
                    showDashboardHome();
                    updateURL('dashboard');
                }
                
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø³Ø§Ø±:', error);
                showDashboardHome();
                updateURL('dashboard');
            }
        }
        
        // Ù…Ø¹Ø§Ù„Ø¬ ØªØºÙŠÙŠØ± Ø§Ù„Ù…Ø³Ø§Ø±
        function navigateToRoute(route) {
            if (!ADMIN_ROUTES[route]) {
                console.error(`Ø§Ù„Ù…Ø³Ø§Ø± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯: ${route}`);
                return;
            }
            
            console.log(`Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰: ${route}`);
            
            // Ø¹Ø±Ø¶ Ø§Ù„ØµÙØ­Ø©
            ADMIN_ROUTES[route].handler();
            
            // ØªØ­Ø¯ÙŠØ« URL
            updateURL(route);
            
            // Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ø§Ø±
            saveCurrentRoute(route);
        }
        
        // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
        function showDashboardHome() {
            // Ø¥Ø¸Ù‡Ø§Ø± Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø£ØµÙ„ÙŠØ©
            document.querySelector('.welcome-section').style.display = 'block';
            document.querySelector('.stats-grid').style.display = 'grid';
            document.querySelector('.quick-actions').style.display = 'block';
            document.querySelector('.recent-activity').style.display = 'block';
            
            // Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø£Ø®Ø±Ù‰
            document.getElementById('advertising-panel').style.display = 'none';
            document.getElementById('product-requests-section').style.display = 'none';
            document.getElementById('reports-section').style.display = 'none';
            
            console.log('ØªÙ… Ø¹Ø±Ø¶ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©');
        }
        
        // ===== ÙˆØ¸Ø§Ø¦Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª =====

        // Ø¯Ø§Ù„Ø© Ù…Ø³Ø§Ø¹Ø¯Ø© Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØµÙˆØ±
        function getAdImageUrl(ad) {
            console.log('ðŸš¨ DEBUG: Ø¨Ø¯Ø§ÙŠØ© Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØµÙˆØ±Ø© Ù„Ù„Ø¥Ø¹Ù„Ø§Ù†:', ad);
            console.log('ðŸš¨ DEBUG: Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„ÙƒØ§Ù…Ù„Ø©:', JSON.stringify(ad, null, 2));
            
            let imageUrl = '';
            
            // Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„ØµÙˆØ±Ø© Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬ Ø£ÙˆÙ„Ø§Ù‹
            if (ad.product && ad.has_product) {
                console.log('ðŸš¨ DEBUG: Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ù…Ø±ØªØ¨Ø· Ø¨Ù…Ù†ØªØ¬:', ad.product);
                console.log('ðŸš¨ DEBUG: product.image_urls:', ad.product.image_urls);
                console.log('ðŸš¨ DEBUG: product.image_url:', ad.product.image_url);
                console.log('ðŸš¨ DEBUG: product.image_urls type:', typeof ad.product.image_urls);
                console.log('ðŸš¨ DEBUG: product.image_urls length:', ad.product.image_urls?.length);
                
                if (ad.product.image_urls && ad.product.image_urls.length > 0) {
                    imageUrl = ad.product.image_urls[0];
                    console.log('ðŸš¨ DEBUG: ØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ØµÙˆØ±Ø© Ù…Ù† image_urls:', imageUrl);
                } else if (ad.product.image_url) {
                    imageUrl = ad.product.image_url;
                    console.log('ðŸš¨ DEBUG: ØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ØµÙˆØ±Ø© Ù…Ù† image_url:', imageUrl);
                } else {
                    console.log('ðŸš¨ DEBUG: Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ± ÙÙŠ Ø§Ù„Ù…Ù†ØªØ¬');
                }
            } else {
                console.log('ðŸš¨ DEBUG: Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ØºÙŠØ± Ù…Ø±ØªØ¨Ø· Ø¨Ù…Ù†ØªØ¬ Ø£Ùˆ has_product = false');
                console.log('ðŸš¨ DEBUG: ad.product:', ad.product);
                console.log('ðŸš¨ DEBUG: ad.has_product:', ad.has_product);
                console.log('ðŸš¨ DEBUG: ad.product_id:', ad.product_id);
                console.log('ðŸš¨ DEBUG: ad.product_category:', ad.product_category);
            }
            
            // Ø¥Ø°Ø§ Ù„Ù… ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø© ÙÙŠ Ø§Ù„Ù…Ù†ØªØ¬ØŒ Ø§Ø³ØªØ®Ø¯Ù… ØµÙˆØ±Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†
            if (!imageUrl && ad.image_url) {
                imageUrl = ad.image_url;
                console.log('ðŸš¨ DEBUG: ØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… ØµÙˆØ±Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', imageUrl);
            } else if (!imageUrl) {
                console.log('ðŸš¨ DEBUG: Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø© ÙÙŠ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø£ÙŠØ¶Ø§Ù‹');
            }
            
            // Ø¥Ø°Ø§ Ù„Ù… ØªÙˆØ¬Ø¯ Ø£ÙŠ ØµÙˆØ±Ø©ØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©
            if (!imageUrl) {
                imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2Ni41NDkgMTAwIDE4MCA4Ni41NDkgMTgwIDcwQzE4MCA1My40NTEgMTY2LjU0OSA0MCAxNTAgNDBDMTMzLjQ1MSA0MCAxMjAgNTMuNDUxIDEyMCA3MEMxMjAgODYuNTQ5IDEzMy40NTEgMTAwIDE1MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNTAgMTIwQzEzMy40NTEgMTIwIDEyMCAxMzMuNDUxIDEyMCAxNTBDMTIwIDE2Ni41NDkgMTMzLjQ1MSAxODAgMTUwIDE4MEMxNjYuNTQ5IDE4MCAxODAgMTY2LjU0OSAxODAgMTUwQzE4MCAxMzMuNDUxIDE2Ni41NDkgMTIwIDE1MCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                console.log('ðŸš¨ DEBUG: ØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©');
            }
            
            console.log('ðŸš¨ DEBUG: Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© Ù„Ù„ØµÙˆØ±Ø©:', imageUrl);
            return imageUrl;
        }

        // Ø¥Ø¸Ù‡Ø§Ø± Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        function showAdvertisingPanel() {
            // Ø¥Ø®ÙØ§Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø£Ø®Ø±Ù‰
            document.querySelector('.welcome-section').style.display = 'none';
            document.querySelector('.stats-grid').style.display = 'none';
            document.querySelector('.quick-actions').style.display = 'none';
            document.querySelector('.recent-activity').style.display = 'none';
            document.getElementById('product-requests-section').style.display = 'none';
            document.getElementById('reports-section').style.display = 'none';
            
            // Ø¥Ø¸Ù‡Ø§Ø± Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
            document.getElementById('advertising-panel').style.display = 'block';
            
            // ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
            loadAdvertisingData();
        }

        // Ø¥Ø®ÙØ§Ø¡ Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        function hideAdvertisingPanel() {
            showDashboardHome();
        }

        // ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„ØªØ¨ÙˆÙŠØ¨Ø§Øª
        function switchAdvertisingTab(tabName) {
            // Ø¥Ø®ÙØ§Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„ØªØ¨ÙˆÙŠØ¨Ø§Øª
            document.getElementById('active-ads-tab').style.display = 'none';
            document.getElementById('ad-requests-tab').style.display = 'none';
            document.getElementById('system-stats-tab').style.display = 'none';
            
            // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ÙØ¦Ø© Ø§Ù„Ù†Ø´Ø·Ø© Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø²Ø±Ø§Ø±
            document.querySelectorAll('.advertising-tabs .filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨
            if (tabName === 'active-ads') {
                document.getElementById('active-ads-tab').style.display = 'block';
                document.querySelector('.advertising-tabs .filter-btn:first-child').classList.add('active');
                loadActiveAdvertisements();
            } else if (tabName === 'ad-requests') {
                document.getElementById('ad-requests-tab').style.display = 'block';
                document.querySelector('.advertising-tabs .filter-btn:nth-child(2)').classList.add('active');
                loadAdRequests();
            } else if (tabName === 'system-stats') {
                document.getElementById('system-stats-tab').style.display = 'block';
                document.querySelector('.advertising-tabs .filter-btn:nth-child(4)').classList.add('active');
                loadSystemStatistics();
            }
        }
        
        // Ø¥Ø¸Ù‡Ø§Ø± ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø©
        function showSystemStatistics() {
            switchAdvertisingTab('system-stats');
        }

        // Ø¯Ø§Ù„Ø© Ø§Ø®ØªØ¨Ø§Ø± Ù„ÙØ­Øµ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        async function debugAdvertisementsData() {
            try {
                console.log('ðŸš¨ DEBUG: Ø¨Ø¯Ø§ÙŠØ© ÙØ­Øµ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª');
                
                if (!window.supabaseClient) {
                    console.error('ðŸš¨ DEBUG: Supabase client ØºÙŠØ± Ù…ØªÙˆÙØ±');
                    return;
                }

                // Ø¬Ù„Ø¨ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
                const { data: ads, error: adsError } = await window.supabaseClient
                    .from('advertisements')
                    .select('*');
                
                if (adsError) {
                    console.error('ðŸš¨ DEBUG: Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', adsError);
                    return;
                }

                console.log('ðŸš¨ DEBUG: Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª:', ads);

                // ÙØ­Øµ ÙƒÙ„ Ø¥Ø¹Ù„Ø§Ù†
                for (const ad of ads || []) {
                    console.log(`ðŸš¨ DEBUG: ÙØ­Øµ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ${ad.id}:`, {
                        id: ad.id,
                        product_id: ad.product_id,
                        product_category: ad.product_category,
                        has_product: ad.has_product,
                        image_url: ad.image_url
                    });

                    if (ad.product_id && ad.product_category) {
                        // ØªØ­Ø¯ÙŠØ¯ Ø§Ø³Ù… Ø§Ù„Ø¬Ø¯ÙˆÙ„
                        let tableName = 'products_other';
                        switch (ad.product_category) {
                            case 'cake': tableName = 'products_cake'; break;
                            case 'koshat': tableName = 'products_koshat'; break;
                            case 'mirr': tableName = 'products_mirr'; break;
                            case 'other': tableName = 'products_other'; break;
                            case 'invitations': tableName = 'products_invitations'; break;
                            case 'flowerbouquets': tableName = 'products_flowerbouquets'; break;
                        }

                        console.log(`ðŸš¨ DEBUG: Ù…Ø­Ø§ÙˆÙ„Ø© Ø¬Ù„Ø¨ Ø§Ù„Ù…Ù†ØªØ¬ Ù…Ù† ${tableName} Ø¨Ù…Ø¹Ø±Ù ${ad.product_id}`);

                        // Ø¬Ù„Ø¨ Ø§Ù„Ù…Ù†ØªØ¬
                        const { data: product, error: productError } = await window.supabaseClient
                            .from(tableName)
                            .eq('id', ad.product_id)
                            .select('id, description, price, image_urls, category, subcategory, governorate, cities, whatsapp, facebook, instagram, created_at, updated_at')
                            .single();

                        if (productError) {
                            console.error(`ðŸš¨ DEBUG: Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ù…Ù†ØªØ¬ Ù…Ù† ${tableName}:`, productError);
                        } else {
                            console.log(`ðŸš¨ DEBUG: Ø§Ù„Ù…Ù†ØªØ¬ Ù…Ù† ${tableName}:`, product);
                            console.log(`ðŸš¨ DEBUG: ØµÙˆØ± Ø§Ù„Ù…Ù†ØªØ¬:`, {
                                image_urls: product.image_urls,
                                image_url: product.image_url,
                                image_urls_type: typeof product.image_urls,
                                image_urls_length: product.image_urls?.length
                            });
                        }
                    }
                }

                // ÙØ­Øµ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
                console.log('ðŸš¨ DEBUG: ÙØ­Øµ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª...');
                if (window.advertisingService) {
                    console.log('ðŸš¨ DEBUG: Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…ØªÙˆÙØ±Ø©');
                    try {
                        const adsWithProducts = await window.advertisingService.getAllAdvertisementsWithProducts();
                        console.log('ðŸš¨ DEBUG: Ù†ØªÙŠØ¬Ø© Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', adsWithProducts);
                        
                        if (adsWithProducts && adsWithProducts.length > 0) {
                            adsWithProducts.forEach((ad, index) => {
                                console.log(`ðŸš¨ DEBUG: Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ${index + 1} Ù…Ù† Ø§Ù„Ø®Ø¯Ù…Ø©:`, {
                                    id: ad.id,
                                    product_id: ad.product_id,
                                    has_product: ad.has_product,
                                    product: ad.product ? {
                                        id: ad.product.id,
                                        image_urls: ad.product.image_urls,
                                        image_url: ad.product.image_url
                                    } : null
                                });
                            });
                        }
                    } catch (error) {
                        console.error('ðŸš¨ DEBUG: Ø®Ø·Ø£ ÙÙŠ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', error);
                    }
                } else {
                    console.error('ðŸš¨ DEBUG: Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                }

            } catch (error) {
                console.error('ðŸš¨ DEBUG: Ø®Ø·Ø£ ÙÙŠ ÙØ­Øµ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª:', error);
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        async function loadAdvertisingData() {
            try {
                await loadActiveAdvertisements();
                await loadAdRequests();
                await loadAdStatistics();
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', error);
            }
        }

        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©
        async function loadActiveAdvertisements() {
            try {
                console.log('ðŸš¨ DEBUG: Ø¨Ø¯Ø§ÙŠØ© ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©');
                console.log('ðŸš¨ DEBUG: window.advertisingService Ù…ÙˆØ¬ÙˆØ¯:', !!window.advertisingService);
                
                if (!window.advertisingService) {
                    console.error('ðŸš¨ DEBUG: Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                console.log('ðŸš¨ DEBUG: Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…Ø¹ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª...');
                
                // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù„Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…Ø¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
                const advertisements = await window.advertisingService.getAllAdvertisementsWithProducts();
                
                console.log('ðŸš¨ DEBUG: ØªÙ… Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', advertisements);
                console.log('ðŸš¨ DEBUG: Ù†ÙˆØ¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª:', typeof advertisements);
                console.log('ðŸš¨ DEBUG: Ù‡Ù„ Ù‡ÙŠ Ù…ØµÙÙˆÙØ©:', Array.isArray(advertisements));
                
                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø¥Ø¶Ø§ÙÙŠØ© Ù„Ù„ØµÙˆØ± Ù‚Ø¨Ù„ Ø§Ù„Ø¹Ø±Ø¶
                if (advertisements && advertisements.length > 0) {
                    console.log('ðŸš¨ DEBUG: Ø¹Ø¯Ø¯ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', advertisements.length);
                    advertisements.forEach((ad, index) => {
                        console.log(`ðŸš¨ DEBUG: Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø±Ù‚Ù… ${index + 1}:`, ad);
                        if (ad.product && ad.has_product) {
                            console.log(`ðŸš¨ DEBUG: Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ${ad.id}:`, {
                                product_id: ad.product.id,
                                image_urls: ad.product.image_urls,
                                image_url: ad.product.image_url,
                                has_product: ad.has_product
                            });
                        } else {
                            console.log(`ðŸš¨ DEBUG: Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ${ad.id} Ø¨Ø¯ÙˆÙ† Ù…Ù†ØªØ¬ Ù…Ø±ØªØ¨Ø·`);
                        }
                    });
                } else {
                    console.log('ðŸš¨ DEBUG: Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø£Ùˆ Ø§Ù„Ù…ØµÙÙˆÙØ© ÙØ§Ø±ØºØ©');
                }
                
                displayActiveAdvertisements(advertisements);
            } catch (error) {
                console.error('ðŸš¨ DEBUG: Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©:', error);
                console.error('ðŸš¨ DEBUG: ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø®Ø·Ø£:', error.message);
                console.error('ðŸš¨ DEBUG: stack trace:', error.stack);
            }
        }

        // Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø© ÙƒØ¨Ø·Ø§Ù‚Ø§Øª
        function displayActiveAdvertisements(advertisements) {
            console.log('ðŸš¨ DEBUG: Ø¨Ø¯Ø§ÙŠØ© Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©');
            console.log('ðŸš¨ DEBUG: Ø¹Ø¯Ø¯ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', advertisements?.length);
            
            const cardsContainer = document.getElementById('active-ads-cards');
            const noAdsMessage = document.getElementById('no-ads-message');
            
            if (!cardsContainer) {
                console.error('ðŸš¨ DEBUG: Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø­Ø§ÙˆÙŠØ© Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª');
                return;
            }

            if (!advertisements || advertisements.length === 0) {
                console.log('ðŸš¨ DEBUG: Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù„Ù„Ø¹Ø±Ø¶');
                cardsContainer.style.display = 'none';
                if (noAdsMessage) noAdsMessage.style.display = 'block';
                return;
            }

            console.log('ðŸš¨ DEBUG: Ø³ÙŠØªÙ… Ø¹Ø±Ø¶', advertisements.length, 'Ø¥Ø¹Ù„Ø§Ù†');
            
            cardsContainer.style.display = 'grid';
            if (noAdsMessage) noAdsMessage.style.display = 'none';

            // Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª Ù…Ø¹ ØªØ³Ø¬ÙŠÙ„ Ù…ÙØµÙ„
            const cards = advertisements.map((ad, index) => {
                console.log(`ðŸš¨ DEBUG: Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ø±Ù‚Ù… ${index + 1} Ù„Ù„Ø¥Ø¹Ù„Ø§Ù†:`, ad.id);
                return createAdCard(ad);
            }).join('');
            
            console.log('ðŸš¨ DEBUG: ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§ØªØŒ Ø³ÙŠØªÙ… Ø¥Ø¯Ø±Ø§Ø¬Ù‡Ø§ ÙÙŠ DOM');
            cardsContainer.innerHTML = cards;
            console.log('ðŸš¨ DEBUG: ØªÙ… Ø¥Ø¯Ø±Ø§Ø¬ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª ÙÙŠ DOM Ø¨Ù†Ø¬Ø§Ø­');
        }

        // Ø¥Ù†Ø´Ø§Ø¡ Ø¨Ø·Ø§Ù‚Ø© Ø¥Ø¹Ù„Ø§Ù† Ø£Ù†ÙŠÙ‚Ø©
        function createAdCard(ad) {
            console.log('ðŸš¨ DEBUG: Ø¨Ø¯Ø§ÙŠØ© Ø¥Ù†Ø´Ø§Ø¡ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', ad.id);
            
            const statusClass = getAdStatusClass(ad);
            const statusText = getAdStatusText(ad);
            const typeText = getAdTypeText(ad);
            const positionText = getAdPositionText(ad);
            
            console.log('ðŸš¨ DEBUG: Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø±Ø¬Ø©:', {
                statusClass,
                statusText,
                typeText,
                positionText
            });
            
            // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©
            const mainImage = getAdImageUrl(ad);
            console.log('ðŸš¨ DEBUG: Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©:', mainImage);
            
            // Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù…Ø®ØªØµØ±Ø© Ù„Ù„Ù…Ù†ØªØ¬
            let productName = 'Ø¥Ø¹Ù„Ø§Ù† Ø¨Ø¯ÙˆÙ† Ù…Ù†ØªØ¬';
            let productPrice = '';
            let productCategory = '';
            
            if (ad.product && ad.has_product) {
                console.log('ðŸš¨ DEBUG: Ù…Ø¹Ø§Ù„Ø¬Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬:', ad.product);
                productName = ad.product.name || ad.product.description || 'Ù…Ù†ØªØ¬ Ù…Ø±ØªØ¨Ø·';
                productPrice = ad.product.price ? `ðŸ’° ${ad.product.price} Ø¬.Ù…` : '';
                productCategory = ad.product_category ? `ðŸ·ï¸ ${ad.product_category}` : '';
                
                console.log('ðŸš¨ DEBUG: Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©:', {
                    productName,
                    productPrice,
                    productCategory
                });
            } else {
                console.log('ðŸš¨ DEBUG: Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù†ØªØ¬ Ù…Ø±ØªØ¨Ø·');
            }
            
            console.log('ðŸš¨ DEBUG: Ø¥Ù†Ø´Ø§Ø¡ HTML Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ù„Ù„Ø¥Ø¹Ù„Ø§Ù†:', ad.id);
            
            const cardHtml = `
                <div class="ad-card-elegant" data-ad-id="${ad.id}" onclick="openAdDetails('${ad.id}')">
                    <div class="ad-card-image-container">
                        <img src="${mainImage}" alt="ØµÙˆØ±Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†" class="ad-card-main-image" 
                             onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2Ni41NDkgMTAwIDE4MCA4Ni41NDkgMTgwIDcwQzE4MCA1My40NTEgMTY2LjU0OSA0MCAxNTAgNDBDMTMzLjQ1MSA0MCAxMjAgNTMuNDUxIDEyMCA3MEMxMjAgODYuNTQ5IDEzMy40NTEgMTAwIDE1MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNTAgMTIwQzEzMy40NTEgMTIwIDEyMCAxMzMuNDUxIDEyMCAxNTBDMTIwIDE2Ni41NDkgMTMzLjQ1MSAxODAgMTUwIDE4MEMxNjYuNTQ5IDE4MCAxODAgMTY2LjU0OSAxODAgMTUwQzE4MCAxMzMuNDUxIDE2Ni41NDkgMTIwIDE1MCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo='; console.log('âŒ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙˆØ±Ø©:', this.src);"
                             onload="console.log('âœ… ØªÙ… ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­:', this.src)"
                             loading="lazy">
                        <div class="ad-card-overlay">
                            <div class="ad-card-badges">
                                <span class="ad-type-badge-elegant">${typeText}</span>
                                <span class="ad-status-badge-elegant ${statusClass}">${statusText}</span>
                            </div>
                            <div class="ad-card-hover-info">
                                <span class="hover-text">Ø§Ø¶ØºØ· Ù„Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ad-card-content">
                        <div class="ad-card-header-elegant">
                            <h3 class="ad-card-title-elegant">${ad.title || 'Ø¥Ø¹Ù„Ø§Ù† Ø¨Ø¯ÙˆÙ† Ø¹Ù†ÙˆØ§Ù†'}</h3>
                            <p class="ad-card-subtitle-elegant">${positionText}</p>
                        </div>
                        
                        <div class="ad-card-product-info">
                            <h4 class="product-name-elegant">${productName}</h4>
                            ${productPrice ? `<p class="product-price-elegant">${productPrice}</p>` : ''}
                            ${productCategory ? `<p class="product-category-elegant">${productCategory}</p>` : ''}
                        </div>
                        
                        <div class="ad-card-meta">
                            <div class="meta-item">
                                <span class="meta-icon">ðŸš€</span>
                                <span class="meta-text">ÙŠØ¨Ø¯Ø£: ${formatDate(ad.start_date)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">â°</span>
                                <span class="meta-text">ÙŠÙ†ØªÙ‡ÙŠ: ${ad.end_date ? formatDate(ad.end_date) : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">â­</span>
                                <span class="meta-text">Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©: ${ad.priority || 1}</span>
                            </div>
                        </div>
                        
                        <div class="ad-card-actions-elegant">
                            <button class="ad-action-btn-elegant edit" onclick="event.stopPropagation(); editAdvertisement('${ad.id}')">
                                <span>âœï¸</span>
                                ØªØ¹Ø¯ÙŠÙ„
                            </button>
                            <button class="ad-action-btn-elegant delete" onclick="event.stopPropagation(); deleteAdvertisement('${ad.id}')">
                                <span>ðŸ—‘ï¸</span>
                                Ø­Ø°Ù
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('ðŸš¨ DEBUG: ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ HTML Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ø¨Ù†Ø¬Ø§Ø­ Ù„Ù„Ø¥Ø¹Ù„Ø§Ù†:', ad.id);
            console.log('ðŸš¨ DEBUG: HTML Ø§Ù„Ø¨Ø·Ø§Ù‚Ø©:', cardHtml);
            
            return cardHtml;
        }

        // Ø¯ÙˆØ§Ù„ Ù…Ø³Ø§Ø¹Ø¯Ø© Ù„Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        function getAdStatusClass(ad) {
            if (ad.is_active === true) return 'active';
            if (ad.is_active === false) return 'paused';
            return 'active';
        }

        function getAdStatusText(ad) {
            if (ad.is_active === true) return 'Ù†Ø´Ø·';
            if (ad.is_active === false) return 'Ù…ØªÙˆÙ‚Ù Ù…Ø¤Ù‚ØªØ§Ù‹';
            return 'Ù†Ø´Ø·';
        }

        function getAdTypeText(type) {
            const types = {
                'featured': 'Ù…Ù…ÙŠØ²',
                'recommended': 'Ù…ÙˆØµÙ‰ Ø¨Ù‡',
                'banner': 'Ø¨Ø§Ù†Ø±',
                'category_sections': 'Ø£Ù‚Ø³Ø§Ù… Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©'
            };
            return types[type] || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
        }

        function getAdPositionText(position) {
            const positions = {
                'homepage_featured': 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…Ù…ÙŠØ²',
                'homepage_recommended': 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…ÙˆØµÙ‰ Ø¨Ù‡',
                'category_featured': 'ØµÙØ­Ø© Ø§Ù„ØªØµÙ†ÙŠÙ - Ù…Ù…ÙŠØ²',
                'sidebar': 'Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠ',
                'homepage_featured': 'Ø£Ù‚Ø³Ø§Ù… Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©'
            };
            return positions[position] || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
        }

        function formatDate(dateString) {
            if (!dateString) return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
            }
        }

        // Ø¯ÙˆØ§Ù„ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        async function editAdvertisement(adId) {
            try {
                if (!window.advertisingService) {
                    alert('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                // Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ù…Ù† Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ù…Ø¨Ø§Ø´Ø±Ø©
                const { data: ad, error } = await window.supabaseClient
                    .from('advertisements')
                    .select('*')
                    .eq('id', adId)
                    .single();
                
                if (error || !ad) {
                    alert('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
                    return;
                }

                // Ù…Ù„Ø¡ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
                document.getElementById('edit-ad-id').value = ad.id;
                document.getElementById('edit-ad-title').value = ad.title || '';
                document.getElementById('edit-ad-description').value = ad.description || '';
                document.getElementById('edit-ad-category').value = ad.product_category || '';
                document.getElementById('edit-ad-section').value = ad.category_section || '';
                document.getElementById('edit-ad-type').value = ad.ad_type || '';
                document.getElementById('edit-ad-position').value = ad.position || '';
                document.getElementById('edit-ad-start-date').value = ad.start_date ? ad.start_date.slice(0, 16) : '';
                document.getElementById('edit-ad-end-date').value = ad.end_date ? ad.end_date.slice(0, 16) : '';
                document.getElementById('edit-ad-priority').value = ad.priority || 1;
                document.getElementById('edit-ad-status').value = ad.is_active ? 'active' : 'paused';
                
                // ØªØ­Ø¯ÙŠØ« Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
                updateEditAdSections();
                
                // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù„Ù„ØªØµÙ†ÙŠÙ Ø§Ù„Ù…Ø­Ø¯Ø¯
                await loadProductsForEditCategory();

                // Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù†Ø§ÙØ°Ø©
                document.getElementById('edit-ad-modal').style.display = 'flex';
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        async function updateAdvertisement() {
            try {
                const adId = document.getElementById('edit-ad-id').value;
                const formData = {
                    title: document.getElementById('edit-ad-title').value,
                    description: document.getElementById('edit-ad-description').value,
                    image_url: null, // Ø³ÙŠØªÙ… ØªØ¹ÙŠÙŠÙ†Ù‡ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬
                    link_url: null, // Ø³ÙŠØªÙ… ØªØ¹ÙŠÙŠÙ†Ù‡ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬
                    category: document.getElementById('edit-ad-category').value,
                    category_section: document.getElementById('edit-ad-section').value, // Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯
                    product_id: document.getElementById('edit-ad-product').value,
                    ad_type: document.getElementById('edit-ad-type').value,
                    position: document.getElementById('edit-ad-position').value,
                    start_date: document.getElementById('edit-ad-start-date').value,
                    end_date: document.getElementById('edit-ad-end-date').value,
                    priority: parseInt(document.getElementById('edit-ad-priority').value),
                    budget: parseFloat(document.getElementById('edit-ad-budget').value) || 0,
                    status: document.getElementById('edit-ad-status').value
                };

                if (!window.advertisingService) {
                    alert('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const result = await window.advertisingService.updateAdvertisement(adId, formData);
                if (result.success) {
                    alert('ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­');
                    hideEditAdModal();
                    loadActiveAdvertisements();
                } else {
                    alert('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†: ' + result.error);
                }
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        async function deleteAdvertisement(adId) {
            if (!confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†ØŸ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡.')) {
                return;
            }

            try {
                if (!window.advertisingService) {
                    alert('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const result = await window.advertisingService.deleteAdvertisement(adId);
                if (result.success) {
                    alert('ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­');
                    loadActiveAdvertisements();
                } else {
                    alert('Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†: ' + result.error);
                }
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        async function pauseAdvertisement(adId) {
            try {
                if (!window.advertisingService) {
                    alert('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const result = await window.advertisingService.updateAdvertisementStatus(adId, 'paused');
                if (result.success) {
                    alert('ØªÙ… Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ù…Ø¤Ù‚ØªØ§Ù‹');
                    loadActiveAdvertisements();
                } else {
                    alert('Ø®Ø·Ø£ ÙÙŠ Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†: ' + result.error);
                }
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        async function activateAdvertisement(adId) {
            try {
                if (!window.advertisingService) {
                    alert('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const result = await window.advertisingService.updateAdvertisementStatus(adId, 'active');
                if (result.success) {
                    alert('ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­');
                    loadActiveAdvertisements();
                } else {
                    alert('Ø®Ø·Ø£ ÙÙŠ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†: ' + result.error);
                }
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        function hideEditAdModal() {
            document.getElementById('edit-ad-modal').style.display = 'none';
        }

        async function loadProductsForEditCategory() {
            const category = document.getElementById('edit-ad-category').value;
            const productSelect = document.getElementById('edit-ad-product');
            
            if (!category) {
                productSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„ØªØµÙ†ÙŠÙ Ø£ÙˆÙ„Ø§Ù‹</option>';
                productSelect.disabled = true;
                return;
            }

            try {
                if (!window.productService) {
                    console.error('Ø®Ø¯Ù…Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const products = await window.productService.getProductsByCategory(category);
                productSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…Ù†ØªØ¬</option>' +
                    products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
                productSelect.disabled = false;
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª:', error);
                productSelect.innerHTML = '<option value="">Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„</option>';
            }
        }

        async function updateEditAdPositions() {
            const adType = document.getElementById('edit-ad-type').value;
            const positionSelect = document.getElementById('edit-ad-position');
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø­Ù‚Ù„
            positionSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¶Ø¹</option>';
            positionSelect.disabled = true; // ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„ Ø£ÙˆÙ„Ø§Ù‹
            
            if (!adType) {
                return;
            }

            const positions = {
                'featured': [
                    { value: 'homepage_featured', text: 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…Ù…ÙŠØ²' },
                    { value: 'category_featured', text: 'ØµÙØ­Ø© Ø§Ù„ØªØµÙ†ÙŠÙ - Ù…Ù…ÙŠØ²' }
                ],
                'recommended': [
                    { value: 'homepage_recommended', text: 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…ÙˆØµÙ‰ Ø¨Ù‡' }
                ],
                'banner': [
                    { value: 'sidebar', text: 'Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠ' }
                ],
                'category_sections': [
                    { value: 'homepage_featured', text: 'Ø£Ù‚Ø³Ø§Ù… Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ]
            };

            const availablePositions = positions[adType] || [];
            positionSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¶Ø¹</option>' +
                availablePositions.map(p => `<option value="${p.value}">${p.text}</option>`).join('');
            
            // ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„ Ø¨Ø¹Ø¯ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª
            positionSelect.disabled = false;
        }

        // ØªØ­Ù…ÙŠÙ„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        async function loadAdRequests() {
            try {
                if (!window.advertisingService) {
                    console.error('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                // Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ø¨Ø³Ø·
                displayAdRequests([]);
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', error);
            }
        }

        // Ø¹Ø±Ø¶ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        function displayAdRequests(requests) {
            const tableBody = document.getElementById('ad-requests-table');
            if (!tableBody) return;

            if (!requests || requests.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="10" class="text-center py-4">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¥Ø¹Ù„Ø§Ù†Ø§Øª</td></tr>';
                return;
            }

            const rows = requests.map(request => `
                <tr>
                    <td>${request.products?.name || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</td>
                    <td>${request.seller_email || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</td>
                    <td>${getAdTypeText(request.ad_type)}</td>
                    <td>${getAdPositionText(request.position)}</td>
                    <td>${request.duration_days}</td>
                    <td>${request.budget} Ø¬.Ù…</td>
                    <td>${request.message || 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø±Ø³Ø§Ù„Ø©'}</td>
                    <td>${getRequestStatusText(request.status)}</td>
                    <td>${formatDate(request.created_at)}</td>
                    <td>
                        <button onclick="reviewAdRequest('${request.id}')" class="btn-review">Ù…Ø±Ø§Ø¬Ø¹Ø©</button>
                    </td>
                </tr>
            `).join('');

            tableBody.innerHTML = rows;
        }

        // ØªØ­Ù…ÙŠÙ„ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        async function loadAdStatistics() {
            try {
                if (!window.advertisingService) {
                    console.error('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const stats = await window.advertisingService.getActiveAdvertisements();
                updateAdStatistics(stats);
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª:', error);
            }
        }

        // ØªØ­Ø¯ÙŠØ« Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        function updateAdStatistics(stats) {
            if (!stats || stats.length === 0) return;

            const totalClicks = stats.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0);
            const totalImpressions = stats.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0);
            const activeAds = stats.filter(ad => ad.is_active === true).length;

            document.getElementById('active-ads-count').textContent = activeAds;
            document.getElementById('total-clicks').textContent = totalClicks;
            document.getElementById('total-impressions').textContent = totalImpressions;
        }

        // Ø¥Ø¸Ù‡Ø§Ø± Ù†Ù…ÙˆØ°Ø¬ Ø¥Ø¶Ø§ÙØ© Ø¥Ø¹Ù„Ø§Ù†
        function showAddAdForm() {
            try {
                const modal = document.getElementById('add-ad-form');
                if (!modal) {
                    console.error('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø©');
                    return;
                }
                
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.classList.add('show');
                
                // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬
                const form = document.getElementById('new-ad-form');
                if (form) form.reset();
                
                const productSelect = document.getElementById('ad-product');
                if (productSelect) {
                    productSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„ØªØµÙ†ÙŠÙ Ø£ÙˆÙ„Ø§Ù‹</option>';
                    productSelect.disabled = true;
                }
                
                const positionSelect = document.getElementById('ad-position');
                if (positionSelect) {
                    positionSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù†ÙˆØ¹ Ø£ÙˆÙ„Ø§Ù‹</option>';
                    positionSelect.disabled = true; // ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„
                }
                
                console.log('ØªÙ… ÙØªØ­ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø© Ø¨Ù†Ø¬Ø§Ø­');
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ÙØªØ­ Ø§Ù„Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ù†Ø¨Ø«Ù‚Ø©:', error);
            }
        }

        // Ø¥Ø®ÙØ§Ø¡ Ù†Ù…ÙˆØ°Ø¬ Ø¥Ø¶Ø§ÙØ© Ø¥Ø¹Ù„Ø§Ù†
        function hideAddAdForm() {
            const modal = document.getElementById('add-ad-form');
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            modal.classList.remove('show');
        }

        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
        async function loadProductsForCategory() {
            try {
                const category = document.getElementById('ad-category').value;
                const productSelect = document.getElementById('ad-product');
                
                if (!category) {
                    productSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„ØªØµÙ†ÙŠÙ Ø£ÙˆÙ„Ø§Ù‹</option>';
                    productSelect.disabled = true;
                    return;
                }
                
                // ØªØ­Ø¯ÙŠØ¯ Ø§Ø³Ù… Ø§Ù„Ø¬Ø¯ÙˆÙ„
                let tableName = 'products_other';
                switch (category) {
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
                
                // Ø¬Ù„Ø¨ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ù† Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…Ø­Ø¯Ø¯
                const { data: products, error } = await window.supabaseClient
                    .from(tableName)
                    .select('id, description, price')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error('Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª:', error);
                    productSelect.innerHTML = '<option value="">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</option>';
                    return;
                }
                
                // Ù…Ù„Ø¡ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
                productSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…Ù†ØªØ¬</option>';
                if (products && products.length > 0) {
                    products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.textContent = `${product.description} - ${product.price > 0 ? product.price + ' Ø¬.Ù…' : 'Ø§Ù„Ø³Ø¹Ø± Ø¹Ù†Ø¯ Ø§Ù„Ø·Ù„Ø¨'}`;
                        option.setAttribute('data-category', category);
                        productSelect.appendChild(option);
                    });
                } else {
                    productSelect.innerHTML = '<option value="">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØµÙ†ÙŠÙ</option>';
                }
                
                productSelect.disabled = false;
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª:', error);
                const productSelect = document.getElementById('ad-product');
                productSelect.innerHTML = '<option value="">Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</option>';
            }
        }

        // ØªØ­Ø¯ÙŠØ« Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
        function updateAdSections() {
            const category = document.getElementById('ad-category').value;
            const sectionSelect = document.getElementById('ad-section');
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù‚Ø³Ù…
            sectionSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù‚Ø³Ù…</option>';
            sectionSelect.disabled = true;
            
            if (!category) {
                return;
            }
            
            // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ù…ØªØ§Ø­Ø© Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
            const sections = getAvailableSections(category);
            
            if (sections && sections.length > 0) {
                sections.forEach(section => {
                    const option = document.createElement('option');
                    option.value = section.value;
                    option.textContent = section.label;
                    sectionSelect.appendChild(option);
                });
                sectionSelect.disabled = false;
            }
        }

        // ØªØ­Ø¯ÙŠØ« Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ÙÙŠ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
        function updateEditAdSections() {
            const category = document.getElementById('edit-ad-category').value;
            const sectionSelect = document.getElementById('edit-ad-section');
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù‚Ø³Ù…
            sectionSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù‚Ø³Ù…</option>';
            sectionSelect.disabled = true;
            
            if (!category) {
                return;
            }
            
            // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ù…ØªØ§Ø­Ø© Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
            const sections = getAvailableSections(category);
            
            if (sections && sections.length > 0) {
                sections.forEach(section => {
                    const option = document.createElement('option');
                    option.value = section.value;
                    option.textContent = section.label;
                    sectionSelect.appendChild(option);
                });
                sectionSelect.disabled = false;
            }
        }

        // Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ù…ØªØ§Ø­Ø© Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ
        function getAvailableSections(category) {
            const sections = {
                'koshat': [
                    { value: 'koshat', label: 'Ù‚Ø³Ù… Ø§Ù„ÙƒÙˆØ´Ø§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ],
                'cake': [
                    { value: 'cake', label: 'Ù‚Ø³Ù… Ø§Ù„ØªÙˆØ±ØªØ§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ],
                'mirr': [
                    { value: 'mirr', label: 'Ù‚Ø³Ù… Ø§Ù„Ù…Ø±Ø§ÙŠØ§ ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ],
                'other': [
                    { value: 'other', label: 'Ù‚Ø³Ù… Ø§Ù„Ø¯ÙŠÙƒÙˆØ±Ø§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ],
                'invitations': [
                    { value: 'invitations', label: 'Ù‚Ø³Ù… Ø§Ù„Ø¯Ø¹ÙˆØ§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ],
                'flowerbouquets': [
                    { value: 'flowerbouquets', label: 'Ù‚Ø³Ù… Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ù„ÙˆØ±Ø¯ ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' }
                ]
            };
            
            return sections[category] || [];
        }

        // ØªØ­Ø¯ÙŠØ« Ù…ÙˆØ§Ø¶Ø¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø­Ø³Ø¨ Ø§Ù„Ù†ÙˆØ¹
        function updateAdPositions() {
            const adType = document.getElementById('ad-type').value;
            const positionSelect = document.getElementById('ad-position');
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø­Ù‚Ù„
            positionSelect.innerHTML = '<option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¶Ø¹</option>';
            positionSelect.disabled = true; // ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„ Ø£ÙˆÙ„Ø§Ù‹
            
            if (!adType) {
                return; // Ù„Ø§ ØªÙØ¹Ù„ Ø§Ù„Ø­Ù‚Ù„ Ø¥Ø°Ø§ Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ù†ÙˆØ¹
            }
            
            if (adType === 'featured') {
                positionSelect.innerHTML += '<option value="homepage_featured">Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…Ù…ÙŠØ²</option>';
                positionSelect.innerHTML += '<option value="category_featured">ØµÙØ­Ø© Ø§Ù„ØªØµÙ†ÙŠÙ - Ù…Ù…ÙŠØ²</option>';
                positionSelect.disabled = false; // ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„
            } else if (adType === 'recommended') {
                positionSelect.innerHTML += '<option value="homepage_recommended">Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…ÙˆØµÙ‰ Ø¨Ù‡</option>';
                positionSelect.disabled = false; // ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„
            } else if (adType === 'banner') {
                positionSelect.innerHTML += '<option value="sidebar">Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠ</option>';
                positionSelect.disabled = false; // ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ù‚Ù„
            } else if (adType === 'category_sections') {
                // Ù„Ù„Ù†ÙˆØ¹ Ø§Ù„Ø¬Ø¯ÙŠØ¯ - Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆØ¶Ø¹ ØµØ­ÙŠØ­ Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                positionSelect.innerHTML += '<option value="homepage_featured">Ø£Ù‚Ø³Ø§Ù… Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</option>';
                // ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù‚ÙŠÙ…Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹
                positionSelect.value = 'homepage_featured';
                positionSelect.disabled = true; // ØªØ¹Ø·ÙŠÙ„ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„
            }
        }





        // Ø¥Ù†Ø´Ø§Ø¡ Ø¥Ø¹Ù„Ø§Ù† Ø¬Ø¯ÙŠØ¯
        async function createNewAdvertisement() {
            try {
                const category = document.getElementById('ad-category').value;
                const section = document.getElementById('ad-section').value;
                const productSelect = document.getElementById('ad-product');
                const selectedOption = productSelect.options[productSelect.selectedIndex];
                
                const formData = {
                    title: document.getElementById('ad-title').value,
                    description: document.getElementById('ad-description').value,
                    image_url: null, // Ø³ÙŠØªÙ… ØªØ¹ÙŠÙŠÙ†Ù‡ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬
                    link_url: null, // Ø³ÙŠØªÙ… ØªØ¹ÙŠÙŠÙ†Ù‡ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬
                    product_id: document.getElementById('ad-product').value,
                    product_category: category,
                    category_section: section, // Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯
                    ad_type: document.getElementById('ad-type').value,
                    position: document.getElementById('ad-position').value,
                    start_date: document.getElementById('ad-start-date').value,
                    end_date: document.getElementById('ad-end-date').value,
                    priority: document.getElementById('ad-priority').value,
                    budget: document.getElementById('ad-budget').value
                };
                
                // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                if (!category || !section || !formData.product_id || !formData.ad_type || !formData.position || !formData.start_date) {
                    alert('ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© (Ø§Ù„ØªØµÙ†ÙŠÙØŒ Ø§Ù„Ù‚Ø³Ù…ØŒ Ø§Ù„Ù…Ù†ØªØ¬ØŒ Ù†ÙˆØ¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†ØŒ Ø§Ù„Ù…ÙˆØ¶Ø¹ØŒ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©)');
                    return;
                }

                if (!window.advertisingService) {
                    console.error('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }

                const result = await window.advertisingService.createAdvertisement(formData);
                if (result) {
                    if (result.is_request) {
                        // ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø·Ù„Ø¨ Ø¥Ø¹Ù„Ø§Ù† Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„Ù…Ø¨Ø§Ø´Ø±
                        alert(`ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø·Ù„Ø¨ Ø¥Ø¹Ù„Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­!\n\n${result.message}\n\nØ³ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹ØªÙ‡ Ù…Ù† Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ù‚Ø±ÙŠØ¨Ø§Ù‹.`);
                        hideAddAdForm();
                        loadAdRequests(); // ØªØ­Ø¯ÙŠØ« Ù‚Ø§Ø¦Ù…Ø© Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
                    } else {
                        // ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ù…Ø¨Ø§Ø´Ø±Ø©
                        alert('ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­');
                        hideAddAdForm();
                        loadActiveAdvertisements();
                    }
                }
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        // Ù…Ø±Ø§Ø¬Ø¹Ø© Ø·Ù„Ø¨ Ø¥Ø¹Ù„Ø§Ù†
        function reviewAdRequest(requestId) {
            // Ù‡Ù†Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¸Ù‡Ø§Ø± ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨
            document.getElementById('review-request-modal').style.display = 'flex';
        }

        // Ø¥Ø®ÙØ§Ø¡ Ù†Ù…ÙˆØ°Ø¬ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø·Ù„Ø¨
        function hideReviewRequestModal() {
            document.getElementById('review-request-modal').style.display = 'none';
        }

        // Ù‚Ø¨ÙˆÙ„ Ø·Ù„Ø¨ Ø¥Ø¹Ù„Ø§Ù†
        async function approveAdRequest() {
            // Ù‡Ù†Ø§ ÙŠÙ…ÙƒÙ†Ùƒ ØªÙ†ÙÙŠØ° Ù…Ù†Ø·Ù‚ Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø·Ù„Ø¨
            alert('ØªÙ… Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­');
            hideReviewRequestModal();
            loadAdRequests();
        }

        // Ø±ÙØ¶ Ø·Ù„Ø¨ Ø¥Ø¹Ù„Ø§Ù†
        async function rejectAdRequest() {
            // Ù‡Ù†Ø§ ÙŠÙ…ÙƒÙ†Ùƒ ØªÙ†ÙÙŠØ° Ù…Ù†Ø·Ù‚ Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨
            alert('ØªÙ… Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­');
            hideReviewRequestModal();
            loadAdRequests();
        }

        // ÙÙ„ØªØ±Ø© Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
        function filterAdRequests() {
            const status = document.getElementById('request-status-filter').value;
            // Ù‡Ù†Ø§ ÙŠÙ…ÙƒÙ†Ùƒ ØªÙ†ÙÙŠØ° Ù…Ù†Ø·Ù‚ Ø§Ù„ÙÙ„ØªØ±Ø©
        }

        // Ø¯ÙˆØ§Ù„ Ù…Ø³Ø§Ø¹Ø¯Ø©
        function getAdTypeText(type) {
            const typeMap = {
                'featured': 'Ù…Ù…ÙŠØ²',
                'recommended': 'Ù…ÙˆØµÙ‰ Ø¨Ù‡',
                'banner': 'Ø¨Ø§Ù†Ø±'
            };
            return typeMap[type] || type;
        }

        function getAdPositionText(position) {
            const positionMap = {
                'homepage_featured': 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…Ù…ÙŠØ²',
                'homepage_recommended': 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ù…ÙˆØµÙ‰ Ø¨Ù‡',
                'category_featured': 'ØµÙØ­Ø© Ø§Ù„ØªØµÙ†ÙŠÙ - Ù…Ù…ÙŠØ²',
                'sidebar': 'Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠ'
            };
            return positionMap[position] || position;
        }
        
        // ===== Ø¯ÙˆØ§Ù„ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø© =====
        
        // ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø©
        async function loadSystemStatistics() {
            try {
                console.log('ðŸ“Š ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø©...');
                console.log('ðŸ” ÙØ­Øµ ØªÙˆÙØ± Ø§Ù„Ø®Ø¯Ù…Ø§Øª...');
                
                // ÙØ­Øµ ØªÙˆÙØ± Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª
                if (!window.advertisingService) {
                    console.error('âŒ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    console.log('ðŸ” Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…Ø©...');
                    
                    // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…Ø©
                    let attempts = 0;
                    while (!window.advertisingService && attempts < 50) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                        console.log(`Ù…Ø­Ø§ÙˆÙ„Ø© ${attempts}: Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª...`);
                    }
                    
                    if (!window.advertisingService) {
                        console.error('âŒ ÙØ´Ù„ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¨Ø¹Ø¯ 50 Ù…Ø­Ø§ÙˆÙ„Ø©');
                        alert('Ø®Ø·Ø£: Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø©.');
                        return;
                    }
                }
                
                console.log('âœ… Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…ØªÙˆÙØ±Ø©:', window.advertisingService);
                
                // ÙØ­Øµ ØªÙˆÙØ± Ø¯ÙˆØ§Ù„ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª
                if (!window.advertisingService.getSystemStatistics) {
                    console.error('âŒ Ø¯Ø§Ù„Ø© getSystemStatistics ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    alert('Ø®Ø·Ø£: Ø¯Ø§Ù„Ø© Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø©.');
                    return;
                }
                
                console.log('âœ… Ø¯Ø§Ù„Ø© getSystemStatistics Ù…ØªÙˆÙØ±Ø©');
                
                // Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø©
                console.log('ðŸ”„ Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª...');
                const stats = await window.advertisingService.getSystemStatistics();
                
                console.log('ðŸ“Š Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…Ø³ØªÙ„Ù…Ø©:', stats);
                
                if (stats) {
                    console.log('âœ… ØªÙ… Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø¨Ù†Ø¬Ø§Ø­ØŒ Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª...');
                    displaySystemStatistics(stats);
                } else {
                    console.error('âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª - Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙØ§Ø±ØºØ©');
                    alert('ØªØ­Ø°ÙŠØ±: Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø¥Ø¹Ù„Ø§Ù†Ø§Øª. Ù‚Ø¯ ØªÙƒÙˆÙ† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙØ§Ø±ØºØ©.');
                }
                
            } catch (error) {
                console.error('âŒ Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø©:', error);
                alert(`Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª: ${error.message}`);
            }
        }
        
        // Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø´Ø§Ù…Ù„Ø©
        function displaySystemStatistics(stats) {
            // Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
            document.getElementById('total-ads-stat').textContent = stats.total_advertisements;
            document.getElementById('active-ads-stat').textContent = stats.active_advertisements;
            document.getElementById('total-impressions-stat').textContent = stats.total_impressions.toLocaleString('ar-EG');
            document.getElementById('total-clicks-stat').textContent = stats.total_clicks.toLocaleString('ar-EG');
            
            // Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ø£Ø¯Ø§Ø¡
            document.getElementById('overall-ctr-stat').textContent = stats.overall_ctr + '%';
            document.getElementById('avg-impressions-stat').textContent = stats.average_impressions_per_ad;
            document.getElementById('avg-clicks-stat').textContent = stats.average_clicks_per_ad;
            
            // Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„ØªÙØµÙŠÙ„ÙŠØ©
            displayTypeStatistics(stats.by_type);
            displayPositionStatistics(stats.by_position);
            displayCategoryStatistics(stats.by_category);
        }
        
        // Ø¹Ø±Ø¶ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù†ÙˆØ¹
        function displayTypeStatistics(typeStats) {
            const container = document.getElementById('type-stats');
            if (!container) return;
            
            let html = '<table class="stats-table">';
            html += '<thead><tr><th>Ø§Ù„Ù†ÙˆØ¹</th><th>Ø§Ù„Ø¹Ø¯Ø¯</th><th>Ø§Ù„Ø¸Ù‡ÙˆØ±Ø§Øª</th><th>Ø§Ù„Ù†Ù‚Ø±Ø§Øª</th><th>Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù†Ù‚Ø±</th></tr></thead><tbody>';
            
            Object.entries(typeStats).forEach(([type, data]) => {
                const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00';
                html += `<tr>
                    <td>${getAdTypeText(type)}</td>
                    <td>${data.count}</td>
                    <td>${data.impressions.toLocaleString('ar-EG')}</td>
                    <td>${data.clicks.toLocaleString('ar-EG')}</td>
                    <td>${ctr}%</td>
                </tr>`;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        }
        
        // Ø¹Ø±Ø¶ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…ÙˆØ¶Ø¹
        function displayPositionStatistics(positionStats) {
            const container = document.getElementById('position-stats');
            if (!container) return;
            
            let html = '<table class="stats-table">';
            html += '<thead><tr><th>Ø§Ù„Ù…ÙˆØ¶Ø¹</th><th>Ø§Ù„Ø¹Ø¯Ø¯</th><th>Ø§Ù„Ø¸Ù‡ÙˆØ±Ø§Øª</th><th>Ø§Ù„Ù†Ù‚Ø±Ø§Øª</th><th>Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù†Ù‚Ø±</th></tr></thead><tbody>';
            
            Object.entries(positionStats).forEach(([position, data]) => {
                const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00';
                html += `<tr>
                    <td>${getAdPositionText(position)}</td>
                    <td>${data.count}</td>
                    <td>${data.impressions.toLocaleString('ar-EG')}</td>
                    <td>${data.clicks.toLocaleString('ar-EG')}</td>
                    <td>${ctr}%</td>
                </tr>`;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        }
        
        // Ø¹Ø±Ø¶ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„ØªØµÙ†ÙŠÙ
        function displayCategoryStatistics(categoryStats) {
            const container = document.getElementById('category-stats');
            if (!container) return;
            
            let html = '<table class="stats-table">';
            html += '<thead><tr><th>Ø§Ù„ØªØµÙ†ÙŠÙ</th><th>Ø§Ù„Ø¹Ø¯Ø¯</th><th>Ø§Ù„Ø¸Ù‡ÙˆØ±Ø§Øª</th><th>Ø§Ù„Ù†Ù‚Ø±Ø§Øª</th><th>Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù†Ù‚Ø±</th></tr></thead><tbody>';
            
            Object.entries(categoryStats).forEach(([category, data]) => {
                const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00';
                const categoryText = getCategoryText(category);
                html += `<tr>
                    <td>${categoryText}</td>
                    <td>${data.count}</td>
                    <td>${data.impressions.toLocaleString('ar-EG')}</td>
                    <td>${data.clicks.toLocaleString('ar-EG')}</td>
                    <td>${ctr}%</td>
                </tr>`;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        }
        
        // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª
        function refreshSystemStatistics() {
            loadSystemStatistics();
        }
        
        // ØªØµØ¯ÙŠØ± Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª
        function exportStatistics() {
            // ÙŠÙ…ÙƒÙ† Ø¥Ø¶Ø§ÙØ© Ù…Ù†Ø·Ù‚ Ø§Ù„ØªØµØ¯ÙŠØ± Ù‡Ù†Ø§
            alert('Ø³ÙŠØªÙ… Ø¥Ø¶Ø§ÙØ© Ù…ÙŠØ²Ø© ØªØµØ¯ÙŠØ± Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ù‚Ø±ÙŠØ¨Ø§Ù‹');
        }
        
        // Ø¯Ø§Ù„Ø© Ù…Ø³Ø§Ø¹Ø¯Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù†Øµ Ø§Ù„ØªØµÙ†ÙŠÙ
        function getCategoryText(category) {
            const categoryMap = {
                'cake': 'ØªÙˆØ±ØªØ§Øª',
                'koshat': 'ÙƒØ´Ø§Øª',
                'mirr': 'Ù…ÙŠØ±',
                'other': 'Ø£Ø®Ø±Ù‰',
                'invitations': 'Ø¯Ø¹ÙˆØ§Øª ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª'
            };
            return categoryMap[category] || category;
        }

        function getPaymentStatusText(status) {
            const statusMap = {
                'pending': 'ÙÙŠ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±',
                'paid': 'Ù…Ø¯ÙÙˆØ¹',
                'expired': 'Ù…Ù†ØªÙ‡ÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©',
                'cancelled': 'Ù…Ù„ØºÙŠ'
            };
            return statusMap[status] || status;
        }

        function getRequestStatusText(status) {
            const statusMap = {
                'pending': 'ÙÙŠ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±',
                'approved': 'Ù…Ù‚Ø¨ÙˆÙ„',
                'rejected': 'Ù…Ø±ÙÙˆØ¶',
                'cancelled': 'Ù…Ù„ØºÙŠ'
            };
            return statusMap[status] || status;
        }

        function formatDate(dateString) {
            if (!dateString) return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG');
        }

        // ÙØªØ­ ØµÙØ­Ø© ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†
        async function openAdDetails(adId) {
            try {
                if (!window.advertisingService) {
                    console.error('Ø®Ø¯Ù…Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©');
                    return;
                }
                
                console.log('ðŸ” ÙØªØ­ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', adId);
                
                // Ø¬Ù„Ø¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ù…Ø¹ Ø§Ù„Ù…Ù†ØªØ¬
                const adWithProduct = await window.advertisingService.getAdvertisementWithProduct(adId);
                
                // ÙØªØ­ Ù†Ø§ÙØ°Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù…Ø¹ Ø§Ù„ØªÙØ§ØµÙŠÙ„
                const detailsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                
                if (detailsWindow) {
                    detailsWindow.document.write(createAdDetailsPage(adWithProduct));
                    detailsWindow.document.close();
                } else {
                    // Ø¥Ø°Ø§ ÙØ´Ù„ ÙØªØ­ Ø§Ù„Ù†Ø§ÙØ°Ø©ØŒ Ø§Ø¹Ø±Ø¶ ÙÙŠ Ù†ÙØ³ Ø§Ù„ØµÙØ­Ø©
                    showAdDetailsModal(adWithProduct);
                }
                
            } catch (error) {
                console.error('âŒ Ø®Ø·Ø£ ÙÙŠ ÙØªØ­ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ÙØªØ­ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†');
            }
        }

        // Ø¥Ù†Ø´Ø§Ø¡ ØµÙØ­Ø© ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†
        function createAdDetailsPage(ad) {
            return `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† - ${ad.title}</title>
                        <link rel="stylesheet" href="../assets/css/admin/admin-dashboard-modal.css">
                </head>
                <body>
                    <button class="close-btn" onclick="window.close()">âŒ Ø¥ØºÙ„Ø§Ù‚</button>
                    
                    <div class="container">
                        <div class="header">
                            <h1>${ad.title || 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†'}</h1>
                            <p class="subtitle">${ad.description || 'ÙˆØµÙ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†'}</p>
                        </div>
                        
                        ${ad.product && ad.has_product ? `
                            <div class="content-section">
                                <h2 class="section-title">ðŸ–¼ï¸ ØµÙˆØ± Ø§Ù„Ù…Ù†ØªØ¬</h2>
                                <div class="product-images">
                                    ${ad.product.image_urls && ad.product.image_urls.length > 0 ? 
                                        ad.product.image_urls.map(img => `<img src="${img}" alt="ØµÙˆØ±Ø© Ø§Ù„Ù…Ù†ØªØ¬" class="product-image">`).join('') :
                                        `<img src="${ad.product.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2Ni41NDkgMTAwIDE4MCA4Ni41NDkgMTgwIDcwQzE4MCA1My40NTEgMTY2LjU0OSA0MCAxNTAgNDBDMTMzLjQ1MSA0MCAxMjAgNTMuNDUxIDEyMCA3MEMxMjAgODYuNTQ5IDEzMy40NTEgMTAwIDE1MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNTAgMTIwQzEzMy40NTEgMTIwIDEyMCAxMzMuNDUxIDEyMCAxNTBDMTIwIDE2Ni41NDkgMTMzLjQ1MSAxODAgMTUwIDE4MEMxNjYuNTQ5IDE4MCAxODAgMTY2LjU0OSAxODAgMTUwQzE4MCAxMzMuNDUxIDE2Ni41NDkgMTIwIDE1MCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo='}" alt="ØµÙˆØ±Ø© Ø§Ù„Ù…Ù†ØªØ¬" class="product-image">`
                                    }
                                </div>
                            </div>
                            
                            <div class="content-section">
                                <h2 class="section-title">ðŸ›ï¸ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬</h2>
                                <div class="product-details">
                                    <div class="detail-item">
                                        <span class="detail-icon">ðŸ“</span>
                                        <span class="detail-label">Ø§Ù„Ø§Ø³Ù…:</span>
                                        <span class="detail-value">${ad.product.name || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">ðŸ’°</span>
                                        <span class="detail-label">Ø§Ù„Ø³Ø¹Ø±:</span>
                                        <span class="detail-value">${ad.product.price || 0} Ø¬.Ù…</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">ðŸ·ï¸</span>
                                        <span class="detail-label">Ø§Ù„ØªØµÙ†ÙŠÙ:</span>
                                        <span class="detail-value">${ad.product.category || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">ðŸ“‚</span>
                                        <span class="detail-label">Ø§Ù„ÙØ¦Ø© Ø§Ù„ÙØ±Ø¹ÙŠØ©:</span>
                                        <span class="detail-value">${ad.product.subcategory || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">ðŸ›ï¸</span>
                                        <span class="detail-label">Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø©:</span>
                                        <span class="detail-value">${ad.product.governorate || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">ðŸ™ï¸</span>
                                        <span class="detail-label">Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©:</span>
                                        <span class="detail-value">${ad.product.cities || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                    </div>
                                </div>
                                
                                ${ad.product.description ? `
                                    <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                                        <h3 style="margin-bottom: 10px; color: #374151;">ðŸ“– Ø§Ù„ÙˆØµÙ</h3>
                                        <p style="color: #6b7280; line-height: 1.6;">${ad.product.description}</p>
                                    </div>
                                ` : ''}
                                
                                ${(ad.product.whatsapp || ad.product.facebook || ad.product.instagram) ? `
                                    <div style="margin-top: 20px;">
                                        <h3 style="margin-bottom: 15px; color: #374151;">ðŸ“± ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„</h3>
                                        <div class="social-links">
                                            ${ad.product.whatsapp ? `<a href="https://wa.me/${ad.product.whatsapp}" target="_blank" class="social-link">ðŸ“± ÙˆØ§ØªØ³Ø§Ø¨: ${ad.product.whatsapp}</a>` : ''}
                                            ${ad.product.facebook ? `<a href="${ad.product.facebook}" target="_blank" class="social-link">ðŸ“˜ ÙÙŠØ³Ø¨ÙˆÙƒ</a>` : ''}
                                            ${ad.product.instagram ? `<a href="https://instagram.com/${ad.product.instagram}" target="_blank" class="social-link">ðŸ“· Ø¥Ù†Ø³ØªØºØ±Ø§Ù…: @${ad.product.instagram}</a>` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="content-section">
                                <h2 class="section-title">âš ï¸ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ù†ØªØ¬ Ù…Ø±ØªØ¨Ø·</h2>
                                <p style="text-align: center; color: #6b7280; font-size: 1.1em;">Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ØºÙŠØ± Ù…Ø±ØªØ¨Ø· Ø¨Ù…Ù†ØªØ¬ Ø­Ù‚ÙŠÙ‚ÙŠ</p>
                            </div>
                        `}
                        
                        <div class="content-section">
                            <h2 class="section-title">ðŸ“Š Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†</h2>
                            <div class="ad-info">
                                <div class="info-card">
                                    <div class="info-value">${ad.ad_type || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</div>
                                    <div class="info-label">Ù†ÙˆØ¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-value">${ad.position || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</div>
                                    <div class="info-label">Ø§Ù„Ù…ÙˆÙ‚Ø¹</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-value">${ad.priority || 1}</div>
                                    <div class="info-label">Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-value">${ad.is_active ? 'Ù†Ø´Ø·' : 'Ù…ØªÙˆÙ‚Ù'}</div>
                                    <div class="info-label">Ø§Ù„Ø­Ø§Ù„Ø©</div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div class="detail-item">
                                    <span class="detail-icon">ðŸ“…</span>
                                    <span class="detail-label">ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©:</span>
                                    <span class="detail-value">${formatDate(ad.start_date)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">â°</span>
                                    <span class="detail-label">ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡:</span>
                                    <span class="detail-value">${ad.end_date ? formatDate(ad.end_date) : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${ad.link_url ? `
                            <div class="content-section">
                                <h2 class="section-title">ðŸ”— Ø±Ø§Ø¨Ø· Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†</h2>
                                <a href="${ad.link_url}" target="_blank" style="display: inline-block; padding: 15px 25px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">
                                    ðŸŒ ÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø·
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </body>
                </html>
            `;
        }
    
