/**
 * Enhanced Image Upload Integration
 * تكامل الرفع المتقدم مع صفحة add-product-request.html
 */

class EnhancedImageUploadIntegration {
    constructor() {
        this.imageUploadService = null;
        this.uploadedImages = [];
        this.maxImages = 3;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing enhanced image upload integration...');

            // Wait for Supabase and the advanced service to be available
            await this.waitForDependencies();

            // Initialize the advanced image upload service with optimal settings
            this.imageUploadService = new AdvancedImageUploadService({
                maxFileSize: 1024 * 1024, // 1MB
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.85, // Higher quality for better balance
                alwaysCompress: true, // Always compress images for maximum space savings
                storageBucket: 'images',
                folderPath: 'product_requests'
            });

            // Setup the enhanced upload functionality
            this.setupEnhancedUpload();

            this.isInitialized = true;
            console.log('✅ Enhanced image upload integration initialized successfully');

            // Additional logging for debugging
            console.log('🔍 Debug info:', {
                location: window.location.href,
                hasImageSlots: document.querySelectorAll('.image-slot').length,
                supabaseClient: !!window.supabaseClient,
                advancedService: !!window.AdvancedImageUploadService
            });
            console.log('⚙️ Using advanced compression settings:', {
                maxFileSize: '1MB',
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.85,
                alwaysCompress: true
            });

        } catch (error) {
            console.error('❌ Failed to initialize enhanced image upload integration:', error);
        }
    }

    async waitForDependencies() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 100;

            const checkDependencies = () => {
                attempts++;

                if (window.supabaseClient &&
                    window.supabase &&
                    window.AdvancedImageUploadService) {
                    console.log('✅ All dependencies loaded');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Some dependencies may not be loaded, proceeding anyway');
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };

            checkDependencies();
        });
    }

    setupEnhancedUpload() {
        console.log('🔧 Setting up enhanced upload for image slots...');

        // Find all image slots
        const imageSlots = document.querySelectorAll('.image-slot');
        console.log(`📋 Found ${imageSlots.length} image slots`);

        // Disable existing upload handlers to avoid conflicts
        this.disableExistingUploadHandlers();

        imageSlots.forEach((slot, index) => {
            this.setupImageSlot(slot, index);
        });

        // Override the existing form submission to use our enhanced upload
        this.overrideFormSubmission();

        console.log('✅ Enhanced upload setup completed');
    }

    disableExistingUploadHandlers() {
        console.log('🛑 Disabling existing upload handlers...');

        // Remove any existing file inputs that might conflict
        const existingFileInputs = document.querySelectorAll('input[type="file"]');
        existingFileInputs.forEach(input => {
            if (!input.id.startsWith('enhanced-file-input-')) {
                console.log('🗑️ Removing conflicting file input:', input.id || 'unnamed');
                input.remove();
            }
        });

        // Find and disable any existing click handlers on select buttons
        const selectButtons = document.querySelectorAll('.select-image-btn');
        selectButtons.forEach((btn, index) => {
            // Clone and replace the button to remove existing event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            console.log(`🔄 Cleaned select button ${index + 1}`);
        });

        console.log('✅ Existing upload handlers disabled');
    }

    setupImageSlot(slot, index) {
        console.log(`🔧 Setting up enhanced upload for slot ${index}`);

        // Re-query the select button since it might have been replaced
        const selectBtn = slot.querySelector('.select-image-btn');
        const removeBtn = slot.querySelector('.remove-image-btn');
        const actions = slot.querySelector('.image-actions');

        if (!selectBtn) {
            console.warn(`⚠️ No select button found for slot ${index}`);
            return;
        }

        // Remove any existing file inputs to avoid conflicts
        const existingInputs = slot.querySelectorAll('input[type="file"]');
        existingInputs.forEach(input => {
            console.log(`🗑️ Removing existing file input from slot ${index}`);
            input.remove();
        });

        // Create hidden file input for this slot
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = `enhanced-file-input-${index}`;
        slot.appendChild(fileInput);

        console.log(`✅ Created enhanced file input for slot ${index}`);

        // Enhanced select button click
        selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`🎯 Enhanced select button clicked for slot ${index}`);
            fileInput.click();
        });

        // File selection with enhanced processing
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) {
                console.log(`⚠️ No file selected for slot ${index}`);
                return;
            }

            console.log(`📁 File selected for slot ${index}:`, {
                name: file.name,
                size: this.formatBytes(file.size),
                type: file.type
            });

            try {
                // Show loading state
                this.showLoadingState(slot, file.name);

                console.log(`🚀 Starting upload process for slot ${index}...`);

                // Upload using advanced service
                const result = await this.imageUploadService.uploadImage(file);

                if (result.success) {
                    // Log compression results for debugging
                    console.log(`🖼️ Image ${index + 1} uploaded successfully:`, {
                        originalSize: this.formatBytes(result.data.originalSize),
                        processedSize: this.formatBytes(result.data.processedSize),
                        compressionRatio: result.data.compressionRatio + '%',
                        wasProcessed: result.data.wasProcessed
                    });

                    // Store the uploaded image data
                    this.uploadedImages[index] = {
                        url: result.data.url,
                        path: result.data.path,
                        originalName: result.data.originalName,
                        processedName: result.data.processedName,
                        originalSize: result.data.originalSize,
                        processedSize: result.data.processedSize,
                        wasProcessed: result.data.wasProcessed,
                        compressionRatio: result.data.compressionRatio,
                        spaceSaved: result.data.spaceSaved
                    };

                    // Update UI with compression stats
                    this.updateImageSlot(slot, result.data.url, result.data.originalName, result.data);

                    // Update counter
                    this.updateImageCounter();

                    console.log(`✅ Image ${index + 1} uploaded successfully:`, result.data);
                } else {
                    console.error(`❌ Failed to upload image ${index + 1}:`, result.error);
                    this.showError(slot, result.error);

                    // Clear any uploaded images from this slot
                    if (this.uploadedImages[index]) {
                        try {
                            await this.imageUploadService.deleteImage(this.uploadedImages[index].path);
                        } catch (deleteError) {
                            console.warn('Could not delete failed upload:', deleteError);
                        }
                        delete this.uploadedImages[index];
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing image ${index + 1}:`, error);
                this.showError(slot, error.message);
            }
        });

        // Enhanced remove functionality
        if (removeBtn) {
            removeBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                const imageData = this.uploadedImages[index];
                if (imageData) {
                    // Delete from Supabase
                    try {
                        await this.imageUploadService.deleteImage(imageData.path);
                        console.log(`🗑️ Deleted image from storage: ${imageData.path}`);
                    } catch (deleteError) {
                        console.warn(`⚠️ Could not delete image from storage:`, deleteError);
                    }

                    // Remove from our array
                    delete this.uploadedImages[index];
                }

                // Reset slot
                this.resetImageSlot(slot);

                // Update counter
                this.updateImageCounter();
            });
        }
    }

    showLoadingState(slot, fileName) {
        const content = slot.querySelector('.text-center');
        if (content) {
            content.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-2"></div>
                    <p class="text-sm text-yellow-700">جاري رفع ${fileName}...</p>
                    <p class="text-xs text-yellow-600">قد يستغرق الأمر بضع ثوانٍ</p>
                </div>
            `;
        }
    }

    updateImageSlot(slot, imageUrl, originalName, imageData = null) {
        const content = slot.querySelector('.text-center');
        const actions = slot.querySelector('.image-actions');

        if (content) {
            // Show compression stats if available
            let compressionInfo = '';
            if (imageData && imageData.wasProcessed) {
                const savedMB = (imageData.spaceSaved / (1024 * 1024)).toFixed(2);
                compressionInfo = `
                    <div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        💾 وفرت ${savedMB}MB (${imageData.compressionRatio}%)
                    </div>
                `;
            }

            content.innerHTML = `
                <div class="relative w-full h-full">
                    <img src="${imageUrl}" alt="${originalName}" class="w-full h-48 object-cover rounded-lg">
                    ${compressionInfo}
                    <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        ${originalName}
                    </div>
                    <div class="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        ${imageData ? this.formatBytes(imageData.processedSize) : 'مرفوعة'}
                    </div>
                </div>
            `;
        }

        // Show actions
        if (actions) {
            actions.classList.remove('hidden');
        }

        // Update border to indicate uploaded
        slot.classList.remove('border-dashed', 'border-yellow-400', 'bg-yellow-50');
        slot.classList.add('border-solid', 'border-green-400', 'bg-green-50');
    }

    resetImageSlot(slot) {
        const content = slot.querySelector('.text-center');
        const actions = slot.querySelector('.image-actions');
        const isRequired = slot.dataset.required === 'true';

        if (content) {
            content.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p class="text-sm font-medium text-yellow-700">الصورة ${isRequired ? 'الرئيسية' : 'الإضافية'}</p>
                ${isRequired ? '<p class="text-xs text-yellow-600">إلزامية</p>' : '<p class="text-xs text-yellow-600">اختيارية</p>'}
            `;
        }

        // Hide actions
        if (actions) {
            actions.classList.add('hidden');
        }

        // Reset border
        slot.classList.remove('border-solid', 'border-green-400', 'bg-green-50');
        slot.classList.add('border-dashed', 'border-yellow-400', 'bg-yellow-50');
    }

    showError(slot, errorMessage) {
        const content = slot.querySelector('.text-center');
        if (content) {
            content.innerHTML = `
                <div class="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm font-medium text-red-700">فشل في رفع الصورة</p>
                    <p class="text-xs text-red-600">${errorMessage}</p>
                    <button type="button" class="select-image-btn bg-red-500 text-white text-xs px-3 py-1 rounded mt-2 hover:bg-red-600 transition-colors">
                        إعادة المحاولة
                    </button>
                </div>
            `;
        }
    }

    updateImageCounter() {
        const counter = document.getElementById('image-counter');
        if (counter) {
            const uploadedCount = this.uploadedImages.filter(img => img).length;
            counter.textContent = `${uploadedCount}/${this.maxImages}`;

            // Update color based on count
            if (uploadedCount === 0) {
                counter.className = 'text-sm font-semibold text-gray-500';
            } else if (uploadedCount >= 1) {
                counter.className = 'text-sm font-semibold text-green-500';
            }
        }

        // Update compression summary
        this.updateCompressionSummary();
    }

    updateCompressionSummary() {
        const uploadedImages = this.uploadedImages.filter(img => img);
        const summaryElement = document.getElementById('compression-summary');

        if (uploadedImages.length > 0) {
            const totalOriginalSize = uploadedImages.reduce((sum, img) => sum + img.originalSize, 0);
            const totalProcessedSize = uploadedImages.reduce((sum, img) => sum + img.processedSize, 0);
            const totalSpaceSaved = totalOriginalSize - totalProcessedSize;
            const averageCompression = uploadedImages.reduce((sum, img) => sum + parseFloat(img.compressionRatio), 0) / uploadedImages.length;

            const summaryHTML = `
                <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-blue-800 mb-2">📊 إحصائيات الضغط الإجمالية</h4>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>الحجم الأصلي: <strong>${this.formatBytes(totalOriginalSize)}</strong></div>
                        <div>الحجم بعد الضغط: <strong>${this.formatBytes(totalProcessedSize)}</strong></div>
                        <div>المساحة الموفرة: <strong class="text-green-600">${this.formatBytes(totalSpaceSaved)}</strong></div>
                        <div>متوسط الضغط: <strong class="text-green-600">${averageCompression.toFixed(1)}%</strong></div>
                    </div>
                </div>
            `;

            if (summaryElement) {
                summaryElement.innerHTML = summaryHTML;
            } else {
                // Create summary element if it doesn't exist
                const container = document.querySelector('.mb-8');
                if (container) {
                    const newSummary = document.createElement('div');
                    newSummary.id = 'compression-summary';
                    newSummary.innerHTML = summaryHTML;
                    container.appendChild(newSummary);
                }
            }
        } else if (summaryElement) {
            summaryElement.innerHTML = '';
        }
    }

    overrideFormSubmission() {
        const form = document.getElementById('product-request-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            // Check if we have uploaded images
            const uploadedImages = this.uploadedImages.filter(img => img);
            if (uploadedImages.length > 0) {
                console.log('📤 Using enhanced uploaded images:', uploadedImages);

                // You can modify the form submission here to use the uploaded image URLs
                // For example, add hidden inputs with the image URLs

                uploadedImages.forEach((image, index) => {
                    // Add hidden input with image URL
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = `uploaded_image_${index}`;
                    hiddenInput.value = JSON.stringify(image);
                    form.appendChild(hiddenInput);
                });

                // Continue with normal form submission
                return true;
            }

            // If no enhanced uploads, continue with original functionality
            return true;
        });
    }

    // Method to get all uploaded images data
    getUploadedImages() {
        return this.uploadedImages.filter(img => img);
    }

    // Method to check if required images are uploaded
    hasRequiredImages() {
        const mainSlot = document.querySelector('.image-slot[data-required="true"]');
        if (!mainSlot) return true; // No required images

        const mainIndex = Array.from(document.querySelectorAll('.image-slot')).indexOf(mainSlot);
        return this.uploadedImages[mainIndex] !== undefined;
    }

    // Method to clear all uploaded images
    async clearAllImages() {
        for (let i = 0; i < this.uploadedImages.length; i++) {
            const imageData = this.uploadedImages[i];
            if (imageData) {
                try {
                    await this.imageUploadService.deleteImage(imageData.path);
                } catch (error) {
                    console.warn(`Could not delete image ${i}:`, error);
                }
            }
        }

        this.uploadedImages = [];

        // Reset all slots
        const imageSlots = document.querySelectorAll('.image-slot');
        imageSlots.forEach(slot => this.resetImageSlot(slot));

        this.updateImageCounter();
    }
    // Utility function to format bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Test function to verify the integration is working
    testIntegration() {
        console.log('🧪 Testing enhanced image upload integration...');

        if (!this.isInitialized) {
            console.error('❌ Integration not initialized');
            return false;
        }

        if (!this.imageUploadService) {
            console.error('❌ Image upload service not available');
            return false;
        }

        const imageSlots = document.querySelectorAll('.image-slot');
        console.log(`📊 Found ${imageSlots.length} image slots`);

        const enhancedInputs = document.querySelectorAll('input[id^="enhanced-file-input-"]');
        console.log(`📊 Found ${enhancedInputs.length} enhanced file inputs`);

        console.log('✅ Integration test completed');
        return true;
    }
}

// Make it globally available
window.EnhancedImageUploadIntegration = EnhancedImageUploadIntegration;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedImageUploadIntegration = new EnhancedImageUploadIntegration();
    window.enhancedImageUploadIntegration.initialize();
});
