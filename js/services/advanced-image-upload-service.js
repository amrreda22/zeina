/**
 * Advanced Image Upload Service for Supabase
 * Handles image resizing, compression, validation, and upload with error handling
 */

class AdvancedImageUploadService {
    constructor(options = {}) {
        this.supabase = null;
        this.initialized = false;
        this.initPromise = this.initialize();

        // Default configuration - optimized for size reduction
        this.config = {
            maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB default
            allowedTypes: options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'],
            maxWidth: options.maxWidth || 1200,
            maxHeight: options.maxHeight || 1200,
            quality: options.quality || 0.85, // Slightly higher quality for better balance
            storageBucket: options.storageBucket || 'images',
            folderPath: options.folderPath || 'uploads',
            alwaysCompress: options.alwaysCompress !== false, // Always compress by default
            ...options
        };
    }

    async initialize() {
        try {
            console.log('🔄 AdvancedImageUploadService: Starting initialization...');

            // Wait for Supabase client to be available
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
                this.initialized = true;
                console.log('✅ AdvancedImageUploadService: Supabase client already available');
            } else {
                console.log('⏳ AdvancedImageUploadService: Waiting for Supabase client...');

                // Wait for initialization
                await new Promise((resolve) => {
                    let attempts = 0;
                    const maxAttempts = 150;

                    const checkInterval = setInterval(() => {
                        attempts++;

                        if (window.supabaseClient) {
                            clearInterval(checkInterval);
                            this.supabase = window.supabaseClient;
                            this.initialized = true;
                            console.log('✅ AdvancedImageUploadService: Supabase client loaded successfully');
                            resolve();
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            console.error('❌ AdvancedImageUploadService: Supabase client not loaded after 15 seconds');
                            resolve();
                        } else if (attempts % 10 === 0) {
                            console.log(`⏳ AdvancedImageUploadService: Waiting for Supabase client... (attempt ${attempts}/${maxAttempts})`);
                        }
                    }, 100);
                });
            }

            if (this.supabase) {
                this.initialized = true;
                console.log('✅ AdvancedImageUploadService initialized successfully with Supabase client');
            } else {
                console.error('❌ AdvancedImageUploadService: Failed to initialize Supabase client');
            }
        } catch (error) {
            console.error('❌ AdvancedImageUploadService initialization error:', error);
        }
    }

    // Ensure service is initialized
    async ensureInitialized() {
        if (!this.initialized) {
            console.log('🔄 AdvancedImageUploadService: Ensuring initialization...');
            await this.initialize();
        }
        return this.supabase !== null && this.initialized;
    }

    /**
     * Main method to upload a single image with processing
     * @param {File} file - The image file to upload
     * @param {Object} options - Additional options for this specific upload
     * @returns {Promise<Object>} Upload result with success status and data
     */
    async uploadImage(file, options = {}) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return {
                    success: false,
                    error: 'AdvancedImageUploadService not initialized'
                };
            }

            console.log('📤 Starting image upload process:', file.name);

            // Step 1: Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }

            // Step 2: Process image (always compress and resize if needed or if alwaysCompress is enabled)
            const shouldProcess = this.config.alwaysCompress || file.size > this.config.maxFileSize * 0.8; // Process if > 80% of limit
            let processedFile = file; // Initialize with original file

            if (shouldProcess) {
                console.log(`🔄 Processing image: ${file.name} (${this.formatBytes(file.size)})`);

                try {
                    processedFile = await this.processImage(file, options);

                    if (!processedFile || processedFile.size === 0) {
                        throw new Error('Processing failed: invalid processed file');
                    }

                    console.log(`✅ Processed file size: ${this.formatBytes(processedFile.size)}`);

                    // Step 3: Check if processed file is still too large
                    if (processedFile.size > this.config.maxFileSize) {
                        console.log(`⚠️ Processed file still too large (${this.formatBytes(processedFile.size)}), trying harder compression...`);

                        // Try with lower quality
                        processedFile = await this.processImage(file, {
                            ...options,
                            quality: Math.max(0.4, this.config.quality - 0.3)
                        });

                        if (!processedFile || processedFile.size === 0) {
                            throw new Error('Lower quality processing failed');
                        }

                        console.log(`✅ After lower quality: ${this.formatBytes(processedFile.size)}`);

                        // If still too large, try aggressive compression
                        if (processedFile.size > this.config.maxFileSize) {
                            console.log(`⚠️ Still too large, trying aggressive compression...`);

                            processedFile = await this.aggressiveCompress(file, options);

                            if (!processedFile || processedFile.size === 0) {
                                throw new Error('Aggressive compression failed');
                            }

                            console.log(`✅ After aggressive compression: ${this.formatBytes(processedFile.size)}`);
                        }
                    }
                } catch (processError) {
                    console.error('❌ Image processing failed:', processError);
                    // Fall back to original file if processing fails
                    console.log('⚠️ Falling back to original file due to processing failure');
                    processedFile = file;
                }
            } else {
                console.log(`ℹ️ Image size ${this.formatBytes(file.size)} is within acceptable range, uploading as-is`);
                processedFile = file;
            }

            // Step 3: Upload to Supabase
            console.log(`📤 Uploading processed file: ${processedFile.name} (${this.formatBytes(processedFile.size)})`);

            // Ensure processedFile is valid before upload
            if (!processedFile || processedFile.size === 0) {
                console.error('❌ Invalid processed file, falling back to original');
                processedFile = file;
            }

            const uploadResult = await this.uploadToSupabase(processedFile, options);

            if (uploadResult.success) {
                console.log('✅ Image uploaded successfully:', uploadResult.data.publicUrl);

                // Calculate compression metrics safely
                const finalSize = processedFile.size;
                const originalSize = file.size;
                const compressionRatio = originalSize > 0 ? ((1 - finalSize / originalSize) * 100).toFixed(1) : '0';
                const spaceSaved = originalSize - finalSize;

                return {
                    success: true,
                    data: {
                        url: uploadResult.data.publicUrl,
                        path: uploadResult.data.path,
                        originalName: file.name,
                        processedName: processedFile.name,
                        originalSize: originalSize,
                        processedSize: finalSize,
                        wasProcessed: shouldProcess,
                        compressionRatio: compressionRatio,
                        spaceSaved: spaceSaved
                    }
                };
            } else {
                return uploadResult;
            }

        } catch (error) {
            console.error('❌ Error in uploadImage:', error);
            return {
                success: false,
                error: `Upload failed: ${error.message}`
            };
        }
    }

    /**
     * Upload multiple images with batch processing
     * @param {FileList|Array} files - Array of image files
     * @param {Object} options - Options for batch processing
     * @returns {Promise<Object>} Batch upload result
     */
    async uploadImages(files, options = {}) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return {
                    success: false,
                    error: 'AdvancedImageUploadService not initialized'
                };
            }

            console.log(`📤 Starting batch upload of ${files.length} images`);

            const results = [];
            const errors = [];
            let successCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`🔄 Processing image ${i + 1}/${files.length}: ${file.name}`);

                try {
                    const result = await this.uploadImage(file, {
                        ...options,
                        index: i
                    });

                    if (result.success) {
                        results.push(result.data);
                        successCount++;
                    } else {
                        errors.push({
                            file: file.name,
                            error: result.error,
                            index: i
                        });
                    }
                } catch (error) {
                    console.error(`❌ Error processing image ${file.name}:`, error);
                    errors.push({
                        file: file.name,
                        error: error.message,
                        index: i
                    });
                }
            }

            console.log(`✅ Batch upload completed: ${successCount}/${files.length} successful`);

            return {
                success: successCount > 0,
                data: {
                    uploadedImages: results,
                    totalFiles: files.length,
                    successCount,
                    errorCount: errors.length,
                    errors: errors.length > 0 ? errors : null
                }
            };

        } catch (error) {
            console.error('❌ Error in uploadImages:', error);
            return {
                success: false,
                error: `Batch upload failed: ${error.message}`
            };
        }
    }

    /**
     * Validate file before processing
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    validateFile(file) {
        // Check if file exists
        if (!file) {
            return {
                valid: false,
                error: 'No file provided'
            };
        }

        // Check file type
        if (!this.config.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Unsupported file type: ${file.type}. Allowed types: ${this.config.allowedTypes.join(', ')}`
            };
        }

        // Check file size (allow up to 10MB for initial validation, processing will handle the rest)
        const maxInitialSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxInitialSize) {
            return {
                valid: false,
                error: `File too large: ${this.formatBytes(file.size)}. Maximum allowed: ${this.formatBytes(maxInitialSize)}`
            };
        }

        return { valid: true };
    }

    /**
     * Process image: resize and compress if needed
     * @param {File} file - Original image file
     * @param {Object} options - Processing options
     * @returns {Promise<File>} Processed image file
     */
    async processImage(file, options = {}) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculate new dimensions
                    const { width, height } = this.calculateDimensions(
                        img.width,
                        img.height,
                        this.config.maxWidth,
                        this.config.maxHeight
                    );

                    // Set canvas size
                    canvas.width = width;
                    canvas.height = height;

                    // Enable image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Use custom quality from options or default
                    const quality = options.quality || this.config.quality;

                    // Convert to blob with compression
                    canvas.toBlob(
                        (blob) => {
                            try {
                                if (blob && blob.size > 0) {
                                    // Create new file with processed blob
                                    const processedFile = new File(
                                        [blob],
                                        this.generateUniqueFileName(file.name),
                                        {
                                            type: file.type,
                                            lastModified: Date.now()
                                        }
                                    );

                                    console.log(`🔄 Image processed: ${img.width}x${img.height} → ${width}x${height}, Quality: ${quality}, Size: ${this.formatBytes(file.size)} → ${this.formatBytes(processedFile.size)}`);
                                    resolve(processedFile);
                                } else {
                                    reject(new Error('Failed to process image: empty blob'));
                                }
                            } catch (blobError) {
                                reject(new Error(`Failed to create processed file: ${blobError.message}`));
                            }
                        },
                        file.type,
                        quality
                    );

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for processing'));
            };

            // Create object URL for the image
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Calculate optimal dimensions for resizing
     * @param {number} originalWidth
     * @param {number} originalHeight
     * @param {number} maxWidth
     * @param {number} maxHeight
     * @returns {Object} New dimensions
     */
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;

        // Always resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
            // Calculate aspect ratio
            const aspectRatio = width / height;

            // Resize based on the limiting dimension
            if (width > height) {
                // Landscape or square
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / aspectRatio;
                }
                // If height still exceeds max after width adjustment
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
            } else {
                // Portrait
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
                // If width still exceeds max after height adjustment
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / aspectRatio;
                }
            }
        }

        // If image is very large, reduce it more aggressively for better compression
        if (originalWidth > 2000 || originalHeight > 2000) {
            const scaleFactor = Math.min(width / originalWidth, height / originalHeight);
            if (scaleFactor > 0.8) { // If we're keeping more than 80%, reduce more
                const aggressiveScale = 0.7;
                width = Math.round(width * aggressiveScale);
                height = Math.round(height * aggressiveScale);
            }
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }

    /**
     * Aggressive compression for very large files
     * @param {File} file - Original image file
     * @param {Object} options - Processing options
     * @returns {Promise<File>} Aggressively compressed image file
     */
    async aggressiveCompress(file, options = {}) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculate very aggressive dimensions
                    const maxDimension = Math.min(800, Math.max(this.config.maxWidth, this.config.maxHeight) * 0.6);
                    const { width, height } = this.calculateDimensions(
                        img.width,
                        img.height,
                        maxDimension,
                        maxDimension
                    );

                    // Set canvas size
                    canvas.width = width;
                    canvas.height = height;

                    // Enable image smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'medium';

                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Use very low quality for aggressive compression
                    const aggressiveQuality = 0.5;

                    // Convert to blob with aggressive compression
                    canvas.toBlob(
                        (blob) => {
                            try {
                                if (blob && blob.size > 0) {
                                    // Create new file with compressed blob
                                    const compressedFile = new File(
                                        [blob],
                                        this.generateUniqueFileName(file.name),
                                        {
                                            type: 'image/jpeg', // Force JPEG for better compression
                                            lastModified: Date.now()
                                        }
                                    );

                                    console.log(`🔄 Aggressive compression: ${img.width}x${img.height} → ${width}x${height}, Size: ${this.formatBytes(file.size)} → ${this.formatBytes(compressedFile.size)}`);
                                    resolve(compressedFile);
                                } else {
                                    reject(new Error('Failed to aggressively compress image: empty blob'));
                                }
                            } catch (blobError) {
                                reject(new Error(`Failed to create compressed file: ${blobError.message}`));
                            }
                        },
                        'image/jpeg', // Force JPEG format for better compression
                        aggressiveQuality
                    );

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for aggressive compression'));
            };

            // Create object URL for the image
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Upload processed file to Supabase Storage
     * @param {File} file - File to upload
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result
     */
    async uploadToSupabase(file, options = {}) {
        try {
            const timestamp = Date.now();
            const uniqueFileName = this.generateUniqueFileName(file.name);
            const folderPath = options.folderPath || this.config.folderPath;
            const filePath = `${folderPath}/${timestamp}_${uniqueFileName}`;

            console.log(`📤 Uploading to Supabase: ${filePath}`);

            const { data, error } = await this.supabase.storage
                .from(this.config.storageBucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type
                });

            if (error) {
                console.error('❌ Upload error:', error);
                return {
                    success: false,
                    error: `Upload failed: ${error.message}`
                };
            }

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from(this.config.storageBucket)
                .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
                return {
                    success: false,
                    error: 'Failed to get public URL'
                };
            }

            return {
                success: true,
                data: {
                    publicUrl: urlData.publicUrl,
                    path: filePath,
                    fileName: uniqueFileName
                }
            };

        } catch (error) {
            console.error('❌ Error uploading to Supabase:', error);
            return {
                success: false,
                error: `Supabase upload error: ${error.message}`
            };
        }
    }

    /**
     * Generate unique file name to avoid conflicts
     * @param {string} originalName - Original file name
     * @returns {string} Unique file name
     */
    generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop();
        const baseName = originalName.replace(/\.[^/.]+$/, '');

        return `${baseName}_${timestamp}_${randomString}.${extension}`;
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes
     * @returns {string} Formatted size
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Delete image from Supabase Storage
     * @param {string} path - Path to the image in storage
     * @returns {Promise<Object>} Deletion result
     */
    async deleteImage(path) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return {
                    success: false,
                    error: 'AdvancedImageUploadService not initialized'
                };
            }

            console.log(`🗑️ Deleting image: ${path}`);

            const { error } = await this.supabase.storage
                .from(this.config.storageBucket)
                .remove([path]);

            if (error) {
                console.error('❌ Delete error:', error);
                return {
                    success: false,
                    error: `Delete failed: ${error.message}`
                };
            }

            console.log('✅ Image deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('❌ Error deleting image:', error);
            return {
                success: false,
                error: `Delete error: ${error.message}`
            };
        }
    }

    /**
     * Get image metadata (dimensions, size, etc.)
     * @param {File} file - Image file
     * @returns {Promise<Object>} Image metadata
     */
    async getImageMetadata(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height,
                    fileSize: file.size,
                    fileType: file.type,
                    lastModified: file.lastModified
                });
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for metadata'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        console.log('⚙️ Configuration updated:', this.config);
    }
}

// Create global instance
window.AdvancedImageUploadService = AdvancedImageUploadService;

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedImageUploadService;
}
