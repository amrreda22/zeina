
        let governorateFilter;

        document.addEventListener('DOMContentLoaded', function() {
            // Initialize governorate filter
            governorateFilter = new GovernorateFilter('product-governorate-container', {
                placeholder: 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ù…ØªÙˆÙØ±Ø©',
                multiple: true
            });
            
            // Add styles for governorate display
            GovernorateDisplay.addStyles();
            
            // Initialize cities filter
            initializeCitiesFilter();
            
            // Initialize color filter
            initializeColorFilter();
        });

        // Initialize color filter functionality
        function initializeColorFilter() {
            const colorButtons = document.querySelectorAll('.color-option-simple');
            const selectedColorsDiv = document.getElementById('selected-colors-simple');
            let selectedColors = [];

            function updateSelectedColorsDisplay() {
                if (!selectedColorsDiv) return;
                selectedColorsDiv.innerHTML = '';
                selectedColors.forEach(color => {
                    const tag = document.createElement('span');
                    tag.className = 'selected-tag';
                    tag.innerHTML = getColorLabel(color) +
                        `<button type="button" class="remove-tag" data-color="${color}">Ã—</button>`;
                    selectedColorsDiv.appendChild(tag);
                });
            }

            function getColorLabel(color) {
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
                    updateSelectedColorsDisplay();
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
                        updateSelectedColorsDisplay();
                    }
                });
            }
        }

        // Mobile menu functionality
        document.getElementById('mobile-menu-btn').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Image upload functionality
        const uploadArea = document.getElementById('upload-area');
        const imageUpload = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const uploadedImages = [];

        // Click to upload
        uploadArea.addEventListener('click', () => {
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
            const files = e.dataTransfer.files;
            handleFiles(files);
        });

        // File input change
        imageUpload.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        // Drag and drop variables
        let draggedElement = null;
        let draggedIndex = null;

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
                const allImages = Array.from(imagePreview.querySelectorAll('.sortable-image'));
                const draggedDOM = allImages[draggedIndex];
                
                if (draggedIndex < dropIndex) {
                    imagePreview.insertBefore(draggedDOM, allImages[dropIndex].nextSibling);
                } else {
                    imagePreview.insertBefore(draggedDOM, allImages[dropIndex]);
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
                ØªÙ… ØªØºÙŠÙŠØ± ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ± Ø¨Ù†Ø¬Ø§Ø­
            `;
            
            document.body.appendChild(message);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                message.remove();
            }, 3000);
        }

        function updateImageOrder() {
            const imageItems = imagePreview.querySelectorAll('.sortable-image');
            imageItems.forEach((item, index) => {
                item.setAttribute('data-index', index);
                const numberElement = item.querySelector('.image-number');
                if (numberElement) {
                    numberElement.textContent = index + 1;
                }
            });
        }

        function handleFiles(files) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        addImagePreview(e.target.result, file.name);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        function addImagePreview(src, name) {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item sortable-image';
            imageItem.draggable = true;
            imageItem.setAttribute('data-index', uploadedImages.length);
            
            imageItem.innerHTML = `
                <div class="image-drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                </div>
                <img src="${src}" alt="${name}">
                <div class="image-number">${uploadedImages.length + 1}</div>
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
            
            imagePreview.appendChild(imageItem);
            uploadedImages.push({ src, name });
            
            // Hide instructions after first image
            const instructions = document.querySelector('.image-sort-instructions');
            if (instructions) {
                instructions.style.display = 'none';
            }
        }

        function removeImage(button) {
            const imageItem = button.parentElement;
            const index = Array.from(imagePreview.children).indexOf(imageItem);
            uploadedImages.splice(index, 1);
            imageItem.remove();
            
            // Update image numbers and data-index attributes
            updateImageOrder();
            
            // Show instructions if no images left
            if (uploadedImages.length === 0) {
                const instructions = document.querySelector('.image-sort-instructions');
                if (instructions) {
                    instructions.style.display = 'block';
                }
            }
        }

        // Form submission
        document.getElementById('add-product-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Check if ProductService is available before proceeding
            if (!window.ProductService) {
                console.error('âŒ ProductService not available');
                showError('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                return;
            }
            
            // Check if Supabase is available
            if (!window.supabaseClient) {
                console.error('âŒ Supabase not available');
                showError('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª. ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
                return;
            }
            
            // Validate required fields
            const description = document.getElementById('product-description').value.trim();
            const price = document.getElementById('product-price').value;
            const category = document.getElementById('product-category').value;
            
            // Get selected subcategories
            const selectedSubcategories = [];
            const subcategoryCheckboxes = document.querySelectorAll('#subcategory-options input[type="checkbox"]:checked');
            subcategoryCheckboxes.forEach(checkbox => {
                selectedSubcategories.push(checkbox.value);
            });
            
            const selectedGovernorates = governorateFilter.getSelected();
            const whatsapp = document.getElementById('whatsapp').value;
            const facebook = document.getElementById('facebook').value;
            const instagram = document.getElementById('instagram').value;
            
            // Validation
            if (!description) {
                showError('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ÙˆØµÙ Ø§Ù„Ù…Ù†ØªØ¬');
                return;
            }
            
            if (!category) {
                showError('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ');
                return;
            }
            
            // Check if subcategory is required for "other" category
            if (category === 'other' && selectedSubcategories.length === 0) {
                showError('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± ØªØµÙ†ÙŠÙ ÙØ±Ø¹ÙŠ ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }
            
            if (selectedGovernorates.length === 0) {
                showError('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ø­Ø§ÙØ¸Ø© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }
            
            if (!whatsapp) {
                showError('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù‚Ù… Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨');
                return;
            }
            
            if (uploadedImages.length === 0) {
                showError('ÙŠØ±Ø¬Ù‰ Ø±ÙØ¹ ØµÙˆØ±Ø© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            showLoading(submitBtn);
            
                         try {
                 // Check authentication first
                 const { data: { session } } = await window.supabaseClient.auth.getSession();
                 if (!session) {
                     throw new Error('ÙŠØ¬Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬. Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹.');
                 }
 
                 
                 // Get selected cities
                 const selectedCitiesArray = getSelectedCities();
                 
                 // Prepare product data
                 // Get selected colors
                 const selectedColors = [];
                 document.querySelectorAll('.color-option-simple.active').forEach(btn => {
                     selectedColors.push(btn.dataset.color);
                 });
                 
                 console.log('ðŸ” Selected colors:', selectedColors);
                 
                 const productData = {
                     title: description, // Use description as title
                     description: description,
                     price: price || null,
                     category: category,
                     subcategory: selectedSubcategories.length > 0 ? selectedSubcategories : null,
                     governorate: selectedGovernorates.join(', '),
                     cities: selectedCitiesArray.length > 0 ? selectedCitiesArray.join(', ') : null,
                     whatsapp: whatsapp,
                     facebook: facebook || null,
                     instagram: instagram || null,
                     colors: selectedColors.length > 0 ? selectedColors.join(', ') : null,
                     user_id: session.user.id
                 };
                 
                 console.log('ðŸ” Product data with colors:', productData);
                 
                 // Convert uploaded images to File objects
                 const imageFiles = [];
                 for (let i = 0; i < uploadedImages.length; i++) {
                     const response = await fetch(uploadedImages[i].src);
                     const blob = await response.blob();
                     const file = new File([blob], uploadedImages[i].name, { type: blob.type });
                     imageFiles.push(file);
                 }
                
                // Wait for ProductService to be available
                const productService = await waitForProductService();
                if (!productService) {
                    throw new Error('ProductService ØºÙŠØ± Ù…ØªØ§Ø­');
                }
                
                // Add product to database
                const result = await productService.addProduct(productData, imageFiles);
                
                if (result.success) {
                    document.getElementById('success-modal').classList.remove('hidden');
                    
                    // Clear form
                    document.getElementById('add-product-form').reset();
                    document.getElementById('subcategory-group').style.display = 'none';
                    document.getElementById('cities-group').style.display = 'none';
                    document.getElementById('color-filter-section').style.display = 'none';
                    uploadedImages.length = 0;
                    document.getElementById('image-preview').innerHTML = '';
                    
                    // Clear selected colors
                    document.querySelectorAll('.color-option-simple').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.getElementById('selected-colors-simple').innerHTML = '';
                    
                    // Clear cities filter
                    selectedCities.clear();
                    updateCitiesDisplay();
                } else {
                    submitBtn.innerHTML = originalText;
                    showError(result.error || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬');
                }
            } catch (error) {
                submitBtn.innerHTML = originalText;
                showError('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬');
                console.error('Error:', error);
            }
        });

        function closeSuccessModal() {
            document.getElementById('success-modal').classList.add('hidden');
            
            // Ø¥Ø¸Ù‡Ø§Ø± Ø±Ø³Ø§Ù„Ø© ØªØ£ÙƒÙŠØ¯
            const confirmMessage = document.createElement('div');
            confirmMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            confirmMessage.innerHTML = `
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬ Ø¨Ù†Ø¬Ø§Ø­! ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬ Ø¢Ø®Ø±
                </div>
            `;
            document.body.appendChild(confirmMessage);
            
            // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø¨Ø¹Ø¯ 3 Ø«ÙˆØ§Ù†
            setTimeout(() => {
                confirmMessage.remove();
            }, 3000);
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ù„ÙŠÙƒÙˆÙ† Ø¬Ø§Ù‡Ø²Ø§Ù‹ Ù„Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬ Ø¬Ø¯ÙŠØ¯
            document.getElementById('add-product-form').reset();
            document.getElementById('subcategory-group').style.display = 'none';
            document.getElementById('cities-group').style.display = 'none';
            uploadedImages.length = 0;
            document.getElementById('image-preview').innerHTML = '';
            
            // Clear cities filter
            selectedCities.clear();
            updateCitiesDisplay();
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø´Ø±ÙŠØ· Ø§Ù„ØªÙ‚Ø¯Ù…
            updateProgress(1);
            
            // Ø¥Ø¹Ø§Ø¯Ø© ØªÙØ¹ÙŠÙ„ Ø²Ø± Ø§Ù„Ø¥Ø±Ø³Ø§Ù„
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬';
            }
        }

        // Progress bar update
        function updateProgress(currentStep) {
            const progress = (currentStep / 3) * 100;
            document.getElementById('progress-fill').style.width = progress + '%';
            document.getElementById('progress-text').textContent = currentStep + ' Ù…Ù† 3';
        }

        // Subcategory management - Updated to match category page filters
        const subcategories = {
            'koshat': [
                { value: 'koshat-wedding', label: 'ÙƒÙˆØ´Ø§Øª Ø²ÙØ§Ù' },
                { value: 'koshat-engagement', label: 'ÙƒÙˆØ´Ø§Øª Ø®Ø·ÙˆØ¨Ø©' }
            ],
            'mirr': [
                { value: 'mirr-wedding', label: 'Ù…Ø±Ø§ÙŠØ§ Ø²ÙØ§Ù' },
                { value: 'mirr-engagement', label: 'Ù…Ø±Ø§ÙŠØ§ Ø®Ø·ÙˆØ¨Ø©' },
                { value: 'mirr-decorative', label: 'Ù…Ø±Ø§ÙŠØ§ Ø¯ÙŠÙƒÙˆØ±' }
            ],
            'cake': [
                { value: 'cake-wedding', label: 'ØªÙˆØ±ØªØ© Ø²ÙØ§Ù' },
                { value: 'cake-engagement', label: 'ØªÙˆØ±ØªØ© Ø®Ø·ÙˆØ¨Ø©' },
                { value: 'cake-birthday', label: 'ØªÙˆØ±ØªØ© Ø¹ÙŠØ¯ Ù…ÙŠÙ„Ø§Ø¯' },
                { value: 'cake-chocolate', label: 'ØªÙˆØ±ØªØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©' },
                { value: 'cake-fruit', label: 'ØªÙˆØ±ØªØ© ÙÙˆØ§ÙƒÙ‡' },
                { value: 'cake-chocolate-tray', label: 'ØµÙŠÙ†ÙŠØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©' }
            ],
            'other': [
                { value: 'other-birthday', label: 'Ø¯ÙŠÙƒÙˆØ± Ø¹ÙŠØ¯ Ù…ÙŠÙ„Ø§Ø¯' },
                { value: 'other-hospital', label: 'Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ù…ÙˆÙ„ÙˆØ¯ Ø¨Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰' },
                { value: 'other-bride', label: 'Ø¯ÙŠÙƒÙˆØ± Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø¹Ø±ÙˆØ³Ø©' },
                { value: 'other-party', label: 'Ø¯ÙŠÙƒÙˆØ± Ø­ÙÙ„Ø§Øª Ø¨Ø³ÙŠØ·Ø©' }
            ],
            'invitations': [
                { value: 'invitation-wedding', label: 'Ø¯Ø¹ÙˆØ© Ø²ÙØ§Ù' },
                { value: 'invitation-engagement', label: 'Ø¯Ø¹ÙˆØ© Ø®Ø·ÙˆØ¨Ø©' },
                { value: 'invitation-wedding-distribution', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª ÙØ±Ø­' },
                { value: 'invitation-engagement-distribution', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø®Ø·ÙˆØ¨Ø©' },
                { value: 'invitation-chocolate', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø¨Ø§Ù„Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©' },
                { value: 'invitation-perfumed', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø¨Ø§Ù„Ø¹Ø·ÙˆØ± / Ø§Ù„Ø¨Ø±ÙØ§Ù†' },
                { value: 'invitation-gift', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ù…Ø¹ Ù‡Ø¯ÙŠØ© ØµØºÙŠØ±Ù‡' },
                { value: 'invitation-baby-week', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø³Ø¨ÙˆØ¹' },
                { value: 'invitation-kids', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø£Ø·ÙØ§Ù„' },
                { value: 'invitation-flowers', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª ÙˆØ±Ø¯' },
                { value: 'invitation-candles', label: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ø´Ù…ÙˆØ¹' },
                { value: 'invitation-digital', label: 'Ø¯Ø¹ÙˆØ© Ø±Ù‚Ù…ÙŠØ©' }
            ],
            'flowerbouquets': [
                { value: 'flowerbouquets-natural', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø·Ø¨ÙŠØ¹ÙŠØ©' },
                { value: 'flowerbouquets-artificial', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª ØµÙ†Ø§Ø¹ÙŠØ©' },
                { value: 'flowerbouquets-stand', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ø§Ø³ØªØ§Ù†Ø¯' },
                { value: 'flowerbouquets-dried', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ù…Ø¬ÙÙØ©' },
                { value: 'flowerbouquets-arranged', label: 'Ø¨ÙˆÙƒÙŠÙ‡Ø§Øª Ù…Ø´ÙƒÙ„Ø©' }
            ]
        };

        // Handle category change
        document.getElementById('product-category').addEventListener('change', function() {
            console.log('ðŸ”„ Category changed to:', this.value);
            
            const selectedCategory = this.value;
            const subcategoryGroup = document.getElementById('subcategory-group');
            const subcategoryOptions = document.getElementById('subcategory-options');
            const colorFilterSection = document.getElementById('color-filter-section');
            
            console.log('ðŸ” Found elements:', {
                subcategoryGroup: !!subcategoryGroup,
                subcategoryOptions: !!subcategoryOptions,
                colorFilterSection: !!colorFilterSection
            });
            
            // Clear subcategory options
            subcategoryOptions.innerHTML = '';
            
            if (selectedCategory && subcategories[selectedCategory]) {
                console.log('âœ… Adding subcategories for:', selectedCategory);
                console.log('ðŸ“‹ Available subcategories:', subcategories[selectedCategory]);
                
                // Add subcategory options as checkboxes
                subcategories[selectedCategory].forEach(sub => {
                    console.log('âž• Adding subcategory:', sub.label);
                    
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
                console.log('ðŸ‘ï¸ Subcategory group is now visible');
            } else {
                // Hide subcategory group
                subcategoryGroup.style.display = 'none';
                console.log('ðŸ™ˆ Subcategory group is now hidden');
            }
            
            // Show/hide color filter for flowerbouquets
            if (selectedCategory === 'flowerbouquets') {
                colorFilterSection.style.display = 'block';
                console.log('ðŸŽ¨ Color filter is now visible');
            } else {
                colorFilterSection.style.display = 'none';
                console.log('ðŸ™ˆ Color filter is now hidden');
                // Clear selected colors
                document.querySelectorAll('.color-option-simple').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.getElementById('selected-colors-simple').innerHTML = '';
            }
        });

        // Helper functions for UI
        function showError(message) {
            // Create error notification
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            
            // Remove after 3 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
        }

        function showLoading(button) {
            button.innerHTML = `
                <svg class="animate-spin h-5 w-5 inline ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ø¶Ø§ÙØ©...
            `;
            button.disabled = true;
        }

        // Update progress on form interaction
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('input', () => {
                const filledFields = document.querySelectorAll('input[required]:not([value=""]), textarea[required]:not([value=""]), select[required]:not([value=""])').length;
                updateProgress(Math.min(filledFields, 3));
            });
        });
        
        // Final check when page is fully loaded
        window.addEventListener('load', function() {
            console.log('ðŸš€ Page fully loaded');
            console.log('ðŸ” Final service check:', {
                'Supabase': typeof window.supabaseClient !== 'undefined',
                'ProductService': typeof window.ProductService !== 'undefined',
                'ProductService.addProduct': typeof window.ProductService?.addProduct,
                'ProductService.supabase': typeof window.ProductService?.supabase
            });
            
            // Run comprehensive service check
            const servicesStatus = checkRequiredServices();
            console.log('ðŸ“Š Comprehensive service status:', servicesStatus);
        });

        // Cities Filter Variables
        let citiesService;
        let selectedCities = new Set();
        let currentGovernorates = [];

        // Initialize Cities Filter
        function initializeCitiesFilter() {
            // Initialize CitiesService
            citiesService = new CitiesService();
            
            // Setup cities filter functionality
            setupCitiesFilter();
            
            // Listen for governorate changes
            listenForGovernorateChanges();
        }

        // Setup Cities Filter
        function setupCitiesFilter() {
            const citiesTrigger = document.getElementById('cities-trigger');
            const citiesDropdown = document.getElementById('cities-dropdown');
            const citiesSearch = document.getElementById('cities-search');
            const selectAllCitiesBtn = document.getElementById('select-all-cities-btn');
            const clearAllCitiesBtn = document.getElementById('clear-all-cities-btn');
            const applyCitiesFilterBtn = document.getElementById('apply-cities-filter');

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

        // Listen for Governorate Changes
        function listenForGovernorateChanges() {
            // Create a MutationObserver to watch for changes in the governorate filter
            const governorateContainer = document.getElementById('product-governorate-container');
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        // Check if governorates have changed
                        const selectedGovernorates = governorateFilter.getSelected();
                        if (JSON.stringify(selectedGovernorates) !== JSON.stringify(currentGovernorates)) {
                            currentGovernorates = [...selectedGovernorates];
                            updateCitiesFilter(selectedGovernorates);
                        }
                    }
                });
            });

            observer.observe(governorateContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });

            // Also listen for the governorate filter's onChange event
            governorateFilter.onChange = function(selectedGovernorates) {
                currentGovernorates = [...selectedGovernorates];
                updateCitiesFilter(selectedGovernorates);
            };
        }

        // Update Cities Filter based on selected governorates
        function updateCitiesFilter(selectedGovernorates) {
            const citiesGroup = document.getElementById('cities-group');
            const citiesList = document.getElementById('cities-list');
            const citiesTrigger = document.getElementById('cities-trigger');
            const citiesSearch = document.getElementById('cities-search');

            if (selectedGovernorates.length === 0) {
                // Hide cities filter if no governorates selected
                citiesGroup.style.display = 'none';
                selectedCities.clear();
                updateCitiesDisplay();
                return;
            }

            // Show cities filter
            citiesGroup.style.display = 'block';

            // Get all cities for selected governorates
            let allCities = [];
            selectedGovernorates.forEach(governorate => {
                const cities = citiesService.getCitiesForGovernorate(governorate);
                allCities = allCities.concat(cities);
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
            const selectedCount = document.getElementById('cities-selected-count');
            const selectedCitiesContainer = document.getElementById('selected-cities');
            const triggerText = document.querySelector('#cities-trigger .trigger-text');

            // Update count
            if (selectedCities.size === 0) {
                selectedCount.style.display = 'none';
                triggerText.textContent = 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ù†Ø§Ø·Ù‚/Ø§Ù„Ù…Ø¯Ù† (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)';
            } else {
                selectedCount.style.display = 'inline-block';
                selectedCount.textContent = selectedCities.size;
                triggerText.textContent = `${selectedCities.size} Ù…Ù†Ø·Ù‚Ø© Ù…Ø®ØªØ§Ø±Ø©`;
            }

            // Update selected cities tags
            if (selectedCities.size === 0) {
                selectedCitiesContainer.innerHTML = '';
            } else {
                selectedCitiesContainer.innerHTML = Array.from(selectedCities).map(city => `
                    <div class="selected-city-tag">
                        ${city}
                        <button class="remove-city" onclick="removeCity('${city}')">Ã—</button>
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
    
