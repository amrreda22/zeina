/**
 * خدمة إدارة طلبات المنتجات
 * 
 * المنطق الجديد:
 * ✅ عند الموافقة: نقل البيانات للجدول الرئيسي + حذف الطلب نهائياً
 * ❌ عند الرفض: حذف الطلب والصورة نهائياً من النظام
 * 
 * جدول Project Request يصبح محطة مؤقتة فقط
 */
class ProductRequestsService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            console.log('🔄 ProductRequestsService: Starting initialization...');
            
            // Wait for Supabase client to be available
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
                this.initialized = true;
                console.log('✅ ProductRequestsService: Supabase client already available');
            } else {
                console.log('⏳ ProductRequestsService: Waiting for Supabase client...');
                
                // Wait for initialization
                await new Promise((resolve) => {
                    let attempts = 0;
                    const maxAttempts = 150; // 15 seconds
                    
                    const checkInterval = setInterval(() => {
                        attempts++;
                        
                        if (window.supabaseClient) {
                            clearInterval(checkInterval);
                            this.supabase = window.supabaseClient;
                            this.initialized = true;
                            console.log('✅ ProductRequestsService: Supabase client loaded successfully');
                            resolve();
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            console.error('❌ ProductRequestsService: Supabase client not loaded after 15 seconds');
                            resolve();
                        } else if (attempts % 10 === 0) {
                            console.log(`⏳ ProductRequestsService: Waiting for Supabase client... (attempt ${attempts}/${maxAttempts})`);
                        }
                    }, 100);
                });
            }
            
            if (this.supabase) {
                this.initialized = true;
                console.log('✅ ProductRequestsService initialized successfully with Supabase client');
            } else {
                console.error('❌ ProductRequestsService: Failed to initialize Supabase client');
            }
        } catch (error) {
            console.error('❌ ProductRequestsService initialization error:', error);
        }
    }

    // Helper method to ensure initialization
    async ensureInitialized() {
        if (!this.initialized) {
            console.log('🔄 ProductRequestsService: Ensuring initialization...');
            await this.initialize();
        }
        return this.supabase !== null && this.initialized;
    }

    // Validate that images are in the correct Product_requests/ folder
    validateRequestImages(imageUrls) {
        if (!imageUrls || !Array.isArray(imageUrls)) {
            console.warn('⚠️ No images provided for validation');
            return [];
        }

        const validatedImages = imageUrls.map((image, index) => {
            console.log(`🔍 Validating image ${index + 1}:`, {
                path: image.path,
                url: image.url,
                original_name: image.original_name
            });

            // Ensure path is in Product_requests/ folder
            if (!image.path || !image.path.includes('Product_requests/')) {
                console.warn(`⚠️ Image ${index + 1} not in Product_requests/ folder:`, image.path);
            }

            return {
                url: image.url,
                path: image.path,
                original_name: image.original_name || `image_${index + 1}.jpg`
            };
        });

        console.log(`✅ Validated ${validatedImages.length} images for product request`);
        return validatedImages;
    }

    // Submit a new product request from visitors
    async submitProductRequest(requestData, imageUrls) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductRequestsService not initialized' };
            }

            console.log('📝 Submitting product request:', requestData);
            console.log('🖼️ Images already in Product_requests/ folder:', imageUrls);

            // Validate that images are in the correct temporary location
            const validatedImageUrls = this.validateRequestImages(imageUrls);

            // Debug: validate image structure before saving
            this.validateImageDataStructure(validatedImageUrls, 'before saving to product_requests');

            // Prepare request data - images stay in Product_requests/ until approved
            const requestToInsert = {
                ...requestData,
                image_urls: validatedImageUrls.map(img => img.url), // حفظ URLs فقط في جدول product_requests
                status: 'pending', // pending, approved, rejected
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('💾 Saving product request to database:');
            console.log('   📁 Images location: Product_requests/ folder');
            console.log('   📊 Images count:', validatedImageUrls.length);
            console.log('   🗂️ Target table: product_requests');

            // Insert request into product_requests table
            const { data, error } = await this.supabase
                .from('product_requests')
                .insert([requestToInsert])
                .select();

            if (error) {
                console.error('Error submitting product request:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Product request submitted successfully');
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error in submitProductRequest:', error);
            return { success: false, error: error.message };
        }
    }

    // Upload images for product requests (temporary storage)
    async uploadRequestImages(imageFiles) {
        try {
            if (!imageFiles || imageFiles.length === 0) {
                return [];
            }

            const imageUrls = [];
            const timestamp = Date.now();

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const fileName = `product_request_${timestamp}_${i}_${file.name}`;
                const filePath = `Product_requests/${fileName}`;

                console.log(`📤 Uploading image ${i + 1}/${imageFiles.length}: ${fileName}`);

                const { data, error } = await this.supabase.storage
                    .from('images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error(`Error uploading image ${fileName}:`, error);
                    continue;
                }

                // Get public URL
                const { data: urlData } = this.supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                if (urlData?.publicUrl) {
                    imageUrls.push({
                        url: urlData.publicUrl,
                        path: filePath,
                        original_name: file.name
                    });
                    console.log(`✅ Image uploaded successfully: ${fileName}`);
                }
            }

            return imageUrls;
        } catch (error) {
            console.error('Error uploading request images:', error);
            return [];
        }
    }

    // Get all product requests (for admin)
    async getAllProductRequests() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductRequestsService not initialized' };
            }

            const { data, error } = await this.supabase
                .from('product_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching product requests:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error in getAllProductRequests:', error);
            return { success: false, error: error.message };
        }
    }

    // Get product requests by status
    async getProductRequestsByStatus(status) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductRequestsService not initialized' };
            }

            const { data, error } = await this.supabase
                .from('product_requests')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) {
                console.error(`Error fetching ${status} product requests:`, error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error in getProductRequestsByStatus:', error);
            return { success: false, error: error.message };
        }
    }

    // Approve a product request
    // ✅ الموافقة على الطلب: نقل البيانات للجدول الرئيسي ثم حذف الطلب نهائياً
    async approveProductRequest(requestId) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductRequestsService not initialized' };
            }

            console.log(`✅ Approving product request: ${requestId}`);

            // Get the request details
            const { data: request, error: fetchError } = await this.supabase
                .from('product_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (fetchError || !request) {
                console.error('Error fetching request for approval:', fetchError);
                return { success: false, error: 'Request not found' };
            }

            // Convert URLs from database to objects expected by moveImagesToFinalLocation
            const imageObjects = Array.isArray(request.image_urls)
                ? request.image_urls.map((url, index) => ({
                    url: url,
                    path: url.replace('https://bekzucjtdmesirfjtcip.supabase.co/storage/v1/object/public/images/', ''),
                    original_name: `image_${index + 1}.jpg`
                }))
                : [];

            console.log('🔄 Converted URLs to objects:', imageObjects);
            console.log('📊 Original image_urls from DB:', request.image_urls);

            // Move images to final location
            const finalImageUrls = await this.moveImagesToFinalLocation(imageObjects, request.category);

            // Validate the result
            this.validateImageDataStructure(finalImageUrls, 'after moving to final location');

            // Extract URLs safely
            const imageUrlsOnly = finalImageUrls && Array.isArray(finalImageUrls)
                ? finalImageUrls.map(img => img?.url).filter(url => url)
                : [];

            // معالجة التصنيفات الفرعية مع تنظيف البيانات من علامات الاقتباس
            let processedSubcategories = [];
            if (request.subcategory) {
                let cleanSubcategory = request.subcategory;

                // تنظيف البيانات من علامات الاقتباس الإضافية
                if (typeof cleanSubcategory === 'string') {
                    if (cleanSubcategory.startsWith('"') && cleanSubcategory.endsWith('"')) {
                        cleanSubcategory = cleanSubcategory.slice(1, -1);
                    }
                    if (cleanSubcategory.startsWith("'") && cleanSubcategory.endsWith("'")) {
                        cleanSubcategory = cleanSubcategory.slice(1, -1);
                    }
                }

                if (Array.isArray(cleanSubcategory)) {
                    processedSubcategories = cleanSubcategory;
                } else if (typeof cleanSubcategory === 'string') {
                    try {
                        // محاولة تحليل JSON string
                        const parsed = JSON.parse(cleanSubcategory);
                        if (Array.isArray(parsed)) {
                            processedSubcategories = parsed;
                        } else {
                            processedSubcategories = [cleanSubcategory];
                        }
                    } catch (e) {
                        // إذا لم يكن JSON، حاول تقسيمه بفواصل
                        if (cleanSubcategory.includes(', ')) {
                            processedSubcategories = cleanSubcategory.split(', ').filter(item => item.trim() !== '');
                        } else if (cleanSubcategory.includes(',')) {
                            processedSubcategories = cleanSubcategory.split(',').filter(item => item.trim() !== '');
                        } else {
                            processedSubcategories = [cleanSubcategory];
                        }
                    }
                }

                // تنظيف كل عنصر من علامات الاقتباس الإضافية
                processedSubcategories = processedSubcategories.map(sub => {
                    let cleaned = sub.trim();
                    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                        cleaned = cleaned.slice(1, -1);
                    }
                    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
                        cleaned = cleaned.slice(1, -1);
                    }
                    return cleaned;
                }).filter(sub => sub !== '');
            }

            console.log('🔍 Original subcategory from request:', request.subcategory);
            console.log('🔄 Processed subcategories:', processedSubcategories);

            // Create the actual product
            const productData = {
                title: request.description, // استخدام الوصف كعنوان
                description: request.description,
                price: request.price || 0,
                category: request.category,
                subcategory: processedSubcategories, // استخدام المصفوفة المعالجة
                governorate: request.governorate,
                cities: request.cities,
                whatsapp: request.whatsapp,
                facebook: request.facebook,
                instagram: request.instagram,
                colors: request.colors, // إضافة الألوان من الطلب
                image_urls: imageUrlsOnly, // استخدام URLs المستخرجة بأمان
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('📦 Product data to be saved:');
            console.log('   🖼️ Image URLs structure:', finalImageUrls);
            console.log('   📊 Images count:', finalImageUrls?.length || 0);
            console.log('   🔗 URLs only:', imageUrlsOnly);

            // إزالة عمود colors من البيانات إذا لم يكن الجدول products_flowerbouquets
            const tableName = this.getTableName(request.category);
            if (tableName !== 'products_flowerbouquets' && productData.colors !== undefined) {
                delete productData.colors;
                console.log('🔍 Removed colors field for non-flowerbouquets table in request approval');
            }

            // Insert into the appropriate products table
            const { data: product, error: productError } = await this.supabase
                .from(tableName)
                .insert([productData])
                .select();

            if (productError) {
                console.error(`Error creating product in ${tableName}:`, productError);
                return { success: false, error: `Failed to create product: ${productError.message}` };
            }

            // Verify the saved product data
            if (product && product.length > 0) {
                console.log(`✅ Product successfully saved to ${tableName} with ID: ${product[0].id}`);
                console.log('🔍 Verifying saved product image data...');

                this.validateImageDataStructure(product[0].image_urls, `saved product ${product[0].id}`);
            }

            // Delete the request completely after successful approval
            console.log(`🗑️ Attempting to delete approved request: ${requestId}`);
            
            let deleteSuccess = false;
            let deleteAttempts = 0;
            const maxAttempts = 3;
            
            while (!deleteSuccess && deleteAttempts < maxAttempts) {
                deleteAttempts++;
                console.log(`🗑️ Delete attempt ${deleteAttempts}/${maxAttempts} for approved request: ${requestId}`);
                
                try {
                    // First, try to update the status to 'approved' before deletion
                    const { error: updateError } = await this.supabase
                        .from('product_requests')
                        .update({ 
                            status: 'approved',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', requestId);
                    
                    if (updateError) {
                        console.warn(`⚠️ Could not update status to approved:`, updateError);
                    }
                    
                    // Now try to delete the request
                    const { error: deleteError } = await this.supabase
                        .from('product_requests')
                        .delete()
                        .eq('id', requestId);

                    console.log(`🗑️ Delete operation result (attempt ${deleteAttempts}):`, { error: deleteError });

                    if (deleteError) {
                        console.error(`❌ Delete attempt ${deleteAttempts} failed:`, deleteError);
                        
                        // Check if it's a permission issue
                        if (deleteError.code === '42501' || deleteError.message.includes('permission')) {
                            console.error('❌ Permission denied for deletion');
                            return { success: false, error: 'Product created but request deletion failed due to permissions' };
                        }
                        
                        // Wait before retry
                        if (deleteAttempts < maxAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } else {
                        deleteSuccess = true;
                        console.log(`✅ Delete successful on attempt ${deleteAttempts}`);
                    }
                } catch (attemptError) {
                    console.error(`❌ Delete attempt ${deleteAttempts} threw error:`, attemptError);
                    if (deleteAttempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            if (!deleteSuccess) {
                console.error('❌ All delete attempts failed for approved request');
                return { success: false, error: 'Product created but request could not be deleted' };
            }

            // Verify that the request was actually deleted
            console.log(`🔍 Verifying deletion of approved request: ${requestId}`);
            
            // Wait a moment for database consistency
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: verifyRequest, error: verifyError } = await this.supabase
                .from('product_requests')
                .select('id')
                .eq('id', requestId)
                .single();
                
            if (verifyError && verifyError.code === 'PGRST116') {
                console.log('✅ Approved request successfully deleted (not found during verification)');
            } else if (verifyRequest) {
                console.warn('⚠️ Approved request still exists after deletion attempt!');
                console.warn('⚠️ This indicates a deletion failure');
                
                // Try one more time with force delete
                console.log('🔄 Attempting force delete for approved request...');
                try {
                    // Check if the function exists first
                    const { error: functionCheckError } = await this.supabase
                        .rpc('force_delete_product_request', { request_id: requestId });
                    
                    if (functionCheckError) {
                        console.warn('⚠️ Force delete function not available for approved request, trying alternative methods...');
                        
                        // Try direct deletion with elevated permissions
                        console.log('🔄 Attempting direct deletion with elevated permissions for approved request...');
                        try {
                            // Try to delete with a different approach
                            const { error: directDeleteError } = await this.supabase
                                .from('product_requests')
                                .delete()
                                .eq('id', requestId);
                            
                            if (directDeleteError) {
                                console.warn('⚠️ Direct deletion for approved request also failed:', directDeleteError);
                                
                                // Try one more time with a delay
                                console.log('🔄 Waiting and trying one more time for approved request...');
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                                const { error: finalDeleteError } = await this.supabase
                                    .from('product_requests')
                                    .delete()
                                    .eq('id', requestId)
                                    .select();
                                
                                if (finalDeleteError) {
                                    console.error('❌ Final deletion attempt for approved request failed:', finalDeleteError);
                                    return { success: false, error: 'Product created but request could not be deleted completely' };
                                } else {
                                    console.log('✅ Final deletion attempt for approved request successful');
                                }
                            } else {
                                console.log('✅ Direct deletion for approved request successful');
                            }
                        } catch (directError) {
                            console.error('❌ Direct deletion error for approved request:', directError);
                            return { success: false, error: 'Product created but request could not be deleted completely' };
                        }
                    } else {
                        console.log('✅ Force delete for approved request successful');
                    }
                } catch (forceError) {
                    console.error('❌ Force delete error for approved request:', forceError);
                    
                    // Try alternative force delete function
                    console.log('🔄 Attempting alternative force delete for approved request after error...');
                    try {
                        const { error: altForceDeleteError } = await this.supabase
                            .rpc('force_delete_product_request_rls', { request_id: requestId });
                        
                        if (altForceDeleteError) {
                            console.warn('⚠️ Alternative force delete function not available for approved request, trying direct deletion...');
                            
                            // Try direct deletion as fallback
                            const { error: fallbackDeleteError } = await this.supabase
                                .from('product_requests')
                                .delete()
                                .eq('id', requestId);
                            
                            if (fallbackDeleteError) {
                                console.error('❌ Fallback deletion for approved request also failed:', fallbackDeleteError);
                                return { success: false, error: 'Product created but request could not be deleted completely' };
                            } else {
                                console.log('✅ Fallback deletion for approved request successful');
                            }
                        } else {
                            console.log('✅ Alternative force delete for approved request successful');
                        }
                    } catch (altForceError) {
                        console.error('❌ Alternative force delete error for approved request:', altForceError);
                        
                        // Final fallback: try direct deletion
                        console.log('🔄 Attempting final fallback deletion for approved request...');
                        try {
                            const { error: finalFallbackError } = await this.supabase
                                .from('product_requests')
                                .delete()
                                .eq('id', requestId);
                            
                            if (finalFallbackError) {
                                console.error('❌ Final fallback deletion for approved request failed:', finalFallbackError);
                                return { success: false, error: 'Product created but request could not be deleted completely' };
                            } else {
                                console.log('✅ Final fallback deletion for approved request successful');
                            }
                        } catch (finalFallbackError) {
                            console.error('❌ Final fallback deletion error for approved request:', finalFallbackError);
                            return { success: false, error: 'Product created but request could not be deleted completely' };
                        }
                    }
                }
            } else {
                console.log('✅ Approved request deletion verified successfully');
            }

            console.log('✅ Product request approved, product created, and request deleted successfully');
            return { success: true, data: product[0] };
        } catch (error) {
            console.error('Error in approveProductRequest:', error);
            return { success: false, error: error.message };
        }
    }

    // Reject a product request
    // ❌ رفض الطلب: حذف الطلب والصورة نهائياً من النظام
    async rejectProductRequest(requestId, rejectionReason = '') {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductRequestsService not initialized' };
            }

            console.log(`❌ Rejecting product request: ${requestId}`);

            // Get the request details first to access image paths
            const { data: request, error: fetchError } = await this.supabase
                .from('product_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (fetchError || !request) {
                console.error('Error fetching request for rejection:', fetchError);
                return { success: false, error: 'Request not found' };
            }

            // Delete images from storage if they exist
            if (request.image_urls && request.image_urls.length > 0) {
                console.log(`🗑️ Deleting ${request.image_urls.length} images for rejected request`);
                const deleteImagesResult = await this.deleteRequestImages(request.image_urls);

                if (!deleteImagesResult.success) {
                    console.warn('⚠️ Failed to delete images from storage, but continuing with request deletion');
                    console.warn('⚠️ Images may remain in storage - manual cleanup may be needed');
                } else {
                    console.log('✅ Images deleted from storage successfully');
                }
            }

            // Delete the request completely with multiple attempts
            console.log(`🗑️ Attempting to delete rejected request: ${requestId}`);
            
            let deleteSuccess = false;
            let deleteAttempts = 0;
            const maxAttempts = 3;
            
            while (!deleteSuccess && deleteAttempts < maxAttempts) {
                deleteAttempts++;
                console.log(`🗑️ Delete attempt ${deleteAttempts}/${maxAttempts} for request: ${requestId}`);
                
                try {
                    // First, try to update the status to 'rejected' before deletion
                    const { error: updateError } = await this.supabase
                        .from('product_requests')
                        .update({ 
                            status: 'rejected',
                            updated_at: new Date().toISOString(),
                            rejection_reason: rejectionReason || null
                        })
                        .eq('id', requestId);
                    
                    if (updateError) {
                        console.warn(`⚠️ Could not update status to rejected:`, updateError);
                    }
                    
                    // Now try to delete the request
                    const { error: deleteError } = await this.supabase
                        .from('product_requests')
                        .delete()
                        .eq('id', requestId);

                    console.log(`🗑️ Delete operation result (attempt ${deleteAttempts}):`, { error: deleteError });

                    if (deleteError) {
                        console.error(`❌ Delete attempt ${deleteAttempts} failed:`, deleteError);
                        
                        // Check if it's a permission issue
                        if (deleteError.code === '42501' || deleteError.message.includes('permission')) {
                            console.error('❌ Permission denied for deletion');
                            return { success: false, error: 'Permission denied: Cannot delete this request' };
                        }
                        
                        // Wait before retry
                        if (deleteAttempts < maxAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } else {
                        deleteSuccess = true;
                        console.log(`✅ Delete successful on attempt ${deleteAttempts}`);
                    }
                } catch (attemptError) {
                    console.error(`❌ Delete attempt ${deleteAttempts} threw error:`, attemptError);
                    if (deleteAttempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            if (!deleteSuccess) {
                console.error('❌ All delete attempts failed');
                return { success: false, error: 'Failed to delete request after multiple attempts' };
            }

            // Verify that the request was actually deleted
            console.log(`🔍 Verifying deletion of request: ${requestId}`);
            
            // Wait a moment for database consistency
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: verifyRequest, error: verifyError } = await this.supabase
                .from('product_requests')
                .select('id')
                .eq('id', requestId)
                .single();
                
            if (verifyError && verifyError.code === 'PGRST116') {
                console.log('✅ Request successfully deleted (not found during verification)');
            } else if (verifyRequest) {
                console.warn('⚠️ Request still exists after deletion attempt!');
                console.warn('⚠️ This indicates a deletion failure');
                
                // Try one more time with force delete
                console.log('🔄 Attempting force delete...');
                try {
                    // Check if the function exists first
                    const { error: functionCheckError } = await this.supabase
                        .rpc('force_delete_product_request', { request_id: requestId });
                    
                    if (functionCheckError) {
                        console.warn('⚠️ Force delete function not available, trying alternative methods...');
                        
                        // Try direct deletion with elevated permissions
                        console.log('🔄 Attempting direct deletion with elevated permissions...');
                        try {
                            // Try to delete with a different approach
                            const { error: directDeleteError } = await this.supabase
                                .from('product_requests')
                                .delete()
                                .eq('id', requestId);
                            
                            if (directDeleteError) {
                                console.warn('⚠️ Direct deletion also failed:', directDeleteError);
                                
                                // Try one more time with a delay
                                console.log('🔄 Waiting and trying one more time...');
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                                const { error: finalDeleteError } = await this.supabase
                                    .from('product_requests')
                                    .delete()
                                    .eq('id', requestId)
                                    .select();
                                
                                if (finalDeleteError) {
                                    console.error('❌ Final deletion attempt failed:', finalDeleteError);
                                    return { success: false, error: 'Request could not be deleted completely' };
                                } else {
                                    console.log('✅ Final deletion attempt successful');
                                }
                            } else {
                                console.log('✅ Direct deletion successful');
                            }
                        } catch (directError) {
                            console.error('❌ Direct deletion error:', directError);
                            return { success: false, error: 'Request could not be deleted completely' };
                        }
                    } else {
                        console.log('✅ Force delete successful');
                    }
                } catch (forceError) {
                    console.error('❌ Force delete error:', forceError);
                    
                    // Try alternative force delete function
                    console.log('🔄 Attempting alternative force delete after error...');
                    try {
                        const { error: altForceDeleteError } = await this.supabase
                            .rpc('force_delete_product_request_rls', { request_id: requestId });
                        
                        if (altForceDeleteError) {
                            console.warn('⚠️ Alternative force delete function not available, trying direct deletion...');
                            
                            // Try direct deletion as fallback
                            const { error: fallbackDeleteError } = await this.supabase
                                .from('product_requests')
                                .delete()
                                .eq('id', requestId);
                            
                            if (fallbackDeleteError) {
                                console.error('❌ Fallback deletion also failed:', fallbackDeleteError);
                                return { success: false, error: 'Request could not be deleted completely' };
                            } else {
                                console.log('✅ Fallback deletion successful');
                            }
                        } else {
                            console.log('✅ Alternative force delete successful');
                        }
                    } catch (altForceError) {
                        console.error('❌ Alternative force delete error:', altForceError);
                        
                        // Final fallback: try direct deletion
                        console.log('🔄 Attempting final fallback deletion...');
                        try {
                            const { error: finalFallbackError } = await this.supabase
                                .from('product_requests')
                                .delete()
                                .eq('id', requestId);
                            
                            if (finalFallbackError) {
                                console.error('❌ Final fallback deletion failed:', finalFallbackError);
                                return { success: false, error: 'Request could not be deleted completely' };
                            } else {
                                console.log('✅ Final fallback deletion successful');
                            }
                        } catch (finalFallbackError) {
                            console.error('❌ Final fallback deletion error:', finalFallbackError);
                            return { success: false, error: 'Request could not be deleted completely' };
                        }
                    }
                }
            } else {
                console.log('✅ Request deletion verified successfully');
            }

            console.log('✅ Product request rejected and completely deleted');
            return { success: true };
        } catch (error) {
            console.error('Error in rejectProductRequest:', error);
            return { success: false, error: error.message };
        }
    }

    // Move images from temporary to final location using existing folder structure
    async moveImagesToFinalLocation(imageUrls, category) {
        try {
            console.log(`🚀 Starting image move process for category: ${category}`);

            if (!imageUrls || imageUrls.length === 0) {
                console.log('⚠️ No images to move');
                return [];
            }

            console.log(`📊 Processing ${imageUrls.length} images`);
            console.log('📋 Image URLs structure:', imageUrls);

            const finalImageUrls = [];
            const timestamp = Date.now();
            const successfullyCopiedImages = []; // لتتبع الصور التي نُسخت بنجاح

            // Map category to existing folder structure
            const folderMap = {
                'cake': 'products_cake',
                'koshat': 'products_koshat',
                'mirr': 'products_mirr',
                'other': 'products_other',
                'invitations': 'products_invitations',
                'flowerbouquets': 'products_flowerbouquets'
            };

            const folderPath = folderMap[category] || 'products_other';
            console.log(`🎯 Moving images to existing folder: ${folderPath}`);

            for (let i = 0; i < imageUrls.length; i++) {
                const image = imageUrls[i];
                const fileName = `product_${category}_${timestamp}_${i}_${image.original_name}`;
                const finalPath = `${folderPath}/${fileName}`;

                console.log(`🔄 Moving image ${i + 1}/${imageUrls.length} to final location:`);
                console.log(`   📁 Source path: ${image.path}`);
                console.log(`   🎯 Target path: ${finalPath}`);
                console.log(`   🔗 Source URL: ${image.url}`);

                // Validate source path
                if (!image.path || typeof image.path !== 'string') {
                    console.error(`❌ Invalid source path for image ${i}:`, image.path);
                    finalImageUrls.push({
                        url: image.url,
                        path: image.path || 'invalid_path',
                        original_name: image.original_name
                    });
                    continue;
                }

                // First, verify that source file exists
                console.log(`🔍 Verifying source file exists: ${image.path}`);
                try {
                    const { data: fileList, error: listError } = await this.supabase.storage
                        .from('images')
                        .list(image.path.substring(0, image.path.lastIndexOf('/')), {
                            limit: 100,
                            search: image.path.substring(image.path.lastIndexOf('/') + 1)
                        });

                    if (listError) {
                        console.error(`❌ Error checking if source file exists:`, listError);
                    } else {
                        const fileExists = fileList.some(file => file.name === image.path.substring(image.path.lastIndexOf('/') + 1));
                        console.log(`📋 Source file exists: ${fileExists}`, fileList);
                    }
                } catch (checkError) {
                    console.error(`❌ Failed to check source file:`, checkError);
                }

                // Use download and re-upload method (more reliable than copy)
                let copySuccess = false;
                console.log(`🔄 Using reliable method: download and re-upload`);

                try {
                    console.log(`📥 Downloading image from: ${image.url}`);

                    // Get the file content from source URL with retry logic
                    let response;
                    let retryCount = 0;
                    const maxRetries = 3;

                    while (retryCount < maxRetries) {
                        try {
                            response = await fetch(image.url, {
                                method: 'GET',
                                headers: {
                                    'Cache-Control': 'no-cache'
                                }
                            });

                            if (response.ok) break;

                            console.warn(`⚠️ Fetch attempt ${retryCount + 1} failed: ${response.status} ${response.statusText}`);
                            retryCount++;

                            if (retryCount < maxRetries) {
                                console.log(`⏳ Waiting before retry...`);
                                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                            }
                        } catch (fetchError) {
                            console.error(`❌ Fetch error on attempt ${retryCount + 1}:`, fetchError);
                            retryCount++;

                            if (retryCount < maxRetries) {
                                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                            }
                        }
                    }

                    if (!response || !response.ok) {
                        throw new Error(`Failed to fetch image after ${maxRetries} attempts: ${response?.status || 'Network error'}`);
                    }

                    const blob = await response.blob();
                    console.log(`📦 Downloaded blob:`, {
                        size: blob.size,
                        type: blob.type,
                        url: image.url
                    });

                    // Check blob size and warn if too large
                    const maxBlobSize = 10 * 1024 * 1024; // 10MB limit
                    if (blob.size > maxBlobSize) {
                        console.warn(`⚠️ Large blob detected: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
                    }

                    // Check if blob has content
                    if (blob.size === 0) {
                        throw new Error('Downloaded blob is empty');
                    }

                    // Create a new file with proper name
                    const cleanFileName = image.original_name || `image_${i + 1}.jpg`;
                    const file = new File([blob], cleanFileName, {
                        type: blob.type || 'image/jpeg'
                    });

                    console.log(`📤 Uploading to final location: ${finalPath}`);

                    // Upload to final location with retry logic
                    let uploadSuccess = false;
                    let uploadRetryCount = 0;
                    const maxUploadRetries = 2;

                    while (!uploadSuccess && uploadRetryCount < maxUploadRetries) {
                        try {
                            console.log(`📤 Upload attempt ${uploadRetryCount + 1}/${maxUploadRetries} to: ${finalPath}`);

                            const uploadResult = await this.supabase.storage
                                .from('images')
                                .upload(finalPath, file, {
                                    cacheControl: '3600',
                                    upsert: true, // Allow overwrite
                                    contentType: file.type
                                });

                            if (uploadResult.error) {
                                console.error(`❌ Upload attempt ${uploadRetryCount + 1} failed:`, uploadResult.error);
                                uploadRetryCount++;

                                if (uploadRetryCount < maxUploadRetries) {
                                    console.log(`⏳ Retrying upload in 2 seconds...`);
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                } else {
                                    throw new Error(`Upload failed after ${maxUploadRetries} attempts: ${uploadResult.error.message}`);
                                }
                            } else {
                                uploadSuccess = true;
                                console.log(`✅ Upload successful for: ${finalPath}`);
                            }
                        } catch (uploadError) {
                            console.error(`❌ Upload exception on attempt ${uploadRetryCount + 1}:`, uploadError);
                            uploadRetryCount++;

                            if (uploadRetryCount < maxUploadRetries) {
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            } else {
                                throw uploadError;
                            }
                        }
                    }

                    if (!uploadSuccess) {
                        throw new Error(`Upload failed after all retry attempts`);
                    }

                    copySuccess = true;

                } catch (moveError) {
                    console.error(`❌ Move operation failed for ${image.original_name}:`, moveError);
                    console.log(`⚠️ Keeping original image reference as fallback`);
                    console.log(`   Original path: ${image.path}`);
                    console.log(`   Original URL: ${image.url}`);

                    // Keep original path if move fails - this ensures the image is still accessible
                    finalImageUrls.push({
                        url: image.url,
                        path: image.path,
                        original_name: image.original_name,
                        move_failed: true, // Mark that move failed but original is preserved
                        error: moveError.message
                    });
                    continue;
                }

                if (!copySuccess) continue;

                // Verify the file was successfully moved
                console.log(`🔍 Verifying moved file exists: ${finalPath}`);
                try {
                    const folderToCheck = finalPath.substring(0, finalPath.lastIndexOf('/'));
                    const fileToCheck = finalPath.substring(finalPath.lastIndexOf('/') + 1);

                    const { data: verifyList, error: verifyError } = await this.supabase.storage
                        .from('images')
                        .list(folderToCheck, {
                            limit: 100,
                            search: fileToCheck
                        });

                    if (verifyError) {
                        console.error(`❌ Error verifying moved file:`, verifyError);
                    } else {
                        const fileMoved = verifyList.some(file => file.name === fileToCheck);
                        console.log(`📋 File successfully moved: ${fileMoved}`);
                    }
                } catch (verifyError) {
                    console.error(`❌ Failed to verify moved file:`, verifyError);
                }

                // Get public URL for final location
                const { data: urlData } = this.supabase.storage
                    .from('images')
                    .getPublicUrl(finalPath);

                if (urlData?.publicUrl) {
                    finalImageUrls.push({
                        url: urlData.publicUrl,
                        path: finalPath,
                        original_name: image.original_name
                    });
                    // إضافة الصورة لقائمة الصور الناجحة للحذف لاحقاً
                    successfullyCopiedImages.push({
                        path: image.path,
                        original_name: image.original_name
                    });
                    console.log(`✅ Image moved to existing folder: ${finalPath}`);
                    console.log(`   🔗 Final URL: ${urlData.publicUrl}`);
                } else {
                    console.error(`❌ Failed to get public URL for: ${finalPath}`);
                    // Fallback to original URL
                    finalImageUrls.push({
                        url: image.url,
                        path: image.path,
                        original_name: image.original_name
                    });
                    console.log(`⚠️ Keeping original image reference`);
                }
            }

            // 🗑️ حذف الصور الأصلية من مجلد Product_requests بعد نجاح النسخ
            if (successfullyCopiedImages.length > 0) {
                console.log(`🧹 Cleaning up ${successfullyCopiedImages.length} temporary images from Product_requests/`);
                
                for (const image of successfullyCopiedImages) {
                    try {
                        console.log(`🗑️ Deleting temporary image: ${image.path}`);
                        
                        const { error: deleteError } = await this.supabase.storage
                            .from('images')
                            .remove([image.path]);

                        if (deleteError) {
                            console.error(`❌ Failed to delete temporary image ${image.path}:`, deleteError);
                        } else {
                            console.log(`✅ Successfully deleted temporary image: ${image.path}`);
                        }
                    } catch (deleteError) {
                        console.error(`❌ Error deleting temporary image ${image.path}:`, deleteError);
                    }
                }
                
                console.log(`🧹 Cleanup completed. Deleted ${successfullyCopiedImages.length} temporary images.`);
            } else {
                console.log(`⚠️ No images were successfully copied, skipping cleanup.`);
            }

            console.log(`✅ Image move process completed:`);
            console.log(`   📊 Total images processed: ${imageUrls.length}`);
            console.log(`   ✅ Successfully moved: ${finalImageUrls.length}`);
            console.log(`   🗑️ Cleaned up: ${successfullyCopiedImages.length}`);
            console.log(`   📋 Final result:`, finalImageUrls);

            // Final validation of result
            this.validateImageDataStructure(finalImageUrls, 'final result');

            return finalImageUrls;
        } catch (error) {
            console.error('❌ Error moving images to final location:', error);
            // Return original image objects as fallback to maintain consistency
            console.log('⚠️ Using original image references due to error');
            const fallbackImages = imageUrls && Array.isArray(imageUrls)
                ? imageUrls.map(img => ({
                    url: img?.url,
                    path: img?.path,
                    original_name: img?.original_name
                })).filter(img => img?.url) // إزالة العناصر غير الصالحة
                : [];
            console.log('📋 Fallback result:', fallbackImages);

            // Validate fallback result
            this.validateImageDataStructure(fallbackImages, 'fallback result');

            return fallbackImages;
        }
    }

    // Validate image data structure for debugging
    validateImageDataStructure(data, context = '') {
        console.log(`🔍 Validating image data structure ${context}:`, data);

        if (!data) {
            console.error(`❌ No data provided ${context}`);
            return false;
        }

        if (Array.isArray(data)) {
            console.log(`📊 Data is array with ${data.length} items`);

            data.forEach((item, index) => {
                if (typeof item === 'string') {
                    console.warn(`⚠️ Item ${index} is string:`, item);
                } else if (typeof item === 'object' && item.url) {
                    console.log(`✅ Item ${index} is valid object:`, {
                        url: item.url.substring(0, 50) + '...',
                        path: item.path,
                        original_name: item.original_name
                    });
                } else {
                    console.error(`❌ Item ${index} has invalid structure:`, item);
                }
            });
        } else {
            console.error(`❌ Data is not array:`, typeof data);
            return false;
        }

        return true;
    }

    // Get table name based on category
    getTableName(category) {
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
            console.warn(`⚠️ Unknown category: ${category}, defaulting to products_other`);
            return 'products_other';
        }
        
        return tableName;
    }

    // Get request statistics
    async getRequestStatistics() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'ProductRequestsService not initialized' };
            }

            const { data, error } = await this.supabase
                .from('product_requests')
                .select('status');

            if (error) {
                console.error('Error fetching request statistics:', error);
                return { success: false, error: error.message };
            }

            const stats = {
                total: data.length,
                pending: data.filter(r => r.status === 'pending').length,
                approved: data.filter(r => r.status === 'approved').length,
                rejected: data.filter(r => r.status === 'rejected').length
            };

            return { success: true, data: stats };
        } catch (error) {
            console.error('Error in getRequestStatistics:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete images from storage when rejecting a request
    async deleteRequestImages(imageUrls) {
        try {
            if (!imageUrls || imageUrls.length === 0) {
                console.log('ℹ️ No images to delete');
                return { success: true };
            }

            console.log(`🗑️ Deleting ${imageUrls.length} images from storage`);

            // Extract file paths from image URLs (same logic as product-service.js)
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
                        .from('images')
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
            console.error('❌ Error in deleteRequestImages:', error);
            return { success: false, error: error.message };
        }
    }
}

// Make the service available globally
window.ProductRequestsService = ProductRequestsService;
