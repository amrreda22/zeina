// مكون فلتر التصنيفات الفرعية المحسن
class SubcategoryFilter {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.selectedSubcategories = new Set();
        this.onChange = options.onChange || (() => {});
        this.multiple = options.multiple !== false; // افتراضي متعدد
        this.placeholder = options.placeholder || 'اختر التصنيفات الفرعية';
        this.subcategories = options.subcategories || [
            'koshat-wedding', 'koshat-engagement', 'koshat-birthday', 'koshat-party', 'koshat-corporate'
        ];
        this.subcategoryLabels = options.subcategoryLabels || {
            'koshat-wedding': 'كوشات زفاف',
            'koshat-engagement': 'كوشات خطوبة',
            'koshat-birthday': 'كوشات عيد ميلاد',
            'koshat-party': 'كوشات حفلات',
            'koshat-corporate': 'كوشات شركات'
        };
        
        this.init();
    }

    init() {
        this.createFilterUI();
        this.bindEvents();
    }

    createFilterUI() {
        const filterHTML = `
            <div class="subcategory-filter-container">
                <div class="filter-header">
                    <div class="filter-trigger" id="subcategory-filter-trigger">
                        <div class="trigger-content">
                            <svg class="category-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/>
                            </svg>
                            <span class="trigger-text">${this.placeholder}</span>
                            <span class="selected-count" id="subcategory-selected-count"></span>
                        </div>
                        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </div>
                </div>
                
                <div class="filter-dropdown" id="subcategory-filter-dropdown">
                    <div class="dropdown-header">
                        <div class="search-container">
                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input type="text" id="subcategory-search" placeholder="ابحث عن تصنيف..." class="search-input">
                        </div>
                        <div class="actions">
                            <button type="button" id="subcategory-select-all-btn" class="action-btn">تحديد الكل</button>
                            <button type="button" id="subcategory-clear-all-btn" class="action-btn">إلغاء الكل</button>
                        </div>
                    </div>
                    
                    <div class="subcategories-list" id="subcategories-list">
                        ${this.subcategories.map(subcategory => `
                            <div class="subcategory-item" data-subcategory="${subcategory}">
                                <label class="subcategory-checkbox">
                                    <input type="checkbox" value="${subcategory}" class="subcategory-input">
                                    <span class="checkmark"></span>
                                    <span class="subcategory-name">${this.subcategoryLabels[subcategory] || subcategory}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="dropdown-footer">
                        <button type="button" id="subcategory-apply-filter" class="apply-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                            تطبيق الفلتر
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = filterHTML;
        this.addStyles();
    }

    addStyles() {
        const styleId = 'subcategory-filter-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                .subcategory-filter-container {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                    font-family: 'Tajawal', sans-serif;
                }

                .filter-header {
                    position: relative;
                }

                .filter-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 48px;
                }

                .filter-trigger:hover {
                    border-color: #d4af37;
                    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.1);
                }

                .filter-trigger.active {
                    border-color: #d4af37;
                    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
                }

                .trigger-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }

                .category-icon {
                    width: 18px;
                    height: 18px;
                    color: #d4af37;
                    flex-shrink: 0;
                }

                .trigger-text {
                    color: #374151;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .selected-count {
                    background: #d4af37;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    min-width: 20px;
                    text-align: center;
                }

                .chevron-icon {
                    width: 16px;
                    height: 16px;
                    color: #6b7280;
                    transition: transform 0.3s ease;
                    flex-shrink: 0;
                }

                .filter-trigger.active .chevron-icon {
                    transform: rotate(180deg);
                }

                .filter-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    margin-top: 4px;
                }

                .filter-dropdown.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .dropdown-header {
                    padding: 16px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .search-container {
                    position: relative;
                    margin-bottom: 12px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 16px;
                    height: 16px;
                    color: #9ca3af;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 12px 10px 36px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.3s ease;
                }

                .search-input:focus {
                    border-color: #d4af37;
                    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
                }

                .actions {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    padding: 6px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    color: #374151;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .action-btn:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }

                .subcategories-list {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .subcategory-item {
                    padding: 0 16px;
                }

                .subcategory-item.hidden {
                    display: none;
                }

                .subcategory-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 0;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    border-radius: 6px;
                    margin: 0 -8px;
                    padding-left: 8px;
                    padding-right: 8px;
                }

                .subcategory-checkbox:hover {
                    background-color: #f9fafb;
                }

                .subcategory-input {
                    display: none;
                }

                .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #d1d5db;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .subcategory-input:checked + .checkmark {
                    background: #d4af37;
                    border-color: #d4af37;
                }

                .subcategory-input:checked + .checkmark::after {
                    content: '';
                    position: absolute;
                    left: 6px;
                    top: 2px;
                    width: 6px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .subcategory-name {
                    color: #374151;
                    font-weight: 500;
                    flex: 1;
                }

                .dropdown-footer {
                    padding: 16px;
                    border-top: 1px solid #f3f4f6;
                    text-align: center;
                }

                .apply-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                    justify-content: center;
                }

                .apply-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
                }

                .apply-btn svg {
                    width: 16px;
                    height: 16px;
                }

                /* Scrollbar Styling */
                .subcategories-list::-webkit-scrollbar {
                    width: 6px;
                }

                .subcategories-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .subcategories-list::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .subcategories-list::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        const trigger = document.getElementById('subcategory-filter-trigger');
        const dropdown = document.getElementById('subcategory-filter-dropdown');
        const searchInput = document.getElementById('subcategory-search');
        const selectAllBtn = document.getElementById('subcategory-select-all-btn');
        const clearAllBtn = document.getElementById('subcategory-clear-all-btn');
        const applyBtn = document.getElementById('subcategory-apply-filter');
        const checkboxes = document.querySelectorAll('.subcategory-input');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            this.filterSubcategories(e.target.value);
        });

        // Select all
        selectAllBtn.addEventListener('click', () => {
            this.selectAll();
        });

        // Clear all
        clearAllBtn.addEventListener('click', () => {
            this.clearAll();
        });

        // Apply filter
        applyBtn.addEventListener('click', () => {
            this.applyFilter();
        });

        // Checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCheckboxChange(e.target);
            });
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        const trigger = document.getElementById('subcategory-filter-trigger');
        const dropdown = document.getElementById('subcategory-filter-dropdown');
        
        if (dropdown.classList.contains('show')) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        const trigger = document.getElementById('subcategory-filter-trigger');
        const dropdown = document.getElementById('subcategory-filter-dropdown');
        
        trigger.classList.add('active');
        dropdown.classList.add('show');
        
        // Focus search input
        setTimeout(() => {
            document.getElementById('subcategory-search').focus();
        }, 100);
    }

    closeDropdown() {
        const trigger = document.getElementById('subcategory-filter-trigger');
        const dropdown = document.getElementById('subcategory-filter-dropdown');
        
        trigger.classList.remove('active');
        dropdown.classList.remove('show');
    }

    filterSubcategories(searchTerm) {
        const items = document.querySelectorAll('.subcategory-item');
        const term = searchTerm.toLowerCase().trim();
        
        items.forEach(item => {
            const subcategoryName = item.querySelector('.subcategory-name').textContent.toLowerCase();
            if (subcategoryName.includes(term)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    selectAll() {
        const checkboxes = document.querySelectorAll('.subcategory-input:not(.hidden)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedSubcategories.add(checkbox.value);
        });
        this.updateTriggerText();
    }

    clearAll() {
        const checkboxes = document.querySelectorAll('.subcategory-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.selectedSubcategories.clear();
        this.updateTriggerText();
    }

    handleCheckboxChange(checkbox) {
        if (checkbox.checked) {
            this.selectedSubcategories.add(checkbox.value);
        } else {
            this.selectedSubcategories.delete(checkbox.value);
        }
        this.updateTriggerText();
    }

    updateTriggerText() {
        const triggerText = document.querySelector('.trigger-text');
        const selectedCount = document.getElementById('subcategory-selected-count');
        
        if (this.selectedSubcategories.size === 0) {
            triggerText.textContent = this.placeholder;
            selectedCount.style.display = 'none';
        } else if (this.selectedSubcategories.size === 1) {
            const selected = Array.from(this.selectedSubcategories)[0];
            triggerText.textContent = this.subcategoryLabels[selected] || selected;
            selectedCount.style.display = 'none';
        } else {
            triggerText.textContent = `${this.selectedSubcategories.size} تصنيف مختار`;
            selectedCount.textContent = this.selectedSubcategories.size;
            selectedCount.style.display = 'inline-block';
        }
    }

    applyFilter() {
        this.closeDropdown();
        this.onChange(Array.from(this.selectedSubcategories));
    }

    // Public methods
    getSelected() {
        return Array.from(this.selectedSubcategories);
    }

    setSelected(subcategories) {
        this.selectedSubcategories.clear();
        subcategories.forEach(sub => this.selectedSubcategories.add(sub));
        
        // Update checkboxes
        const checkboxes = document.querySelectorAll('.subcategory-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.selectedSubcategories.has(checkbox.value);
        });
        
        this.updateTriggerText();
    }

    clear() {
        this.clearAll();
        this.onChange([]);
    }
} 