
        // =================================================================
        // ðŸ” DEBUG MODE - Ø±Ø³Ø§Ø¦Ù„ Debug Ù„ØªØªØ¨Ø¹ Ù…Ø´Ø§ÙƒÙ„ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ©
        // =================================================================
        //
        // Ù„ØªØ´ØºÙŠÙ„ ÙˆØ¶Ø¹ Debug:
        // 1. Ø§ÙØªØ­ ØµÙØ­Ø© Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª (admin/admin-products.html)
        // 2. Ø§ÙØªØ­ Console (F12 â†’ Console)
        // 3. Ø±Ø§Ù‚Ø¨ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ØªÙŠ ØªØ¨Ø¯Ø£ Ø¨Ù€ "ðŸ” [DEBUG]"
        //
        // Ø£Ù†ÙˆØ§Ø¹ Ø±Ø³Ø§Ø¦Ù„ Debug:
        // ðŸ” [DEBUG] ===== STARTING... =====  â†’ Ø¨Ø¯Ø§ÙŠØ© Ø¹Ù…Ù„ÙŠØ©
        // ðŸ” [DEBUG] âœ…                      â†’ Ù†Ø¬Ø§Ø­
        // ðŸ” [DEBUG] âŒ                      â†’ Ø®Ø·Ø£
        // ðŸ” [DEBUG] âš ï¸                      â†’ ØªØ­Ø°ÙŠØ±
        // ðŸ” [DEBUG] ===== END... =====      â†’ Ù†Ù‡Ø§ÙŠØ© Ø¹Ù…Ù„ÙŠØ©
        //
        // =================================================================

        let allProducts = [];
        let currentFilter = 'koshat';
        let productToDelete = null;
        
        // Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„ØªØ±Ù‚ÙŠÙ…
        let currentPage = 1;
        let productsPerPage = 15;
        let totalPages = 1;

        // Check admin authentication
        let adminSecurityCheckStarted = false;
        
        function checkAdminSecurity() {
            if (adminSecurityCheckStarted) {
                return;
            }
            
            if (!window.adminSecurity) {
                console.log('â³ Waiting for adminSecurity to load...');
                adminSecurityCheckStarted = true;
                setTimeout(checkAdminSecurity, 100);
                return;
            }
            console.log('âœ… adminSecurity loaded successfully');
        }
        
        setTimeout(checkAdminSecurity, 100);

        // Load page data
        window.onload = async function() {
            console.log('ðŸ”„ Admin products page loading...');
            
            // Wait for adminSecurity
            while (!window.adminSecurity) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log('âœ… AdminSecurity loaded');
            
            // Wait for ProductService
            while (!window.ProductService) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log('âœ… ProductService loaded');
            
            await loadAllProducts();
            await loadStatistics();
            
            // Set initial filter to koshat
            applyFilter('koshat');
        };

        // Load all products from all tables
        async function loadAllProducts() {
            console.log('ðŸ” [DEBUG] ===== STARTING loadAllProducts =====');
            try {
                const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
                console.log('ðŸ” [DEBUG] Tables to load:', tables);
                allProducts = [];
                console.log('ðŸ” [DEBUG] Cleared allProducts array');

                for (const table of tables) {
                    try {
                        const { data: products, error } = await window.supabaseClient
                            .from(table)
                            .select('*');
                        
                        if (!error && products) {
                            // Add table name to each product for identification
                            products.forEach(product => {
                                product.sourceTable = table;
                                
                                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§Ø±ØºØ© - ØªØ­Ø³ÙŠÙ† Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©
                                if (product.subcategory === null || product.subcategory === undefined || product.subcategory === 'null') {
                                    product.subcategory = '';
                                }
                                
                                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§Ø±ØºØ© Ù„Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª
                                if (product.governorate === null || product.governorate === undefined || product.governorate === 'null') {
                                    product.governorate = '';
                                }
                                
                                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§Ø±ØºØ© Ù„Ù„Ù…Ø¯Ù†
                                if (product.cities === null || product.cities === undefined || product.cities === 'null') {
                                    product.cities = '';
                                }
                                
                                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§Ø±ØºØ© Ù„Ù„ØµÙˆØ±
                                if (product.image_urls === null || product.image_urls === undefined || product.image_urls === 'null') {
                                    product.image_urls = [];
                                }
                                
                                // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ© - ØªØ­Ø³ÙŠÙ† Ù„Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯
                                console.log(`ðŸ” [DEBUG] Processing subcategory for product ${product.id} from database:`, {
                                    rawSubcategory: product.subcategory,
                                    type: typeof product.subcategory,
                                    category: product.category
                                });

                                if (product.subcategory && typeof product.subcategory === 'string') {
                                    try {
                                        // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string (Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯)
                                        const parsed = JSON.parse(product.subcategory);
                                        console.log(`ðŸ” [DEBUG] JSON.parse successful for product ${product.id}:`, parsed);

                                        if (Array.isArray(parsed)) {
                                            // ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù† Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„ÙØ§Ø±ØºØ©
                                            const filtered = parsed.filter(sub => sub && sub.trim() !== '' && sub !== 'null');
                                            product.subcategory = filtered;
                                            console.log(`ðŸ” [DEBUG] Parsed JSON array for product ${product.id}:`, {
                                                original: parsed,
                                                filtered: filtered,
                                                length: filtered.length
                                            });
                                        } else if (parsed && typeof parsed === 'string') {
                                            // JSON ÙˆÙ„ÙŠØ³ Ù…ØµÙÙˆÙØ©ØŒ Ø­ÙˆÙ„Ù‡ Ù„Ù…ØµÙÙˆÙØ©
                                            product.subcategory = [parsed];
                                            console.log(`ðŸ” [DEBUG] Converted single JSON value to array for product ${product.id}:`, product.subcategory);
                                        } else {
                                            console.log(`ðŸ” [DEBUG] JSON parsed but invalid data for product ${product.id}:`, parsed);
                                        }
                                    } catch (e) {
                                        // Ø¥Ø°Ø§ ÙØ´Ù„ JSONØŒ Ø§ØªØ±ÙƒÙ‡ ÙƒÙ…Ø§ Ù‡Ùˆ (Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ù‚Ø¯ÙŠÙ…)
                                        console.log(`ðŸ” [DEBUG] JSON parse failed for product ${product.id}, keeping as string:`, {
                                            error: e.message,
                                            originalValue: product.subcategory
                                        });
                                    }
                                } else {
                                    console.log(`ðŸ” [DEBUG] Product ${product.id} has no subcategory or not a string:`, {
                                        hasSubcategory: !!product.subcategory,
                                        type: typeof product.subcategory,
                                        value: product.subcategory
                                    });
                                }

                                // ÙØ­Øµ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ù„Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„ÙØ±Ø¹ÙŠ
                                console.log(`ðŸ” Product ${product.id} from ${table}:`, {
                                    id: product.id,
                                    category: product.category,
                                    subcategory: product.subcategory,
                                    sub_category: product.sub_category,
                                    subcategory_id: product.subcategory_id,
                                    subcategoryType: typeof product.subcategory,
                                    allFields: Object.keys(product)
                                });
                            });
                            allProducts = allProducts.concat(products);
                        }
                    } catch (tableError) {
                        console.error(`Error loading ${table}:`, tableError);
                    }
                }

                console.log('ðŸ” [DEBUG] ===== loadAllProducts COMPLETED =====');
                console.log('ðŸ” [DEBUG] Total products loaded:', allProducts.length);
                console.log('ðŸ” [DEBUG] Sample of loaded products:');

                // Ø¹Ø±Ø¶ Ø¹ÙŠÙ†Ø© Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø­Ù…Ù„Ø©
                const sampleSize = Math.min(3, allProducts.length);
                for (let i = 0; i < sampleSize; i++) {
                    const product = allProducts[i];
                    console.log(`ðŸ” [DEBUG] Sample product ${i + 1}:`, {
                        id: product.id,
                        category: product.category,
                        subcategory: product.subcategory,
                        subcategoryType: typeof product.subcategory,
                        sourceTable: product.sourceTable
                    });
                }

                // Check for category-table mismatches and fix them
                console.log('ðŸ” [DEBUG] ===== CHECKING FOR CATEGORY-TABLE MISMATCHES =====');
                let mismatchCount = 0;
                allProducts.forEach(product => {
                    const expectedTable = getTableNameForCategory(product.category);
                    if (product.sourceTable !== expectedTable) {
                        console.log(`ðŸ” [DEBUG] âš ï¸ Category-table mismatch found:`, {
                            productId: product.id,
                            category: product.category,
                            currentTable: product.sourceTable,
                            expectedTable: expectedTable
                        });
                        mismatchCount++;
                        // Fix the mismatch by updating sourceTable
                        product.sourceTable = expectedTable;
                    }
                });
                
                if (mismatchCount > 0) {
                    console.log(`ðŸ” [DEBUG] âœ… Fixed ${mismatchCount} category-table mismatches`);
                } else {
                    console.log('ðŸ” [DEBUG] âœ… No category-table mismatches found');
                }

                updateProductCounts();
                applyFilter(currentFilter);
                displayProducts(allProducts);

            } catch (error) {
                console.error('Error loading products:', error);
                console.log('ðŸ” [DEBUG] âŒ loadAllProducts failed with error:', error.message);
            }
        }

        // Load statistics
        async function loadStatistics() {
            try {
                // Total products
                document.getElementById('totalProducts').textContent = allProducts.length;

                // Total users
                const { data: users, error: usersError } = await window.supabaseClient
                    .from('users')
                    .select('*');

                if (!usersError && users) {
                    document.getElementById('totalUsers').textContent = users.length;
                }

                // Active products (products with status or recent)
                const activeProducts = allProducts.filter(product => 
                    !product.deleted_at && product.status !== 'deleted'
                );
                document.getElementById('activeProducts').textContent = activeProducts.length;

            } catch (error) {
                console.error('Error loading statistics:', error);
            }
        }

        // Update product counts
        function updateProductCounts() {
            const categories = ['koshat', 'cake', 'mirr', 'other', 'invitations', 'flowerbouquets'];
            
            categories.forEach(category => {
                const countElement = document.getElementById(`count-${category}`);
                if (countElement) {
                                const count = allProducts.filter(product => product.category === category).length;
                    countElement.textContent = count;
                }
            });
        }

        // Apply filter
        function applyFilter(category) {
            currentFilter = category;
            currentPage = 1; // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„ØµÙØ­Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø¹Ù†Ø¯ ØªØºÙŠÙŠØ± Ø§Ù„ÙÙ„ØªØ±
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeButton = document.querySelector(`[data-category="${category}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            // Filter products
            const filteredProducts = allProducts.filter(product => product.category === category);
            
            displayProducts(filteredProducts);
        }

        // Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ø¹ Ø¯Ø¹Ù… Ø§Ù„ØªØ±Ù‚ÙŠÙ…
        function displayProducts(products) {
            const loadingState = document.getElementById('loading-state');
            const emptyState = document.getElementById('empty-state');
            const productsContainer = document.getElementById('products-container');
            const productsGrid = document.getElementById('products-grid');

            loadingState.style.display = 'none';

            if (products.length === 0) {
                emptyState.style.display = 'block';
                productsContainer.style.display = 'none';
                updatePagination(0);
                return;
            }

            emptyState.style.display = 'none';
            productsContainer.style.display = 'block';

            // Ø­Ø³Ø§Ø¨ Ø§Ù„ØªØ±Ù‚ÙŠÙ…
            totalPages = Math.ceil(products.length / productsPerPage);
            if (currentPage > totalPages) {
                currentPage = 1;
            }

            // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù„Ù„ØµÙØ­Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©
            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const productsToShow = products.slice(startIndex, endIndex);

            console.log('ðŸ” [DEBUG] Displaying products:', productsToShow.length);
            console.log('ðŸ” [DEBUG] Page:', currentPage, 'of', totalPages);
            console.log('ðŸ” [DEBUG] Sample product data:', productsToShow[0]);

            console.log('ðŸ” [DEBUG] ===== STARTING displayProducts =====');
            console.log('ðŸ” [DEBUG] Total products to display:', productsToShow.length);

            productsGrid.innerHTML = productsToShow.map((product, index) => {
                console.log(`ðŸ” [DEBUG] Processing product ${index + 1}/${products.length}:`, {
                    id: product.id,
                    title: product.title,
                    category: product.category,
                    subcategory: product.subcategory
                });

                const imageUrl = product.image_urls && product.image_urls.length > 0
                    ? product.image_urls[0]
                    : 'https://placehold.co/400x280/EEE/31343C?text=Ù„Ø§+ØªÙˆØ¬Ø¯+ØµÙˆØ±Ø©';

                console.log(`ðŸ” [DEBUG] Calling getSubcategoryDisplayData for product ${product.id}...`);
                const displayData = getSubcategoryDisplayData(product);
                console.log(`ðŸ” [DEBUG] getSubcategoryDisplayData result for product ${product.id}:`, displayData);

                const price = product.price ? `${product.price} Ø¬Ù†ÙŠÙ‡` : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
                const description = product.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ';
                const shortDescription = description.length > 100 ? description.substring(0, 100) + '...' : description;

                console.log(`ðŸ” [DEBUG] Product ${product.id} display setup:`, {
                    mainTitle: displayData.mainTitle,
                    badgesCount: displayData.badges ? displayData.badges.length : 0,
                    hasSubcategories: displayData.hasSubcategories
                });

                // Ø¥Ù†Ø´Ø§Ø¡ badges Ù„Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ©
                const subcategoryBadges = displayData.badges && displayData.badges.length > 0 ? displayData.badges.map(sub => {
                    if (sub === '...') {
                        const remainingCount = displayData.totalSubcategories ? displayData.totalSubcategories - 2 : 0;
                        return `<span class="inline-block bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">+${remainingCount} Ø£Ø®Ø±Ù‰</span>`;
                    }
                    return `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">${sub}</span>`;
                }).join('') : '';

                console.log(`ðŸ” [DEBUG] Generated badges HTML for product ${product.id}:`, subcategoryBadges);

                const cardHtml = `
                    <div class="product-card" onclick="viewProduct('${product.id}', '${product.sourceTable}')">
                        <div class="product-image-container">
                            <img src="${imageUrl}" alt="${displayData.mainTitle}" class="product-image">
                            <div class="product-overlay">
                                <div class="product-badges">
                                    <span class="product-category-badge">${displayData.mainTitle}</span>
                                    <span class="product-status-badge active">Ù†Ø´Ø·</span>
                                </div>
                                <div class="product-hover-info">
                                    <div class="hover-text">Ø§Ø¶ØºØ· Ù„Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„ÙƒØ§Ù…Ù„Ø©</div>
                                </div>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-title">${displayData.mainTitle}</div>
                            ${displayData.hasSubcategories ? `<div class="mb-2">${subcategoryBadges}</div>` : ''}
                            <div class="product-description">${shortDescription}</div>
                            <div class="product-meta">
                                <div class="meta-item">
                                    <span class="meta-icon">ðŸ“</span>
                                    <span class="meta-text">${product.governorate || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                </div>
                                ${product.category === 'flowerbouquets' && product.colors ? `
                                <div class="meta-item">
                                    <span class="meta-icon">ðŸŽ¨</span>
                                    <span class="meta-text">${product.colors}</span>
                                </div>
                                ` : ''}
                                <div class="meta-item">
                                    <span class="meta-icon">ðŸ“…</span>
                                    <span class="meta-text">${product.created_at ? new Date(product.created_at).toLocaleDateString('ar-EG') : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}</span>
                                </div>
                            </div>
                            <div class="product-price">${price}</div>
                            <div class="product-actions">
                                <button class="btn btn-view" onclick="event.stopPropagation(); viewProduct('${product.id}', '${product.sourceTable}')">
                                    ðŸ‘ï¸ Ø¹Ø±Ø¶
                                </button>
                                <button class="btn btn-edit" onclick="event.stopPropagation(); editProduct('${product.id}', '${product.sourceTable}')">
                                    âœï¸ ØªØ¹Ø¯ÙŠÙ„
                                </button>
                                <button class="btn btn-delete" onclick="event.stopPropagation(); deleteProduct('${product.id}', '${product.sourceTable}')">
                                    ðŸ—‘ï¸ Ø­Ø°Ù
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                console.log(`ðŸ” [DEBUG] Generated card HTML for product ${product.id}:`, {
                    mainTitle: displayData.mainTitle,
                    hasSubcategories: displayData.hasSubcategories,
                    badgesHtml: subcategoryBadges,
                    processingMethod: displayData.processingMethod,
                    rawData: displayData.rawData
                });

                return cardHtml;
            }).join('');

            console.log('ðŸ” [DEBUG] ===== END displayProducts =====');
            console.log('ðŸ” [DEBUG] Total cards generated:', productsToShow.length);
            
            // ØªØ­Ø¯ÙŠØ« ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„ØªØ±Ù‚ÙŠÙ…
            updatePagination(products.length);
        }

        // Get category name
        function getCategoryName(category) {
            const categories = {
                'koshat': 'ÙƒÙˆØ´Ø§Øª',
                'cake': 'ØªÙˆØ±ØªØ©',
                'mirr': 'Ù…Ø±Ø§ÙŠØ§',
                'other': 'Ø£Ø®Ø±Ù‰',
                'invitations': 'Ø¯Ø¹ÙˆØ§Øª ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª',
            'flowerbouquets': 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ù„ÙˆØ±Ø¯'
            };
            return categories[category] || category;
        }

        // Ø¯ÙˆØ§Ù„ Ø§Ù„ØªØ±Ù‚ÙŠÙ…
        function updatePagination(totalProducts) {
            const paginationContainer = document.getElementById('pagination-container');
            const paginationInfo = document.getElementById('pagination-info');
            const pageNumbers = document.getElementById('page-numbers');
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');

            if (totalProducts === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            // ØªØ­Ø¯ÙŠØ« Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªØ±Ù‚ÙŠÙ…
            const startItem = (currentPage - 1) * productsPerPage + 1;
            const endItem = Math.min(currentPage * productsPerPage, totalProducts);
            paginationInfo.textContent = `Ø¹Ø±Ø¶ ${startItem}-${endItem} Ù…Ù† ${totalProducts} Ù…Ù†ØªØ¬`;

            // ØªØ­Ø¯ÙŠØ« Ø£Ø²Ø±Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;

            // Ø¥Ù†Ø´Ø§Ø¡ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ØµÙØ­Ø§Øª
            pageNumbers.innerHTML = '';
            
            if (totalPages <= 7) {
                // Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„ØµÙØ­Ø§Øª Ø¥Ø°Ø§ ÙƒØ§Ù†Øª 7 Ø£Ùˆ Ø£Ù‚Ù„
                for (let i = 1; i <= totalPages; i++) {
                    const pageBtn = createPageButton(i, i === currentPage);
                    pageNumbers.appendChild(pageBtn);
                }
            } else {
                // Ø¹Ø±Ø¶ Ø§Ù„ØµÙØ­Ø§Øª Ù…Ø¹ Ø§Ù„Ù†Ù‚Ø§Ø· (...)
                const pageBtn1 = createPageButton(1, currentPage === 1);
                pageNumbers.appendChild(pageBtn1);

                if (currentPage > 3) {
                    const ellipsis1 = createEllipsis();
                    pageNumbers.appendChild(ellipsis1);
                }

                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);

                for (let i = start; i <= end; i++) {
                    const pageBtn = createPageButton(i, i === currentPage);
                    pageNumbers.appendChild(pageBtn);
                }

                if (currentPage < totalPages - 2) {
                    const ellipsis2 = createEllipsis();
                    pageNumbers.appendChild(ellipsis2);
                }

                if (totalPages > 1) {
                    const pageBtnLast = createPageButton(totalPages, currentPage === totalPages);
                    pageNumbers.appendChild(pageBtnLast);
                }
            }
        }

        function createPageButton(pageNum, isActive) {
            const button = document.createElement('button');
            button.className = `page-number ${isActive ? 'active' : ''}`;
            button.textContent = pageNum;
            button.onclick = () => goToPage(pageNum);
            return button;
        }

        function createEllipsis() {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-number ellipsis';
            ellipsis.textContent = '...';
            return ellipsis;
        }

        function goToPage(page) {
            if (page < 1 || page > totalPages || page === currentPage) return;
            
            currentPage = page;
            
            // Ø¥Ø¹Ø§Ø¯Ø© Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù„Ù„ØµÙØ­Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©
            const filteredProducts = allProducts.filter(product => product.category === currentFilter);
            displayProducts(filteredProducts);
            
            // Ø§Ù„ØªÙ…Ø±ÙŠØ± Ø¥Ù„Ù‰ Ø£Ø¹Ù„Ù‰ Ø§Ù„ØµÙØ­Ø©
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function goToPreviousPage() {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        }

        function goToNextPage() {
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        }

        // Get subcategory display names and badges
        function getSubcategoryDisplayData(product) {
            console.log('ðŸ” [DEBUG] ===== STARTING getSubcategoryDisplayData =====');
            console.log('ðŸ” [DEBUG] Product ID:', product.id);
            console.log('ðŸ” [DEBUG] Raw subcategory data:', product.subcategory);
            console.log('ðŸ” [DEBUG] Subcategory type:', typeof product.subcategory);
            console.log('ðŸ” [DEBUG] Product category:', product.category);
            console.log('ðŸ” [DEBUG] Full product object:', product);

            let subcategories = [];
            let processingMethod = 'NONE';

            // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
            if (product.subcategory === null || product.subcategory === undefined) {
                console.log('ðŸ” [DEBUG] âŒ Subcategory is NULL or UNDEFINED');
                processingMethod = 'NULL_UNDEFINED';
            } else if (product.subcategory === '') {
                console.log('ðŸ” [DEBUG] âŒ Subcategory is EMPTY STRING');
                processingMethod = 'EMPTY_STRING';
            } else if (product.subcategory === 'null') {
                console.log('ðŸ” [DEBUG] âŒ Subcategory is STRING "null"');
                processingMethod = 'STRING_NULL';
            } else {
                console.log('ðŸ” [DEBUG] âœ… Subcategory has data, processing...');

                if (Array.isArray(product.subcategory)) {
                    console.log('ðŸ” [DEBUG] ðŸ“Š Data is ARRAY');
                    processingMethod = 'ARRAY';
                    subcategories = product.subcategory.filter(sub => {
                        const isValid = sub && sub.trim() !== '' && sub !== 'null';
                        console.log(`ðŸ” [DEBUG] Array item "${sub}" is valid: ${isValid}`);
                        return isValid;
                    });
                    console.log('ðŸ” [DEBUG] Filtered array subcategories:', subcategories);
                } else if (typeof product.subcategory === 'string') {
                    console.log('ðŸ” [DEBUG] ðŸ“ Data is STRING, attempting JSON parse...');
                    try {
                        const parsed = JSON.parse(product.subcategory);
                        console.log('ðŸ” [DEBUG] JSON.parse result:', parsed);
                        console.log('ðŸ” [DEBUG] JSON.parse result type:', typeof parsed);

                        if (Array.isArray(parsed)) {
                            console.log('ðŸ” [DEBUG] âœ… JSON parsed to ARRAY');
                            processingMethod = 'JSON_ARRAY';
                            subcategories = parsed.filter(sub => {
                                const isValid = sub && sub.trim() !== '' && sub !== 'null';
                                console.log(`ðŸ” [DEBUG] JSON array item "${sub}" is valid: ${isValid}`);
                                return isValid;
                            });
                            console.log('ðŸ” [DEBUG] Filtered JSON array subcategories:', subcategories);
                        } else if (parsed && typeof parsed === 'string' && parsed.trim() !== '') {
                            console.log('ðŸ” [DEBUG] âœ… JSON parsed to SINGLE STRING');
                            processingMethod = 'JSON_STRING';
                            subcategories = [parsed];
                            console.log('ðŸ” [DEBUG] Single JSON value as array:', subcategories);
                        } else {
                            console.log('ðŸ” [DEBUG] âš ï¸ JSON parsed but invalid data');
                            processingMethod = 'JSON_INVALID';
                        }
                    } catch (e) {
                        console.log('ðŸ” [DEBUG] âŒ JSON parse failed:', e.message);
                        console.log('ðŸ” [DEBUG] Attempting traditional parsing...');
                        processingMethod = 'TRADITIONAL_PARSE';

                        try {
                            if (product.subcategory.includes(',')) {
                                console.log('ðŸ” [DEBUG] String contains comma, splitting...');
                                subcategories = product.subcategory.split(',').map(item => {
                                    const trimmed = item.trim();
                                    console.log(`ðŸ” [DEBUG] Split item "${item}" -> "${trimmed}"`);
                                    return trimmed;
                                }).filter(item => item && item.trim() !== '' && item !== 'null');
                                console.log('ðŸ” [DEBUG] Traditional comma-split result:', subcategories);
                            } else if (product.subcategory.trim() !== '') {
                                console.log('ðŸ” [DEBUG] Single value string');
                                subcategories = [product.subcategory.trim()];
                                console.log('ðŸ” [DEBUG] Single value as array:', subcategories);
                            } else {
                                console.log('ðŸ” [DEBUG] String is empty after trimming');
                                subcategories = [];
                            }
                        } catch (parseError) {
                            console.log('ðŸ” [DEBUG] âŒ Traditional parsing also failed:', parseError.message);
                            processingMethod = 'PARSE_ERROR';
                            subcategories = [];
                        }
                    }
                } else {
                    console.log('ðŸ” [DEBUG] âš ï¸ Subcategory is not string or array:', typeof product.subcategory);
                    processingMethod = 'UNKNOWN_TYPE';
                }
            }

            console.log('ðŸ” [DEBUG] ===== PROCESSING SUMMARY =====');
            console.log('ðŸ” [DEBUG] Processing method:', processingMethod);
            console.log('ðŸ” [DEBUG] Final subcategories array:', subcategories);
            console.log('ðŸ” [DEBUG] Subcategories length:', subcategories.length);

            // Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©
            if (subcategories.length > 0) {
                const mainTitle = subcategories[0];
                console.log('ðŸ” [DEBUG] Main title (first subcategory):', mainTitle);

                // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ© Ø§Ù„Ù…Ø±Ø§Ø¯ Ø¹Ø±Ø¶Ù‡Ø§ ÙƒÙ€ badges
                let badges;
                if (subcategories.length <= 3) {
                    console.log('ðŸ” [DEBUG] Showing all subcategories as badges (â‰¤3)');
                    badges = subcategories;
                } else {
                    console.log('ðŸ” [DEBUG] Showing first 2 + "..." (more than 3)');
                    badges = [...subcategories.slice(0, 2), '...'];
                }

                const result = {
                    mainTitle,
                    badges,
                    hasSubcategories: true,
                    totalSubcategories: subcategories.length,
                    processingMethod,
                    rawData: product.subcategory
                };

                console.log('ðŸ” [DEBUG] âœ… Returning subcategory data:', result);
                console.log('ðŸ” [DEBUG] ===== END getSubcategoryDisplayData =====');
                return result;
            }

            // Ø¥Ø°Ø§ Ù„Ù… ØªÙˆØ¬Ø¯ ØªØµÙ†ÙŠÙØ§Øª ÙØ±Ø¹ÙŠØ©ØŒ Ø£Ø¹Ø¯ Ø§Ø³Ù… Ø§Ù„ÙØ¦Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙƒÙ€ fallback
            const categoryName = getCategoryName(product.category);
            console.log('ðŸ” [DEBUG] âš ï¸ No valid subcategories found');
            console.log('ðŸ” [DEBUG] Using category name as fallback:', categoryName);

            const fallbackResult = {
                mainTitle: categoryName,
                badges: [],
                hasSubcategories: false,
                processingMethod,
                rawData: product.subcategory
            };

            console.log('ðŸ” [DEBUG] Returning fallback result:', fallbackResult);
            console.log('ðŸ” [DEBUG] ===== END getSubcategoryDisplayData =====');
            return fallbackResult;
        }

        // View product
        function viewProduct(productId, tableName) {
            // Redirect to product details page
                            window.open(`../pages/products/product-details.html?id=${productId}&table=${tableName}`, '_blank');
        }

        // Edit product
        function editProduct(productId, tableName) {
            console.log('ðŸ” [DEBUG] ===== STARTING editProduct =====');
            console.log('ðŸ” [DEBUG] Product ID:', productId);
            console.log('ðŸ” [DEBUG] Table name:', tableName);

            // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ù†ØªØ¬ ÙÙŠ Ù…ØµÙÙˆÙØ© allProducts
            const product = allProducts.find(p => p.id === productId && p.sourceTable === tableName);
            if (!product) {
                console.log('ðŸ” [DEBUG] âŒ Product not found in allProducts array');
                alert('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬');
                return;
            }

            console.log('ðŸ” [DEBUG] âœ… Product found:', {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                category: product.category,
                subcategory: product.subcategory
            });

            console.log('ðŸ” [DEBUG] âœ… Product found in allProducts');
            console.log('ðŸ” [DEBUG] Raw product data:', product);
            console.log('ðŸ” [DEBUG] Product subcategory from database:', {
                subcategory: product.subcategory,
                type: typeof product.subcategory,
                isArray: Array.isArray(product.subcategory)
            });
            console.log('ðŸ” All product fields:', Object.keys(product));
            console.log('ðŸ” Product values:', {
                id: product.id,
                category: product.category,
                subcategory: product.subcategory,
                sub_category: product.sub_category,
                subcategory_id: product.subcategory_id,
                description: product.description,
                price: product.price,
                governorate: product.governorate,
                cities: product.cities,
                image_urls: product.image_urls
            });

            // Ù…Ù„Ø¡ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø¨Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬
            document.getElementById('edit-product-id').value = product.id;
            document.getElementById('edit-product-table').value = product.sourceTable;
            document.getElementById('edit-description').value = product.description || '';
            document.getElementById('edit-price').value = product.price || '';
            document.getElementById('edit-category').value = product.category || '';
            document.getElementById('edit-whatsapp').value = product.whatsapp || '';
            document.getElementById('edit-facebook').value = product.facebook || '';
            document.getElementById('edit-instagram').value = product.instagram || '';
            
            // Ù…Ù„Ø¡ Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ù„Ù„Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª
            if (product.category === 'flowerbouquets') {
                const colorFilterSection = document.getElementById('edit-color-filter-section');
                colorFilterSection.style.display = 'block';
                
                if (product.colors) {
                    const colors = product.colors.split(',').map(color => color.trim()).filter(color => color);
                    colors.forEach(color => {
                        const colorBtn = document.querySelector(`.edit-product-color-option-simple[data-color="${color}"]`);
                        if (colorBtn) {
                            colorBtn.classList.add('active');
                        }
                    });
                    updateEditProductSelectedColorsDisplay();
                }
            } else {
                const colorFilterSection = document.getElementById('edit-color-filter-section');
                colorFilterSection.style.display = 'none';
            }

            console.log('ðŸ” [DEBUG] Form filled with product data:', {
                description: product.description,
                price: product.price,
                category: product.category,
                whatsapp: product.whatsapp,
                facebook: product.facebook,
                instagram: product.instagram
            });

            // Populate governorates with better data handling
            let governorates = [];
            if (product.governorate && product.governorate !== '' && product.governorate !== 'null') {
                if (Array.isArray(product.governorate)) {
                    governorates = product.governorate;
                } else if (typeof product.governorate === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹
                    try {
                        if (product.governorate.startsWith('[') && product.governorate.endsWith(']')) {
                            const parsed = JSON.parse(product.governorate);
                            if (Array.isArray(parsed)) {
                                governorates = parsed;
                            }
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for governorate, treating as regular string');
                    }
                    
                    // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
                    if (governorates.length === 0) {
                        if (product.governorate.includes(',')) {
                            governorates = product.governorate.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (product.governorate !== 'null' && product.governorate !== '') {
                            governorates = [product.governorate];
                        }
                    }
                }
            }
            populateEditGovernorates(governorates);
            
            // Populate subcategories with simplified data handling
            let subcategories = [];
            console.log('ðŸ” Processing subcategory data for edit:', {
                subcategory: product.subcategory,
                type: typeof product.subcategory,
                isArray: Array.isArray(product.subcategory)
            });

            if (product.subcategory && product.subcategory !== '' && product.subcategory !== 'null') {
                if (Array.isArray(product.subcategory)) {
                    // Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø§Ù„ÙØ¹Ù„ Ù…ØµÙÙˆÙØ© (Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯)
                    subcategories = product.subcategory;
                    console.log('ðŸ” Using array subcategory data:', subcategories);
                } else if (typeof product.subcategory === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string
                    try {
                        const parsed = JSON.parse(product.subcategory);
                        if (Array.isArray(parsed)) {
                            subcategories = parsed;
                            console.log('ðŸ” Parsed JSON string to array:', subcategories);
                        } else {
                            // JSON ÙˆÙ„ÙŠØ³ Ù…ØµÙÙˆÙØ©ØŒ Ø§Ø³ØªØ®Ø¯Ù… ÙƒÙ‚ÙŠÙ…Ø© ÙˆØ§Ø­Ø¯Ø©
                            subcategories = [parsed];
                            console.log('ðŸ” JSON parsed to single value:', subcategories);
                        }
                    } catch (e) {
                        // Ù„ÙŠØ³ JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ©
                        console.log('ðŸ” Not JSON, using traditional parsing');
                        if (product.subcategory.includes(',')) {
                            subcategories = product.subcategory.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else {
                            subcategories = [product.subcategory];
                        }
                        console.log('ðŸ” Traditional parsing result:', subcategories);
                    }
                }
            } else {
                console.log('ðŸ” No subcategory data found for edit');
                subcategories = [];
            }

            console.log('ðŸ” Final subcategories for edit form:', subcategories);
            populateEditSubcategories(product.category, subcategories);
            
            // Populate cities with better data handling
            let cities = [];
            if (product.cities && product.cities !== '' && product.cities !== 'null') {
                if (Array.isArray(product.cities)) {
                    cities = product.cities;
                } else if (typeof product.cities === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹
                    try {
                        if (product.cities.startsWith('[') && product.cities.endsWith(']')) {
                            const parsed = JSON.parse(product.cities);
                            if (Array.isArray(parsed)) {
                                cities = parsed;
                            }
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for cities, treating as regular string');
                    }
                    
                    // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
                    if (cities.length === 0) {
                        if (product.cities.includes(',')) {
                            cities = product.cities.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (product.cities !== 'null' && product.cities !== '') {
                            cities = [product.cities];
                        }
                    }
                }
            }
            console.log('ðŸ” Populating cities for product:', cities);
            populateEditCities(governorates, cities);
            
            // Display current images with better data handling
            let imageUrls = [];
            if (product.image_urls && product.image_urls !== '' && product.image_urls !== 'null') {
                if (Array.isArray(product.image_urls)) {
                    imageUrls = product.image_urls;
                } else if (typeof product.image_urls === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹
                    try {
                        if (product.image_urls.startsWith('[') && product.image_urls.endsWith(']')) {
                            const parsed = JSON.parse(product.image_urls);
                            if (Array.isArray(parsed)) {
                                imageUrls = parsed;
                            }
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for image_urls, treating as regular string');
                    }
                    
                    // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
                    if (imageUrls.length === 0) {
                        if (product.image_urls.includes(',')) {
                            imageUrls = product.image_urls.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (product.image_urls !== 'null' && product.image_urls !== '') {
                            imageUrls = [product.image_urls];
                        }
                    }
                }
            }
            displayEditCurrentImages(imageUrls);

            console.log('ðŸ” [DEBUG] ===== editProduct COMPLETED =====');
            console.log('ðŸ” [DEBUG] Final edit data summary:', {
                productId: productId,
                category: product.category,
                subcategoriesCount: subcategories.length,
                subcategories: subcategories,
                citiesCount: cities.length
            });

            // Show modal
            document.getElementById('editModal').style.display = 'block';
            
            // Initialize cities filter when modal opens
            setTimeout(() => {
                initializeEditCitiesFilter();
                initializeEditProductColorFilter();
            }, 100);
        }

        // Populate governorates checkboxes
        function populateEditGovernorates(selectedGovernorates) {
            const governorates = [
                "ØªÙˆØµÙŠÙ„ Ù„ÙƒÙ„ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª","Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©","Ø§Ù„Ø¬ÙŠØ²Ø©","Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ©","Ø§Ù„Ø´Ø±Ù‚ÙŠØ©","Ø§Ù„ØºØ±Ø¨ÙŠØ©","Ø§Ù„Ù…Ù†ÙˆÙÙŠØ©","Ø§Ù„Ù‚Ù„ÙŠÙˆØ¨ÙŠØ©","Ø§Ù„Ø¨Ø­ÙŠØ±Ø©","ÙƒÙØ± Ø§Ù„Ø´ÙŠØ®","Ø¯Ù…ÙŠØ§Ø·","Ø§Ù„Ø¯Ù‚Ù‡Ù„ÙŠØ©","Ø§Ù„Ù…Ù†ÙŠØ§","Ø£Ø³ÙŠÙˆØ·","Ø³ÙˆÙ‡Ø§Ø¬","Ù‚Ù†Ø§","Ø§Ù„Ø£Ù‚ØµØ±","Ø£Ø³ÙˆØ§Ù†","Ø¨Ù†ÙŠ Ø³ÙˆÙŠÙ","Ø§Ù„ÙÙŠÙˆÙ…","Ø§Ù„ÙˆØ§Ø¯ÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯","Ø´Ù…Ø§Ù„ Ø³ÙŠÙ†Ø§Ø¡","Ø¬Ù†ÙˆØ¨ Ø³ÙŠÙ†Ø§Ø¡","Ø§Ù„Ø¨Ø­Ø± Ø§Ù„Ø£Ø­Ù…Ø±","Ù…Ø·Ø±ÙˆØ­","Ø¨ÙˆØ±Ø³Ø¹ÙŠØ¯","Ø§Ù„Ø¥Ø³Ù…Ø§Ø¹ÙŠÙ„ÙŠØ©","Ø§Ù„Ø³ÙˆÙŠØ³"
            ];
            
            // ØªØ­Ø³ÙŠÙ† Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
            let selected = [];
            if (selectedGovernorates && selectedGovernorates !== '' && selectedGovernorates !== 'null') {
                if (Array.isArray(selectedGovernorates)) {
                    selected = selectedGovernorates;
                } else if (typeof selectedGovernorates === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹
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
                    
                    // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
                    if (selected.length === 0) {
                        if (selectedGovernorates.includes(',')) {
                            selected = selectedGovernorates.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                        } else if (selectedGovernorates !== 'null' && selectedGovernorates !== '') {
                            selected = [selectedGovernorates];
                        }
                    }
                }
            }
            
            console.log('ðŸ” Processed selected governorates:', selected);
            
            const container = document.getElementById('edit-governorate-checkboxes');
            if (container) {
                container.innerHTML = governorates.map(gov => `
                    <label style="display: flex; align-items: center; gap: 8px; padding: 5px; cursor: pointer;">
                        <input type="checkbox" value="${gov}" ${selected.includes(gov) ? 'checked' : ''} style="width: 16px; height: 16px;">
                        <span style="font-size: 14px;">${gov}</span>
                    </label>
                `).join('');

                // Add event listeners to governorate checkboxes to update cities
                const governorateCheckboxes = container.querySelectorAll('input[type="checkbox"]');
                governorateCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const selectedGovernorates = [];
                        governorateCheckboxes.forEach(cb => {
                            if (cb.checked) {
                                selectedGovernorates.push(cb.value);
                            }
                        });
                        
                        // Get current cities to preserve them
                        const currentProduct = allProducts.find(p => p.id === document.getElementById('edit-product-id').value);
                        const currentCities = currentProduct ? currentProduct.cities : null;
                        
                        // Update cities based on selected governorates
                        populateEditCities(selectedGovernorates, currentCities);
                    });
                });
            } else {
                console.error('âŒ edit-governorate-checkboxes container not found');
            }
        }

        // Populate subcategories checkboxes
        function populateEditSubcategories(category, selectedSubcategory) {
            console.log('ðŸ” [DEBUG] ===== STARTING populateEditSubcategories =====');
            console.log('ðŸ” [DEBUG] Category:', category);
            console.log('ðŸ” [DEBUG] Selected subcategory data:', selectedSubcategory);
            console.log('ðŸ” [DEBUG] Selected subcategory type:', typeof selectedSubcategory);
            console.log('ðŸ” [DEBUG] Is array:', Array.isArray(selectedSubcategory));

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
            
            // ØªØ­Ø³ÙŠÙ† Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø¹ Ø¯Ø¹Ù… JSON strings
            let selected = [];
            console.log('ðŸ” Processing selectedSubcategory:', selectedSubcategory, typeof selectedSubcategory);

            if (selectedSubcategory && selectedSubcategory !== '' && selectedSubcategory !== 'null') {
                if (Array.isArray(selectedSubcategory)) {
                    selected = selectedSubcategory;
                    console.log('ðŸ” selectedSubcategory is already an array:', selected);
                } else if (typeof selectedSubcategory === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹ (Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©)
                    try {
                        const parsed = JSON.parse(selectedSubcategory);
                        if (Array.isArray(parsed)) {
                            selected = parsed;
                            console.log('ðŸ” Successfully parsed JSON array for checkboxes:', selected);
                        } else {
                            console.log('ðŸ” JSON parsed but not an array:', parsed);
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for checkboxes, trying fallback:', e.message);
                        // Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ© Ù„Ù„Ù†ØµÙˆØµ Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø©
                        if (selectedSubcategory.includes(',')) {
                            selected = selectedSubcategory.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                            console.log('ðŸ” Split by comma for checkboxes:', selected);
                        } else if (selectedSubcategory !== 'null' && selectedSubcategory !== '') {
                            selected = [selectedSubcategory];
                            console.log('ðŸ” Single value for checkboxes:', selected);
                        }
                    }
                }
            } else {
                console.log('ðŸ” No selectedSubcategory data for checkboxes');
            }
            
            console.log('ðŸ” Processed selected subcategories:', selected);
            
            const container = document.getElementById('edit-subcategory-checkboxes');
            if (container) {
                console.log('ðŸ” Available subcategories for category:', category, categorySubs);
                console.log('ðŸ” Selected subcategories to check:', selected);

                container.innerHTML = categorySubs.map(sub => {
                    const isChecked = selected.includes(sub.value);
                    console.log(`ðŸ” Checkbox for "${sub.value}": ${isChecked ? 'CHECKED' : 'NOT CHECKED'}`);

                    return `
                        <label style="display: flex; align-items: center; gap: 8px; padding: 5px; cursor: pointer;">
                            <input type="checkbox" value="${sub.value}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px;">
                            <span style="font-size: 14px;">${sub.label}</span>
                        </label>
                    `;
                }).join('');
                console.log('ðŸ” [DEBUG] âœ… Successfully populated subcategory checkboxes');
                console.log('ðŸ” [DEBUG] Total checkboxes created:', categorySubs.length);
                console.log('ðŸ” [DEBUG] ===== END populateEditSubcategories =====');
            } else {
                console.error('ðŸ” [DEBUG] âŒ edit-subcategory-checkboxes container not found');
            }
        }

        // Display current images in edit modal
        function displayEditCurrentImages(imageUrls) {
            const container = document.getElementById('current-images');
            
            if (imageUrls.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 14px;">Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±</p>';
                // Show instructions when no images
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
                    <img src="${url}" alt="ØµÙˆØ±Ø© ${index + 1}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e1e5e9; cursor: pointer;" onclick="previewImage('${url}')">
                    <div class="edit-image-number" style="position: absolute; bottom: 2px; left: 2px; background: #d4af37; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; z-index: 10;">
                        ${index + 1}
                    </div>
                    <button onclick="removeEditImage(${index})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">Ã—</button>
                </div>
            `).join('');

            // Add drag and drop event listeners
            const imageItems = container.querySelectorAll('.edit-image-item');
            imageItems.forEach(item => {
                item.addEventListener('dragstart', handleEditDragStart);
                item.addEventListener('dragover', handleEditDragOver);
                item.addEventListener('drop', handleEditDrop);
                item.addEventListener('dragenter', handleEditDragEnter);
                item.addEventListener('dragleave', handleEditDragLeave);
            });

            // Hide instructions when images are present
            const instructions = document.querySelector('.image-sort-instructions-edit');
            if (instructions) {
                instructions.style.display = 'none';
            }
        }

        // Preview image function
        function previewImage(url) {
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

        // Remove image from edit modal
        function removeEditImage(index) {
            if (confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„ØµÙˆØ±Ø©ØŸ')) {
                const productId = document.getElementById('edit-product-id').value;
                const product = allProducts.find(p => p.id === productId);
                
                if (product && product.image_urls) {
                    product.image_urls.splice(index, 1);
                    displayEditCurrentImages(product.image_urls);
                    alert('ØªÙ… Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø©');
                }
            }
        }

        // Drag and drop variables for edit modal
        let editDraggedElement = null;
        let editDraggedIndex = null;

        // Drag and drop functions for edit modal image sorting
        function handleEditDragStart(e) {
            editDraggedElement = this;
            editDraggedIndex = parseInt(this.getAttribute('data-index'));
            this.classList.add('dragging');
            this.style.opacity = '0.5';
            this.style.transform = 'rotate(5deg)';
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleEditDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleEditDragEnter(e) {
            e.preventDefault();
            this.classList.add('drag-over');
            this.style.border = '2px dashed #d4af37';
            this.style.background = 'rgba(212, 175, 55, 0.1)';
        }

        function handleEditDragLeave(e) {
            this.classList.remove('drag-over');
            this.style.border = '';
            this.style.background = '';
        }

        function handleEditDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            this.style.border = '';
            this.style.background = '';
            
            if (editDraggedElement !== this) {
                const dropIndex = parseInt(this.getAttribute('data-index'));
                const productId = document.getElementById('edit-product-id').value;
                const product = allProducts.find(p => p.id === productId);
                
                if (product && product.image_urls) {
                    // Reorder the image_urls array
                    const draggedImage = product.image_urls[editDraggedIndex];
                    product.image_urls.splice(editDraggedIndex, 1);
                    product.image_urls.splice(dropIndex, 0, draggedImage);
                    
                    // Redisplay images with new order
                    displayEditCurrentImages(product.image_urls);
                    
                    // Show success message
                    showEditSortSuccess();
                }
            }
            
            editDraggedElement.classList.remove('dragging');
            editDraggedElement.style.opacity = '';
            editDraggedElement.style.transform = '';
            editDraggedElement = null;
            editDraggedIndex = null;
        }

        function showEditSortSuccess() {
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
            
            // Remove message after 3 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }

        // Close edit modal
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }

        // Delete product
        function deleteProduct(productId, tableName) {
            console.log('ðŸ—‘ï¸ Delete button clicked for product:', productId, 'from table:', tableName);
            productToDelete = { id: productId, table: tableName };
            const deleteModal = document.getElementById('deleteModal');
            if (deleteModal) {
                deleteModal.style.display = 'block';
                console.log('âœ… Delete modal opened successfully');
            } else {
                console.error('âŒ Delete modal not found');
                alert('Ø®Ø·Ø£ ÙÙŠ ÙØªØ­ Ù†Ø§ÙØ°Ø© Ø§Ù„ØªØ£ÙƒÙŠØ¯');
            }
        }

        // Confirm delete
        async function confirmDelete() {
            if (!productToDelete) {
                console.error('âŒ No product selected for deletion');
                alert('Ù„Ù… ÙŠØªÙ… ØªØ­Ø¯ÙŠØ¯ Ù…Ù†ØªØ¬ Ù„Ù„Ø­Ø°Ù');
                return;
            }

            console.log('ðŸ—‘ï¸ Confirming deletion for product:', productToDelete);

            try {
                // Wait for ProductService to be available
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds
                
                while (!window.ProductService && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.ProductService) {
                    throw new Error('ProductService ØºÙŠØ± Ù…ØªØ§Ø­. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                }

                console.log('âœ… ProductService available, proceeding with deletion');

                // Find the product in allProducts to get the correct table
                const product = allProducts.find(p => p.id === productToDelete.id);
                if (!product) {
                    throw new Error('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬ ÙÙŠ Ø§Ù„Ø°Ø§ÙƒØ±Ø© Ø§Ù„Ù…Ø­Ù„ÙŠØ©');
                }

                console.log('ðŸ” [DEBUG] ===== DELETE PRODUCT DEBUG =====');
                console.log('ðŸ” [DEBUG] Product to delete:', {
                    id: product.id,
                    category: product.category,
                    sourceTable: product.sourceTable,
                    title: product.title
                });

                // Use ProductService to delete product (this will also delete images from storage)
                const result = await window.ProductService.deleteProduct(productToDelete.id, product.sourceTable);

                if (!result.success) {
                    throw new Error(result.error);
                }

                console.log('âœ… Product deleted successfully');
                alert('ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØ§Ù„ØµÙˆØ± Ø¨Ù†Ø¬Ø§Ø­');
                
                // Refresh the page data
                await loadAllProducts();
                await loadStatistics();
                
                // Re-apply current filter to maintain user's view
                applyFilter(currentFilter);

            } catch (error) {
                console.error('âŒ Error deleting product:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬: ' + error.message);
            }

            closeDeleteModal();
        }

        // Close delete modal
        function closeDeleteModal() {
            document.getElementById('deleteModal').style.display = 'none';
            productToDelete = null;
        }

        // Handle logout
        async function handleLogout() {
            try {
                while (!window.adminSecurity) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                await adminSecurity.logout();
            } catch (error) {
                console.error('Error logging out:', error);
                window.location.href = 'admin-login.html';
            }
        }

        // Setup event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Filter button clicks
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    applyFilter(category);
                });
            });

            // Edit form submission
            document.getElementById('editForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                await saveEditChanges();
            });

            // Category change in edit modal
            document.getElementById('edit-category').addEventListener('change', function() {
                populateEditSubcategories(this.value, []);
                
                // Show/hide color filter for flowerbouquets
                const colorFilterSection = document.getElementById('edit-color-filter-section');
                if (this.value === 'flowerbouquets') {
                    colorFilterSection.style.display = 'block';
                } else {
                    colorFilterSection.style.display = 'none';
                    // Clear selected colors
                    document.querySelectorAll('.edit-product-color-option-simple').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.getElementById('edit-product-selected-colors-simple').innerHTML = '';
                }
            });

            // Image upload in edit modal
            const imageUploadArea = document.getElementById('image-upload-area');
            const newImagesInput = document.getElementById('new-images');
            
            if (imageUploadArea && newImagesInput) {
                imageUploadArea.addEventListener('click', () => newImagesInput.click());
                
                newImagesInput.addEventListener('change', function(e) {
                    handleNewImages(e.target.files);
                });
            }

            // Close modals when clicking outside
            window.onclick = function(event) {
                const deleteModal = document.getElementById('deleteModal');
                const editModal = document.getElementById('editModal');
                
                if (event.target === deleteModal) {
                    closeDeleteModal();
                }
                if (event.target === editModal) {
                    closeEditModal();
                }
            }
        });

        // Handle new images in edit modal
        function handleNewImages(files) {
            const container = document.getElementById('current-images');
            
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
                            <img src="${e.target.result}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e1e5e9; cursor: pointer;" onclick="previewImage('${e.target.result}')">
                            <button onclick="this.parentElement.remove()" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">Ã—</button>
                        `;
                        container.appendChild(imgDiv);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Save edit changes
        async function saveEditChanges() {
            const productId = document.getElementById('edit-product-id').value;
            const tableName = document.getElementById('edit-product-table').value;
            
            if (!productId || !tableName) {
                alert('Ø®Ø·Ø£ ÙÙŠ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬');
                return;
            }

            // Get form data
            const description = document.getElementById('edit-description').value;
            const price = document.getElementById('edit-price').value;
            const category = document.getElementById('edit-category').value;
            const whatsapp = document.getElementById('edit-whatsapp').value;
            const facebook = document.getElementById('edit-facebook').value;
            const instagram = document.getElementById('edit-instagram').value;

            // Get selected governorates
            const selectedGovernorates = [];
            document.querySelectorAll('#edit-governorate-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                selectedGovernorates.push(checkbox.value);
            });

            // Get selected subcategories
            const selectedSubcategories = [];
            document.querySelectorAll('#edit-subcategory-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                selectedSubcategories.push(checkbox.value);
            });

            console.log('ðŸ” Saving selected subcategories:', selectedSubcategories);
            
            // Get selected colors
            const selectedColors = [];
            document.querySelectorAll('.edit-product-color-option-simple.active').forEach(btn => {
                selectedColors.push(btn.dataset.color);
            });

            // Convert subcategories to JSON string for consistent storage
            let subcategoryValue = null;
            if (selectedSubcategories.length > 0) {
                // Store as JSON string to ensure proper parsing
                subcategoryValue = JSON.stringify(selectedSubcategories);
                console.log('ðŸ” Subcategory JSON value:', subcategoryValue);
            }

            // Get selected cities
            const selectedCitiesArray = getEditSelectedCities();

            // Validation
            if (!description.trim()) {
                alert('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ÙˆØµÙ Ø§Ù„Ù…Ù†ØªØ¬');
                return;
            }

            if (selectedGovernorates.length === 0) {
                alert('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ø­Ø§ÙØ¸Ø© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }

            try {
                // Get current product to preserve image order
                const currentProduct = allProducts.find(p => p.id === productId && p.sourceTable === tableName);
                
                // Check if category has changed
                const categoryChanged = currentProduct && currentProduct.category !== category;
                const newTableName = categoryChanged ? getTableNameForCategory(category) : tableName;
                
                console.log('ðŸ” [DEBUG] ===== saveEditChanges - CATEGORY CHANGE CHECK =====');
                console.log('ðŸ” [DEBUG] Old category:', currentProduct ? currentProduct.category : 'N/A');
                console.log('ðŸ” [DEBUG] New category:', category);
                console.log('ðŸ” [DEBUG] Category changed:', categoryChanged);
                console.log('ðŸ” [DEBUG] Old table:', tableName);
                console.log('ðŸ” [DEBUG] New table:', newTableName);
                
                // Prepare update data
                const updateData = {
                    title: currentProduct.title || 'Ù…Ù†ØªØ¬ Ø¨Ø¯ÙˆÙ† Ø¹Ù†ÙˆØ§Ù†',
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
                    image_urls: currentProduct && currentProduct.image_urls ? currentProduct.image_urls : null,
                    user_id: currentProduct.user_id || null,
                    created_at: currentProduct.created_at || new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                // Ø¥Ø²Ø§Ù„Ø© Ø¹Ù…ÙˆØ¯ colors Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† Ø§Ù„Ø¬Ø¯ÙˆÙ„ products_flowerbouquets
                if (newTableName !== 'products_flowerbouquets' && updateData.colors !== undefined) {
                    delete updateData.colors;
                    console.log('ðŸ” Removed colors field for non-flowerbouquets table in update');
                }

                console.log('ðŸ” [DEBUG] ===== saveEditChanges - UPDATE DATA =====');
                console.log('ðŸ” [DEBUG] Product ID:', productId);
                console.log('ðŸ” [DEBUG] Old table:', tableName);
                console.log('ðŸ” [DEBUG] New table:', newTableName);
                console.log('ðŸ” [DEBUG] Selected subcategories array:', selectedSubcategories);
                console.log('ðŸ” [DEBUG] Subcategory JSON value:', subcategoryValue);
                console.log('ðŸ” [DEBUG] Full update data:', updateData);

                if (categoryChanged) {
                    // Category changed - need to move product to new table
                    console.log('ðŸ” [DEBUG] ðŸš€ Category changed - moving product to new table');
                    
                    // 1. Insert into new table
                    const { data: newProduct, error: insertError } = await window.supabaseClient
                        .from(newTableName)
                        .insert([updateData])
                        .select();

                    if (insertError) {
                        throw new Error(`Failed to insert into new table ${newTableName}: ${insertError.message}`);
                    }

                    console.log('ðŸ” [DEBUG] âœ… Product inserted into new table:', newProduct[0]);

                    // 2. Delete from old table
                    const { error: deleteError } = await window.supabaseClient
                        .from(tableName)
                        .delete()
                        .eq('id', productId);

                    if (deleteError) {
                        console.warn('âš ï¸ Warning: Could not delete from old table:', deleteError.message);
                        // Continue anyway as the product is now in the new table
                    } else {
                        console.log('ðŸ” [DEBUG] âœ… Product deleted from old table');
                    }

                    // 3. ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…ØµÙÙˆÙØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ©
                    const productIndex = allProducts.findIndex(p => p.id === productId && p.sourceTable === tableName);
                    if (productIndex !== -1) {
                        // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ©
                        let parsedSubcategory = null;
                        if (subcategoryValue) {
                            try {
                                parsedSubcategory = JSON.parse(subcategoryValue);
                                console.log('ðŸ” [DEBUG] Parsed subcategory for local storage:', parsedSubcategory);
                            } catch (e) {
                                console.log('ðŸ” [DEBUG] Could not parse subcategory for local storage:', e.message);
                                parsedSubcategory = subcategoryValue;
                            }
                        }

                        // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†ØªØ¬ ÙÙŠ Ø§Ù„Ù…ØµÙÙˆÙØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ© Ù…Ø¹ Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø¬Ø¯ÙŠØ¯
                        allProducts[productIndex] = {
                            ...allProducts[productIndex],
                            description: description,
                            price: price || null,
                            category: category,
                            subcategory: parsedSubcategory,
                            governorate: selectedGovernorates.join(', '),
                            cities: selectedCitiesArray.length > 0 ? selectedCitiesArray.join(', ') : null,
                            whatsapp: whatsapp,
                            facebook: facebook || null,
                            instagram: instagram || null,
                            colors: selectedColors.length > 0 ? selectedColors.join(', ') : null,
                            sourceTable: newTableName,  // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…ØµØ¯Ø±
                            updated_at: new Date().toISOString()
                        };

                        console.log('ðŸ” [DEBUG] âœ… Updated local product with new table:', newTableName);
                    }

                } else {
                    // Category didn't change - just update in current table
                    console.log('ðŸ” [DEBUG] ðŸ”„ Category unchanged - updating in current table');
                    
                    // Ø¥Ø²Ø§Ù„Ø© Ø¹Ù…ÙˆØ¯ colors Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† Ø§Ù„Ø¬Ø¯ÙˆÙ„ products_flowerbouquets
                    if (tableName !== 'products_flowerbouquets' && updateData.colors !== undefined) {
                        delete updateData.colors;
                        console.log('ðŸ” Removed colors field for non-flowerbouquets table in update');
                    }

                    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                    const { error } = await window.supabaseClient
                        .from(tableName)
                        .update(updateData)
                        .eq('id', productId);

                    if (error) {
                        throw error;
                    }

                    console.log('ðŸ” [DEBUG] âœ… Database update successful for product:', productId);

                    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…ØµÙÙˆÙØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ©
                    const productIndex = allProducts.findIndex(p => p.id === productId && p.sourceTable === tableName);
                    if (productIndex !== -1) {
                        // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„ÙØ±Ø¹ÙŠØ©
                        let parsedSubcategory = null;
                        if (subcategoryValue) {
                            try {
                                parsedSubcategory = JSON.parse(subcategoryValue);
                                console.log('ðŸ” [DEBUG] Parsed subcategory for local storage:', parsedSubcategory);
                            } catch (e) {
                                console.log('ðŸ” [DEBUG] Could not parse subcategory for local storage:', e.message);
                                parsedSubcategory = subcategoryValue;
                            }
                        }

                        // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†ØªØ¬ ÙÙŠ Ø§Ù„Ù…ØµÙÙˆÙØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ©
                        allProducts[productIndex] = {
                            ...allProducts[productIndex],
                            description: description,
                            price: price || null,
                            category: category,
                            subcategory: parsedSubcategory,
                            governorate: selectedGovernorates.join(', '),
                            cities: selectedCitiesArray.length > 0 ? selectedCitiesArray.join(', ') : null,
                            whatsapp: whatsapp,
                            facebook: facebook || null,
                            instagram: instagram || null,
                            colors: selectedColors.length > 0 ? selectedColors.join(', ') : null,
                            updated_at: new Date().toISOString()
                        };

                        console.log('ðŸ” [DEBUG] âœ… Local product updated successfully:', {
                            productId: productId,
                            oldSubcategory: allProducts[productIndex].subcategory,
                            newSubcategory: parsedSubcategory,
                            newDescription: description,
                            newPrice: price
                        });
                    } else {
                        console.log('ðŸ” [DEBUG] âš ï¸ Product not found in local array for update');
                    }
                }

                alert('ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†ØªØ¬ Ø¨Ù†Ø¬Ø§Ø­');
                closeEditModal();

                // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¹Ø±Ø¶ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø¯ÙˆÙ† Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ ÙƒØ§Ù…Ù„
                console.log('ðŸ”„ Updating display after product update...');
                
                // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª
                await loadStatistics();
                
                // Ø¥Ø¹Ø§Ø¯Ø© ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ÙÙ„ØªØ± Ø§Ù„Ø­Ø§Ù„ÙŠ Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø«Ø©
                applyFilter(currentFilter);

                console.log('âœ… Product update completed - Display updated successfully');

            } catch (error) {
                console.error('Error updating product:', error);
                alert('Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†ØªØ¬: ' + error.message);
            }
        }

        // Helper function to get table name for category
        function getTableNameForCategory(category) {
            const tableMap = {
                            'cake': 'products_cake',
            'koshat': 'products_koshat',
            'mirr': 'products_mirr',
            'other': 'products_other',
            'invitations': 'products_invitations',
            'flowerbouquets': 'products_flowerbouquets'
            };
            
            const tableName = tableMap[category];
            if (!tableName) {
                console.warn(`âš ï¸ Unknown category: ${category}, defaulting to products_other`);
                return 'products_other';
            }
            
            console.log(`ðŸ“‹ Mapping category "${category}" to table "${tableName}"`);
            return tableName;
        }

        // Cities Filter Variables for Edit Modal
        let editCitiesService;
        let editSelectedCities = new Set();
        let editCurrentGovernorates = [];

        // Initialize Cities Filter for Edit Modal
        function initializeEditCitiesFilter() {
            console.log('ðŸ” Initializing Edit Cities Filter');
            
            // Check if CitiesService is available
            if (typeof CitiesService === 'undefined') {
                console.error('âŒ CitiesService not available');
                return;
            }
            
            // Initialize CitiesService
            editCitiesService = new CitiesService();
            console.log('âœ… CitiesService initialized');
            
            // Setup cities filter functionality
            setupEditCitiesFilter();
        }

        // Setup Cities Filter for Edit Modal
        function setupEditCitiesFilter() {
            const citiesTrigger = document.getElementById('edit-cities-trigger');
            const citiesDropdown = document.getElementById('edit-cities-dropdown');
            const citiesSearch = document.getElementById('edit-cities-search');
            const selectAllCitiesBtn = document.getElementById('edit-select-all-cities-btn');
            const clearAllCitiesBtn = document.getElementById('edit-clear-all-cities-btn');
            const applyCitiesFilterBtn = document.getElementById('edit-apply-cities-filter');

            // Check if elements exist
            if (!citiesTrigger || !citiesDropdown || !citiesSearch || !selectAllCitiesBtn || !clearAllCitiesBtn || !applyCitiesFilterBtn) {
                console.error('âŒ Cities filter elements not found');
                console.log('ðŸ” Elements check:', {
                    citiesTrigger: !!citiesTrigger,
                    citiesDropdown: !!citiesDropdown,
                    citiesSearch: !!citiesSearch,
                    selectAllCitiesBtn: !!selectAllCitiesBtn,
                    clearAllCitiesBtn: !!clearAllCitiesBtn,
                    applyCitiesFilterBtn: !!applyCitiesFilterBtn
                });
                return;
            }
            
            console.log('âœ… All cities filter elements found');

            // Toggle dropdown
            citiesTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('ðŸ” Cities trigger clicked');
                citiesDropdown.classList.toggle('show');
                citiesTrigger.classList.toggle('active');
                console.log('ðŸ” Dropdown classes:', citiesDropdown.classList.toString());
                console.log('ðŸ” Trigger classes:', citiesTrigger.classList.toString());
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
                filterEditCities(this.value);
            });

            // Select all cities
            selectAllCitiesBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('#edit-cities-list .city-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    editSelectedCities.add(checkbox.value);
                });
                updateEditCitiesDisplay();
            });

            // Clear all cities
            clearAllCitiesBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('#edit-cities-list .city-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                editSelectedCities.clear();
                updateEditCitiesDisplay();
            });

            // Apply filter
            applyCitiesFilterBtn.addEventListener('click', function() {
                citiesDropdown.classList.remove('show');
                citiesTrigger.classList.remove('active');
            });
        }

        // Populate Cities for Edit Modal
        function populateEditCities(selectedGovernorates, currentCities) {
            console.log('ðŸ” PopulateEditCities called with:', { selectedGovernorates, currentCities });
            
            const citiesList = document.getElementById('edit-cities-list');
            const citiesTrigger = document.getElementById('edit-cities-trigger');
            const citiesSearch = document.getElementById('edit-cities-search');

            if (!citiesList || !citiesTrigger || !citiesSearch) {
                console.error('âŒ Cities elements not found in populateEditCities');
                return;
            }

            // Clear previous selections and reinitialize editSelectedCities
            editSelectedCities = new Set();

            if (!selectedGovernorates || selectedGovernorates.length === 0) {
                // Hide cities filter if no governorates selected
                citiesList.innerHTML = '<div style="padding: 16px; text-align: center; color: #666;">Ø§Ø®ØªØ± Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø£ÙˆÙ„Ø§Ù‹</div>';
                updateEditCitiesDisplay();
                return;
            }

            // Parse governorates
            let governorates = [];
            if (selectedGovernorates && Array.isArray(selectedGovernorates)) {
                governorates = selectedGovernorates;
            } else if (selectedGovernorates && typeof selectedGovernorates === 'string') {
                // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹
                try {
                    if (selectedGovernorates.startsWith('[') && selectedGovernorates.endsWith(']')) {
                        const parsed = JSON.parse(selectedGovernorates);
                        if (Array.isArray(parsed)) {
                            governorates = parsed;
                        }
                    }
                } catch (e) {
                    console.log('ðŸ” JSON parsing failed for governorates in cities, treating as regular string');
                }
                
                // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
                if (governorates.length === 0) {
                    if (selectedGovernorates.includes(',')) {
                        governorates = selectedGovernorates.split(',').map(item => item.trim()).filter(item => item && item !== 'null' && item !== '');
                    } else if (selectedGovernorates !== 'null' && selectedGovernorates !== '') {
                        governorates = [selectedGovernorates];
                    }
                }
            }

            // Get all cities for selected governorates
            let allCities = [];
            governorates.forEach(governorate => {
                if (typeof editCitiesService !== 'undefined' && editCitiesService.getCitiesForGovernorate) {
                    const cities = editCitiesService.getCitiesForGovernorate(governorate);
                    allCities = allCities.concat(cities);
                }
            });

            // Remove duplicates
            allCities = [...new Set(allCities)];

            // Parse current cities
            let currentCitiesArray = [];
            if (currentCities) {
                if (Array.isArray(currentCities)) {
                    currentCitiesArray = currentCities;
                } else if (typeof currentCities === 'string') {
                    // Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ­Ù„ÙŠÙ„ JSON string Ø£ÙˆÙ„Ø§Ù‹
                    try {
                        if (currentCities.startsWith('[') && currentCities.endsWith(']')) {
                            const parsed = JSON.parse(currentCities);
                            if (Array.isArray(parsed)) {
                                currentCitiesArray = parsed;
                                console.log('ðŸ” Successfully parsed JSON cities:', currentCitiesArray);
                            }
                        }
                    } catch (e) {
                        console.log('ðŸ” JSON parsing failed for cities, treating as regular string');
                    }
                    
                    // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† JSONØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©
                    if (currentCitiesArray.length === 0) {
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

            // Populate cities list
            citiesList.innerHTML = allCities.map(city => `
                <div class="city-item" style="padding: 8px 16px; cursor: pointer; transition: background-color 0.3s ease;">
                    <label class="city-checkbox" style="display: flex; align-items: center; gap: 8px; cursor: pointer; width: 100%;">
                        <input type="checkbox" value="${city}" class="city-input" style="width: 16px; height: 16px; accent-color: #3b82f6;" ${currentCitiesArray.includes(city) ? 'checked' : ''}>
                        <span class="city-name" style="color: #374151; font-size: 14px; flex: 1;">${city}</span>
                    </label>
                </div>
            `).join('');

            // Add event listeners to new checkboxes
            const cityCheckboxes = document.querySelectorAll('#edit-cities-list .city-input');
            cityCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (typeof editSelectedCities !== 'undefined') {
                        if (this.checked) {
                            editSelectedCities.add(this.value);
                        } else {
                            editSelectedCities.delete(this.value);
                        }
                        updateEditCitiesDisplay();
                    }
                });
                
                // Initialize selected cities
                if (checkbox.checked && typeof editSelectedCities !== 'undefined') {
                    editSelectedCities.add(checkbox.value);
                }
            });

            // Clear search
            citiesSearch.value = '';
            
            // Update display
            if (typeof updateEditCitiesDisplay === 'function') {
                updateEditCitiesDisplay();
            }
        }

        // Filter cities based on search term
        function filterEditCities(searchTerm) {
            const cityItems = document.querySelectorAll('#edit-cities-list .city-item');
            
            cityItems.forEach(item => {
                const cityName = item.querySelector('.city-name').textContent.toLowerCase();
                const matches = cityName.includes(searchTerm.toLowerCase());
                item.style.display = matches ? 'block' : 'none';
            });
        }

        // Update cities display
        function updateEditCitiesDisplay() {
            const selectedCount = document.getElementById('edit-cities-selected-count');
            const selectedCitiesContainer = document.getElementById('edit-selected-cities');
            const triggerText = document.querySelector('#edit-cities-trigger .trigger-text');

            // Update count
            if (editSelectedCities.size === 0) {
                selectedCount.style.display = 'none';
                triggerText.textContent = 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ù†Ø§Ø·Ù‚/Ø§Ù„Ù…Ø¯Ù† (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)';
            } else {
                selectedCount.style.display = 'inline-block';
                selectedCount.textContent = editSelectedCities.size;
                triggerText.textContent = `${editSelectedCities.size} Ù…Ù†Ø·Ù‚Ø© Ù…Ø®ØªØ§Ø±Ø©`;
            }

            // Update selected cities tags
            if (editSelectedCities.size === 0) {
                selectedCitiesContainer.innerHTML = '';
            } else {
                selectedCitiesContainer.innerHTML = Array.from(editSelectedCities).map(city => `
                    <div class="selected-city-tag" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 500;">
                        ${city}
                        <button class="remove-city" onclick="removeEditCity('${city}')" style="background: none; border: none; color: #1e40af; cursor: pointer; font-size: 14px; font-weight: bold; padding: 0; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background-color 0.3s ease;">Ã—</button>
                    </div>
                `).join('');
            }
        }

        // Remove specific city
        function removeEditCity(city) {
            editSelectedCities.delete(city);
            
            // Uncheck the corresponding checkbox
            const checkbox = document.querySelector(`#edit-cities-list .city-input[value="${city}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            updateEditCitiesDisplay();
        }

        // Get selected cities for form submission
        function getEditSelectedCities() {
            return Array.from(editSelectedCities);
        }

        // Initialize cities filter when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('ðŸ” DOM Content Loaded - Initializing cities filter');
            setTimeout(() => {
                initializeEditCitiesFilter();
                initializeEditProductColorFilter();
            }, 100);
        });
        
        // Initialize color filter for edit product modal
        function initializeEditProductColorFilter() {
            const colorButtons = document.querySelectorAll('.edit-product-color-option-simple');
            const selectedColorsDiv = document.getElementById('edit-product-selected-colors-simple');
            let selectedColors = [];

            function updateEditProductSelectedColorsDisplay() {
                if (!selectedColorsDiv) return;
                selectedColorsDiv.innerHTML = '';
                selectedColors.forEach(color => {
                    const tag = document.createElement('span');
                    tag.className = 'selected-tag';
                    tag.innerHTML = getEditProductColorLabel(color) +
                        `<button type="button" class="remove-tag" data-color="${color}">Ã—</button>`;
                    selectedColorsDiv.appendChild(tag);
                });
            }

            function getEditProductColorLabel(color) {
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
                    updateEditProductSelectedColorsDisplay();
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
                        updateEditProductSelectedColorsDisplay();
                    }
                });
            }
            
            // Ø¬Ø¹Ù„ Ø§Ù„Ø¯Ø§Ù„Ø© Ù…ØªØ§Ø­Ø© Ø¹Ø§Ù„Ù…ÙŠØ§Ù‹
            window.updateEditProductSelectedColorsDisplay = updateEditProductSelectedColorsDisplay;
        }

        // Also initialize when window loads
        window.addEventListener('load', function() {
            console.log('ðŸ” Window Loaded - Initializing cities filter');
            setTimeout(() => {
                initializeEditCitiesFilter();
            }, 200);
        });
    
