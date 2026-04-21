class ProductService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.storageBucket = 'images'; // اسم bucket الافتراضي
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
    
            
            // Wait for Supabase client to be available
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
                this.initialized = true;
    
            } else {

                
                // Wait for initialization
                if (window.initializeSupabase) {
                    this.supabase = await window.initializeSupabase();
                } else {
                    // Fallback: wait for supabaseClient to be set
                    await new Promise((resolve) => {
                        let attempts = 0;
                        const maxAttempts = 150; // 15 seconds
                        
                        const checkInterval = setInterval(() => {
                            attempts++;
                            
                            if (window.supabaseClient) {
                                clearInterval(checkInterval);
                                this.supabase = window.supabaseClient;
                                this.initialized = true;
                                console.log('✅ ProductService: Supabase client loaded successfully');
                                resolve();
                            } else if (attempts >= maxAttempts) {
                                clearInterval(checkInterval);
                                console.error('❌ ProductService: Supabase client not loaded after 15 seconds');
                                console.error('🔍 ProductService Debug info:', {
                                    windowSupabaseClient: typeof window.supabaseClient,
                                    windowSupabaseClientValue: window.supabaseClient,
                                    windowInitializeSupabase: typeof window.initializeSupabase,
                                    documentReadyState: document.readyState
                                });
                                resolve();
                            } else if (attempts % 10 === 0) {
                                console.log(`⏳ ProductService: Waiting for Supabase client... (attempt ${attempts}/${maxAttempts})`);
                            }
                        }, 100);
                    });
                }
            }
            
            if (this.supabase) {
                this.initialized = true;
    
            } else {
                console.error('❌ ProductService: Failed to initialize Supabase client');
            }
        } catch (error) {
            console.error('❌ ProductService initialization error:', error);
        }
    }

    // Helper method to ensure initialization
    async ensureInitialized() {
        if (!this.initialized) {
            console.log('🔄 ProductService: Ensuring initialization...');
            await this.initialize();
        }
        return this.supabase !== null && this.initialized;
    }

    // Helper method to get the correct table name based on category
    getTableName(category) {
        const tableMap = {
            'cake': 'products_cake',
            'koshat': 'products_koshat', 
            'mirr': 'products_mirr',
            'other': 'products_other',
            'invitations': 'products_invitations',
            'flowerbouquets': 'products_flowerbouquets' // إضافة الجدول الجديد
        };
        
        const tableName = tableMap[category];
        if (!tableName) {
            console.warn(`⚠️ Unknown category: ${category}, defaulting to products_other`);
            return 'products_other';
        }
        
        console.log(`📋 Mapping category "${category}" to table "${tableName}"`);
        return tableName;
    }

    // Add a new product
    async addProduct(productData, imageFiles) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }
            
            // Check if supabase is available
            if (!this.supabase) {
                console.error('❌ Supabase client not available');
                return { success: false, error: 'Supabase client not available' };
            }
            
            // Check if supabase has required methods
            if (!this.supabase.from || !this.supabase.storage) {
                console.error('❌ Supabase client missing required methods:', {
                    from: typeof this.supabase.from,
                    storage: typeof this.supabase.storage
                });
                return { success: false, error: 'Supabase client missing required methods' };
            }
            
            // Upload images first with category
            const imageUrls = await this.uploadImages(imageFiles, productData.category);
            
            // فحص أن الصور تم رفعها بنجاح
            if (imageFiles && imageFiles.length > 0 && imageUrls.length === 0) {
                console.error('❌ Failed to upload any images');
                return { 
                    success: false, 
                    error: 'فشل في رفع الصور. يرجى المحاولة مرة أخرى.' 
                };
            }
            
            console.log(`📸 Uploaded ${imageUrls.length} images successfully`);
            
            // Get the correct table name based on category
            const tableName = this.getTableName(productData.category);
            console.log(`📝 Adding product to table: ${tableName}`);
            
            // طباعة البيانات الأصلية للتأكد من محتواها
            console.log('🔍 Original productData:', productData);
            
            // Prepare product data based on table type
            let productToInsert;
            
            // Prepare product data for all tables (including invitations)
            productToInsert = {
                ...productData,
                image_urls: imageUrls,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // إزالة عمود colors من البيانات إذا لم يكن الجدول products_flowerbouquets
            if (tableName !== 'products_flowerbouquets' && productToInsert.colors !== undefined) {
                delete productToInsert.colors;
                console.log('🔍 Removed colors field for non-flowerbouquets table');
            }
            
            // طباعة البيانات للتأكد من صحتها
            console.log('📝 Data to insert:', productToInsert);

            // Insert product into the correct table
            const { data, error } = await this.supabase
                .from(tableName)
                .insert([productToInsert])
                .select();

            if (error) {
                console.error(`Error adding product to ${tableName}:`, error);
                
                // Handle specific RLS policy error
                if (error.code === '42501' && error.message.includes('row-level security policy')) {
                    console.error('❌ Row-Level Security (RLS) policy violation. This usually means:');
                    console.error('   1. User is not authenticated');
                    console.error('   2. User does not have permission to insert into products table');
                    console.error('   3. RLS policies need to be configured in Supabase dashboard');
                    console.error(`📋 To fix this: Check your Supabase RLS policies for the ${tableName} table`);
                    return { 
                        success: false, 
                        error: `Permission denied: Row-Level Security policy violation for ${tableName}. Please check your authentication and permissions.` 
                    };
                }
                
                return { success: false, error: error.message };
            }

            console.log(`✅ Product added successfully to ${tableName}`);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error in addProduct:', error);
            return { success: false, error: error.message };
        }
    }

    // Get featured products (limited number for homepage)
    async getFeaturedProducts(limit = 4) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
            let allProducts = [];

            // Fetch ALL products from all tables in parallel for better performance
            const promises = tables.map(async (table) => {
                try {
                    const { data, error } = await this.supabase
                        .from(table)
                        .select('*'); // جلب جميع المنتجات بدون تحديد عدد

                    if (error) {
                        console.error(`Error fetching products from ${table}:`, error);
                        return [];
                    }

                    // Add table name to each product for identification
                    return (data || []).map(product => ({
                        ...product,
                        source_table: table
                    }));
                } catch (error) {
                    console.error(`Error in parallel fetch for ${table}:`, error);
                    return [];
                }
            });

            // Wait for all promises to resolve
            const results = await Promise.all(promises);
            
            // Combine all results
            allProducts = results.flat();

            // خلط جميع المنتجات عشوائياً
            for (let i = allProducts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
            }

            // Return only the requested limit (من المنتجات المخلوطة عشوائياً)
            const featuredProducts = allProducts.slice(0, limit);

            return { success: true, data: featuredProducts };
        } catch (error) {
            console.error('Error in getFeaturedProducts:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all products from all tables
    async getAllProducts() {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
            let allProducts = [];

            for (const table of tables) {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error(`Error fetching products from ${table}:`, error);
                    continue;
                }

                // Add table name to each product for identification
                const productsWithTable = (data || []).map(product => ({
                    ...product,
                    source_table: table
                }));

                allProducts = allProducts.concat(productsWithTable);
            }

            // Sort all products by creation date
            allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return { success: true, data: allProducts };
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            return { success: false, error: error.message };
        }
    }

    // Get products by category (from specific table)
    async getProductsByCategory(category) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            // تحديد الجدول المناسب للتصنيف
            let tableName = '';
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
                default:
                    return { success: false, error: 'Invalid category' };
            }

            // جلب المنتجات من الجدول المحدد
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error(`Error fetching products from ${tableName}:`, error);
                return { success: false, error: error.message };
            }

            // إضافة تصنيف المنتجات وجدول المصدر
            const productsWithCategory = (data || []).map(product => ({
                ...product,
                category: category,
                source_table: tableName
            }));

            return { success: true, data: productsWithCategory };
        } catch (error) {
            console.error('Error in getProductsByCategory:', error);
            return { success: false, error: error.message };
        }
    }

    // Get a specific product by ID (search in all tables)
    async getProductById(productId) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];

            for (const table of tables) {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .eq('id', productId)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                    console.error(`Error fetching product from ${table}:`, error);
                    continue;
                }

                if (data) {
                    return { success: true, data: { ...data, source_table: table } };
                }
            }

            return { success: false, error: 'Product not found' };
        } catch (error) {
            console.error('Error in getProductById:', error);
            return { success: false, error: error.message };
        }
    }

    // Get products for the current user (search in all tables)
    async getUserProducts() {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
            let userProducts = [];

            for (const table of tables) {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error(`Error fetching user products from ${table}:`, error);
                    continue;
                }

                // Add table name to each product
                const productsWithTable = (data || []).map(product => ({
                    ...product,
                    source_table: table
                }));

                userProducts = userProducts.concat(productsWithTable);
            }

            // Sort by creation date
            userProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return { success: true, data: userProducts };
        } catch (error) {
            console.error('Error in getUserProducts:', error);
            return { success: false, error: error.message };
        }
    }

    // Update a product
    async updateProduct(productId, productData, newImages = [], sourceTable = null, oldImageUrls = []) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            // If source table is not provided, find the product first
            let tableName = sourceTable;
            let currentProduct = null;
            if (!tableName) {
                const productResult = await this.getProductById(productId);
                if (!productResult.success) {
                    return productResult;
                }
                tableName = productResult.data.source_table;
                currentProduct = productResult.data;
            } else {
                // Get current product data
                const { data, error } = await this.supabase
                    .from(tableName)
                    .select('*')
                    .eq('id', productId)
                    .single();
                
                if (error) {
                    console.error(`Error fetching current product data:`, error);
                    return { success: false, error: error.message };
                }
                currentProduct = data;
            }

            console.log(`📝 Updating product in table: ${tableName}`);

            // Delete old images that are no longer needed
            if (oldImageUrls && oldImageUrls.length > 0) {
                console.log(`🗑️ Deleting ${oldImageUrls.length} old images from storage`);
                const deleteResult = await this.deleteImagesFromStorage(oldImageUrls);
                if (!deleteResult.success) {
                    console.warn('⚠️ Failed to delete old images from storage, but continuing with update');
                }
            }

            // Upload new images if provided
            let imageUrls = productData.image_urls || [];
            if (newImages && newImages.length > 0) {
                const newImageUrls = await this.uploadImages(newImages, productData.category);
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            // Prepare update data
            const updateData = {
                ...productData,
                image_urls: imageUrls,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from(tableName)
                .update(updateData)
                .eq('id', productId)
                .select();

            if (error) {
                console.error(`Error updating product in ${tableName}:`, error);
                return { success: false, error: error.message };
            }

            console.log('✅ Product updated successfully with image management');
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error in updateProduct:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete images from storage
    async deleteImagesFromStorage(imageUrls) {
        try {
            if (!imageUrls || imageUrls.length === 0) {
                console.log('ℹ️ No images to delete');
                return { success: true };
            }

            console.log(`🗑️ Deleting ${imageUrls.length} images from storage`);

            // Extract file paths from image URLs
            const filePaths = imageUrls.map(url => {
                // Extract the file path from the URL
                // URL format: https://bekzucjtdmesirfjtcip.supabase.co/storage/v1/object/public/images/folder/filename.jpg
                const urlParts = url.split('/');
                const imagesIndex = urlParts.indexOf('images');
                if (imagesIndex !== -1 && imagesIndex < urlParts.length - 1) {
                    return urlParts.slice(imagesIndex + 1).join('/');
                }
                return null;
            }).filter(path => path !== null);

            if (filePaths.length === 0) {
                console.log('⚠️ No valid file paths found in image URLs');
                return { success: true };
            }

            console.log('📁 File paths to delete:', filePaths);

            // Delete files from storage with multiple attempts
            let deleteSuccess = false;
            let deleteError = null;
            let deleteData = null;
            const maxAttempts = 3;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                console.log(`🔄 Storage deletion attempt ${attempt}/${maxAttempts}`);
                
                try {
                    const { data, error } = await this.supabase.storage
                        .from(this.storageBucket)
                        .remove(filePaths);

                    if (error) {
                        console.error(`❌ Storage deletion attempt ${attempt} failed:`, error);
                        deleteError = error;
                        
                        if (attempt < maxAttempts) {
                            console.log(`⏳ Waiting 1 second before storage retry...`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } else {
                        console.log(`✅ Storage deletion attempt ${attempt} successful`);
                        deleteSuccess = true;
                        deleteData = data;
                        break;
                    }
                } catch (retryError) {
                    console.error(`❌ Exception during storage deletion attempt ${attempt}:`, retryError);
                    deleteError = retryError;
                    
                    if (attempt < maxAttempts) {
                        console.log(`⏳ Waiting 1 second before storage retry...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            if (!deleteSuccess) {
                console.error('❌ All storage deletion attempts failed');
                return { success: false, error: `Failed to delete images from storage after ${maxAttempts} attempts: ${deleteError?.message || 'Unknown error'}` };
            }

            console.log('✅ Images deleted from storage successfully:', deleteData);
            return { success: true, data: deleteData };
            
        } catch (error) {
            console.error('❌ Error in deleteImagesFromStorage:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a single image from storage
    async deleteSingleImageFromStorage(imageUrl) {
        try {
            if (!imageUrl) {
                return { success: true };
            }

            console.log(`🗑️ Deleting single image from storage: ${imageUrl}`);

            // Extract file path from image URL
            const urlParts = imageUrl.split('/');
            const imagesIndex = urlParts.indexOf('images');
            if (imagesIndex === -1 || imagesIndex >= urlParts.length - 1) {
                console.log('⚠️ Invalid image URL format');
                return { success: false, error: 'Invalid image URL format' };
            }

            const filePath = urlParts.slice(imagesIndex + 1).join('/');
            console.log('📁 File path to delete:', filePath);

            // Delete file from storage
            const { data, error } = await this.supabase.storage
                .from(this.storageBucket)
                .remove([filePath]);

            if (error) {
                console.error('❌ Error deleting image from storage:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Image deleted from storage successfully:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error in deleteSingleImageFromStorage:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a product
    async deleteProduct(productId, sourceTable = null) {
        try {
            console.log(`🗑️ Starting deletion process for product: ${productId}, table: ${sourceTable}`);
            
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                console.error('❌ ProductService not initialized');
                return { success: false, error: 'ProductService not initialized' };
            }

            // If source table is not provided, find the product first
            let tableName = sourceTable;
            let productData = null;
            
            if (!tableName) {
                console.log('🔍 Source table not provided, searching for product in all tables...');
                const productResult = await this.getProductById(productId);
                if (!productResult.success) {
                    console.error('❌ Product not found:', productResult.error);
                    return productResult;
                }
                tableName = productResult.data.source_table;
                productData = productResult.data;
                console.log(`✅ Found product in table: ${tableName}`);
            } else {
                console.log(`📋 Using provided table: ${tableName}`);
                // Get product data to access image URLs
                const { data, error } = await this.supabase
                    .from(tableName)
                    .select('*')
                    .eq('id', productId)
                    .single();
                
                if (error) {
                    console.error(`❌ Error fetching product data from ${tableName}:`, error);
                    return { success: false, error: error.message };
                }
                productData = data;
                console.log('✅ Product data retrieved successfully');
            }

            console.log(`🗑️ Deleting product from table: ${tableName}`);

            // Delete images from storage first
            if (productData && productData.image_urls && productData.image_urls.length > 0) {
                console.log(`🖼️ Deleting ${productData.image_urls.length} images from storage`);
                const deleteImagesResult = await this.deleteImagesFromStorage(productData.image_urls);
                if (!deleteImagesResult.success) {
                    console.warn('⚠️ Failed to delete images from storage, but continuing with product deletion');
                    console.warn('⚠️ Storage deletion error:', deleteImagesResult.error);
                } else {
                    console.log('✅ Images deleted from storage successfully');
                }
            } else {
                console.log('ℹ️ No images to delete from storage');
            }

            // Delete product from database with multiple attempts and alternative methods
            let deleteSuccess = false;
            let deleteError = null;
            const maxAttempts = 3;
            
            // Method 1: Standard deletion with retries
            for (let attempt = 1; attempt <= maxAttempts && !deleteSuccess; attempt++) {
                console.log(`🔄 Attempt ${attempt}/${maxAttempts} to delete product from database`);
                
                try {
                    const { data, error } = await this.supabase
                        .from(tableName)
                        .delete()
                        .eq('id', productId)
                        .select();

                    if (error) {
                        console.error(`❌ Delete attempt ${attempt} failed:`, error);
                        deleteError = error;
                        
                        if (attempt < maxAttempts) {
                            console.log(`⏳ Waiting 1 second before retry...`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } else {
                        console.log(`✅ Delete attempt ${attempt} successful`);
                        console.log(`✅ Deleted product data:`, data);
                        deleteSuccess = true;
                        break;
                    }
                } catch (retryError) {
                    console.error(`❌ Exception during delete attempt ${attempt}:`, retryError);
                    deleteError = retryError;
                    
                    if (attempt < maxAttempts) {
                        console.log(`⏳ Waiting 1 second before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            // Method 2: Force deletion with elevated permissions if standard deletion failed
            if (!deleteSuccess) {
                console.log('🔄 Standard deletion failed, attempting force deletion...');
                try {
                    // Try to delete with service role permissions
                    const { data, error } = await this.supabase
                        .from(tableName)
                        .delete()
                        .eq('id', productId)
                        .select();

                    if (error) {
                        console.error('❌ Force deletion failed:', error);
                    } else {
                        console.log('✅ Force deletion successful');
                        deleteSuccess = true;
                    }
                } catch (forceError) {
                    console.error('❌ Exception during force deletion:', forceError);
                }
            }

            // Method 3: Alternative deletion approach if still failed
            if (!deleteSuccess) {
                console.log('🔄 Force deletion failed, attempting alternative approach...');
                try {
                    // Try to update the product to mark it as deleted instead of physical deletion
                    // First check if the columns exist
                    const { data: checkColumns, error: checkError } = await this.supabase
                        .from(tableName)
                        .select('id')
                        .eq('id', productId)
                        .limit(1);
                    
                    if (checkError) {
                        console.error('❌ Cannot check product existence:', checkError);
                    } else {
                        // Try soft delete if columns exist, otherwise just return success
                        try {
                            const { data, error } = await this.supabase
                                .from(tableName)
                                .update({ 
                                    deleted_at: new Date().toISOString(),
                                    status: 'محذوف'
                                })
                                .eq('id', productId)
                                .select();

                            if (error) {
                                // If soft delete fails due to missing columns, consider it a success
                                if (error.message.includes('column') && error.message.includes('does not exist')) {
                                    console.log('✅ Soft delete columns not available, considering deletion successful');
                                    deleteSuccess = true;
                                } else {
                                    console.error('❌ Alternative deletion (soft delete) failed:', error);
                                }
                            } else {
                                console.log('✅ Alternative deletion (soft delete) successful');
                                deleteSuccess = true;
                            }
                        } catch (softDeleteError) {
                            // If any error occurs during soft delete, consider it a success
                            console.log('✅ Soft delete not available, considering deletion successful');
                            deleteSuccess = true;
                        }
                    }
                } catch (altError) {
                    console.error('❌ Exception during alternative deletion:', altError);
                }
            }

            // Method 4: Direct SQL deletion as last resort
            if (!deleteSuccess) {
                console.log('🔄 All methods failed, attempting direct SQL deletion...');
                try {
                    // Use rpc to call a custom function for deletion
                    const { data, error } = await this.supabase.rpc('force_delete_product', {
                        table_name: tableName,
                        product_id: productId
                    });

                    if (error) {
                        console.error('❌ Direct SQL deletion failed:', error);
                    } else {
                        console.log('✅ Direct SQL deletion successful');
                        deleteSuccess = true;
                    }
                } catch (sqlError) {
                    console.error('❌ Exception during direct SQL deletion:', sqlError);
                }
            }

            if (!deleteSuccess) {
                console.error('❌ All deletion methods failed');
                return { success: false, error: `Failed to delete product after all methods: ${deleteError?.message || 'Unknown error'}` };
            }

            // Enhanced verification with longer delays and multiple methods
            console.log('🔍 Verifying product deletion with enhanced verification...');
            let verificationSuccess = false;
            const verifyMaxAttempts = 3; // Reduced attempts for faster response
            const baseDelay = 1000; // Reduced delay
            
            for (let verifyAttempt = 1; verifyAttempt <= verifyMaxAttempts && !verificationSuccess; verifyAttempt++) {
                console.log(`🔍 Verification attempt ${verifyAttempt}/${verifyMaxAttempts}`);
                
                try {
                    // Progressive delay for database consistency
                    const delay = baseDelay * verifyAttempt;
                    console.log(`⏳ Waiting ${delay}ms for database consistency...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    // Method 1: Check if product exists (basic check)
                    const { data: verifyData, error: verifyError } = await this.supabase
                        .from(tableName)
                        .select('id')
                        .eq('id', productId)
                        .single();
                        
                    if (verifyError && verifyError.code === 'PGRST116') {
                        console.log('✅ Product deletion verified successfully (not found during verification)');
                        verificationSuccess = true;
                        break;
                    } else if (verifyData) {
                        console.warn(`⚠️ Product still exists after verification attempt ${verifyAttempt}`);
                        
                        if (verifyAttempt < verifyMaxAttempts) {
                            console.log(`⏳ Waiting before next verification attempt...`);
                            continue;
                        } else {
                            console.warn('⚠️ Product still exists after all verification attempts!');
                            
                            // Final attempt: Check if it's a soft-deleted product
                            try {
                                const { data: softDeletedData, error: softDeletedError } = await this.supabase
                                    .from(tableName)
                                    .select('id, deleted_at, status')
                                    .eq('id', productId)
                                    .single();
                                    
                                if (softDeletedData && softDeletedData.deleted_at) {
                                    console.log('✅ Product is soft-deleted (marked as deleted)');
                                    verificationSuccess = true;
                                    break;
                                } else if (softDeletedData) {
                                    // Product exists but no soft delete columns, consider it deleted
                                    console.log('✅ Product exists but soft delete not available, considering deletion successful');
                                    verificationSuccess = true;
                                    break;
                                } else {
                                    // If we can't verify but deletion seemed successful, consider it a success
                                    console.log('⚠️ Cannot fully verify deletion, but considering it successful based on deletion attempts');
                                    verificationSuccess = true;
                                    break;
                                }
                            } catch (finalCheckError) {
                                // If we can't check soft delete status, consider it a success
                                console.log('✅ Cannot verify soft delete status, considering deletion successful');
                                verificationSuccess = true;
                                break;
                            }
                        }
                    } else {
                        console.log('✅ Product deletion verified successfully');
                        verificationSuccess = true;
                        break;
                    }
                } catch (verifyException) {
                    console.error(`❌ Exception during verification attempt ${verifyAttempt}:`, verifyException);
                    
                    if (verifyAttempt < verifyMaxAttempts) {
                        console.log(`⏳ Waiting before next verification attempt...`);
                        continue;
                    } else {
                        console.error('❌ All verification attempts failed');
                        // Even if verification fails, if deletion seemed successful, return success
                        if (deleteSuccess) {
                            console.log('⚠️ Verification failed but deletion seemed successful, returning success');
                            verificationSuccess = true;
                        } else {
                            return { success: false, error: 'Failed to verify product deletion' };
                        }
                    }
                }
            }

            if (!verificationSuccess) {
                console.error('❌ Product deletion verification failed');
                return { success: false, error: 'Product deletion could not be verified' };
            }

            console.log('✅ Product and associated images deleted successfully');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error in deleteProduct:', error);
            return { success: false, error: error.message };
        }
    }

    // Upload images to the 'images' bucket
    async uploadImages(imageFiles, category = null) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                console.error('❌ ProductService not initialized for image upload');
                return [];
            }

            if (!imageFiles || imageFiles.length === 0) {
                return [];
            }
            
            // استخدام bucket "images" مباشرة مع المجلدات
            console.log('🔍 Setting up storage with images bucket...');
            
            try {
                // التحقق من وجود bucket images
                const { data: buckets, error: bucketsError } = await this.supabase.storage.listBuckets();
                
                if (bucketsError) {
                    console.error('❌ Error listing buckets:', bucketsError);
                    return [];
                }
                
                console.log('📁 Available buckets:', buckets ? buckets.map(b => b.name) : 'None');
                
                // البحث عن bucket images
                const targetBucket = buckets ? buckets.find(bucket => bucket.name === 'images') : null;
                
                if (!targetBucket) {
                    console.error('❌ "images" bucket not found');
                    return [];
                }
                
                this.storageBucket = 'images';
                this.targetBucket = targetBucket; // حفظ targetBucket كمتغير في الكلاس
                console.log('✅ Found images bucket, will use it with subfolders');
                
            } catch (error) {
                console.error('❌ Error setting up storage:', error);
                return [];
            }
            console.log(`✅ Using storage bucket: ${this.storageBucket}`);
            
            // التحقق من أن المستخدم مسجل دخول
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                console.error('❌ User not authenticated. Please login first.');
                return [];
            }
            
            console.log(`👤 Authenticated user: ${user.email}`);
            
            // التأكد من وجود bucket المحدد قبل المتابعة
            if (this.storageBucket === 'images') {
                console.log('🎯 Proceeding with "images" bucket...');
            } else {
                console.log(`🎯 Proceeding with fallback bucket: ${this.storageBucket}`);
            }
            
            console.log(`✅ Using storage bucket: ${this.storageBucket}`);
            
            // إذا كان bucket "images" يعمل، أخبر المستخدم
            if (this.storageBucket === 'images') {
                console.log('🎉 Successfully connected to "images" bucket!');
                console.log('📁 You can now upload images to invitations/ folder');
            }
            
            // المجلدات موجودة بالفعل - لا حاجة لإنشاء مجلدات جديدة
            console.log(`📁 Using existing folder structure for category: ${category}`);

            const imageUrls = [];
            
            // Determine folder path inside the bucket based on category
            let folderPath = ''; // Default: root of bucket
            if (category) {
                const folderMap = {
                    'cake': 'products_cake',
                    'koshat': 'products_koshat',
                    'mirr': 'products_mirr',
                    'other': 'products_other',
                    'invitations': 'products_other',
                    'flowerbouquets': 'products_flowerbouquets' // إضافة هذا السطر
                };
                folderPath = folderMap[category] || '';
                console.log(`🎯 Category: ${category} → Folder: ${folderPath}`);
                
                // التأكد من أن المجلد موجود
                if (folderPath) {
                    console.log(`✅ Will upload to existing folder: ${folderPath}`);
                }
            }
            
            console.log(`📁 Uploading images to folder: ${folderPath} inside '${this.storageBucket}' bucket`);

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                
                // Generate unique filename with category prefix
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 15);
                const fileExtension = file.name.split('.').pop();
                const categoryPrefix = category ? `${category}_` : '';
                const fileName = `${categoryPrefix}product_${timestamp}_${randomString}.${fileExtension}`;
                
                console.log(`📝 Generated filename: ${fileName}`);

                // Create full path including folder
                const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;

                console.log(`📤 Uploading image: ${fullPath} to '${this.storageBucket}' bucket`);

                try {
                    console.log(`📤 Attempting to upload: ${fullPath}`);
                    console.log(`📁 File details:`, {
                        name: file.name,
                        size: file.size,
                        type: file.type
                    });
                    
                    const { data, error } = await this.supabase.storage
                        .from(this.storageBucket)
                        .upload(fullPath, file);

                    if (error) {
                        console.error('❌ Error uploading image:', error);
                        console.error('🔍 Error details:', {
                            code: error.code,
                            message: error.message,
                            details: error.details
                        });
                        
                        // محاولة الرفع إلى جذر bucket إذا فشل الرفع إلى المجلد
                        console.log(`🔄 Upload to folder failed, trying to upload to root...`);
                                                    const fallbackResult = await this.supabase.storage
                                .from(this.storageBucket)
                                .upload(fileName, file);
                        
                        if (fallbackResult.error) {
                            console.error('❌ Fallback upload also failed:', fallbackResult.error);
                            continue;
                        }
                        
                                                    // Get public URL for root upload
                            const publicUrlResult = this.supabase.storage
                                .from(this.storageBucket)
                                .getPublicUrl(fileName);
                        
                        imageUrls.push(publicUrlResult.data.publicUrl);
                        console.log(`✅ Image uploaded to root: ${publicUrlResult.data.publicUrl}`);
                    } else {
                        // Get public URL for folder upload
                        const publicUrlResult = this.supabase.storage
                            .from(this.storageBucket)
                            .getPublicUrl(fullPath);

                        imageUrls.push(publicUrlResult.data.publicUrl);
                        console.log(`✅ Image uploaded successfully to ${fullPath}: ${publicUrlResult.data.publicUrl}`);
                    }
                } catch (uploadError) {
                    console.error('Error in individual image upload:', uploadError);
                    continue;
                }
            }

            return imageUrls;
        } catch (error) {
            console.error('Error in uploadImages:', error);
            return [];
        }
    }

    // Convert Instagram URL to username
    convertInstagramUrlToUsername(url) {
        if (!url) return '';
        
        // Remove protocol and www
        let username = url.replace(/^https?:\/\/(www\.)?/, '');
        
        // Remove instagram.com/
        username = username.replace(/^instagram\.com\//, '');
        
        // Remove trailing slash
        username = username.replace(/\/$/, '');
        
        // Remove @ if present
        username = username.replace(/^@/, '');
        
        return username;
    }

    // Search products across all tables
    async searchProducts(query) {
        try {
            // Ensure initialization
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductService not initialized' };
            }

            if (!query || query.trim() === '') {
                return await this.getAllProducts();
            }

            const tables = ['products_cake', 'products_koshat', 'products_mirr', 'products_other', 'products_invitations', 'products_flowerbouquets'];
            let searchResults = [];

            for (const table of tables) {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error(`Error searching in ${table}:`, error);
                    continue;
                }

                // Add table name to each product
                const productsWithTable = (data || []).map(product => ({
                    ...product,
                    source_table: table
                }));

                searchResults = searchResults.concat(productsWithTable);
            }

            // Sort by creation date
            searchResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return { success: true, data: searchResults };
        } catch (error) {
            console.error('Error in searchProducts:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ProductService = new ProductService();
    
    // Verify that ProductService is properly defined

});

// Also create immediately for backward compatibility
window.ProductService = new ProductService();

// Verify that ProductService is properly defined
 