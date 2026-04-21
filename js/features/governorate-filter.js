// مكون فلتر المحافظات المحسن
class GovernorateFilter {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.selectedGovernorates = new Set();
        this.onChange = options.onChange || (() => {});
        this.multiple = options.multiple !== false; // افتراضي متعدد
        this.placeholder = options.placeholder || 'اختر المحافظات';
        this.governorates = [
            'توصيل لكل المحافظات', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الشرقية', 'الغربية', 'المنوفية',
            'القليوبية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'الدقهلية', 'المنيا',
            'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'بني سويف',
            'الفيوم', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء',
            'البحر الأحمر', 'بورسعيد', 'الإسماعيلية', 'السويس'
        ];
        
        this.init();
    }

    init() {
        this.createFilterUI();
        this.bindEvents();
    }

    createFilterUI() {
        const filterHTML = `
            <div class="governorate-filter-container">
                <div class="filter-header">
                    <div class="filter-trigger" id="filter-trigger">
                        <div class="trigger-content">
                            <svg class="location-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span class="trigger-text">${this.placeholder}</span>
                            <span class="selected-count" id="selected-count"></span>
                        </div>
                        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </div>
                </div>
                
                <div class="filter-dropdown" id="filter-dropdown">
                    <div class="dropdown-header">
                        <div class="search-container">
                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input type="text" id="governorate-search" placeholder="ابحث عن محافظة..." class="search-input">
                        </div>
                        <div class="actions">
                            <button type="button" id="select-all-btn" class="action-btn">تحديد الكل</button>
                            <button type="button" id="clear-all-btn" class="action-btn">إلغاء الكل</button>
                        </div>
                    </div>
                    
                    <div class="governorates-list" id="governorates-list">
                        ${this.governorates.map(governorate => `
                            <div class="governorate-item" data-governorate="${governorate}">
                                <label class="governorate-checkbox">
                                    <input type="checkbox" value="${governorate}" class="governorate-input">
                                    <span class="checkmark"></span>
                                    <span class="governorate-name">${governorate}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="dropdown-footer">
                        <button type="button" id="apply-filter" class="apply-btn">
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
        const styleId = 'governorate-filter-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                .governorate-filter-container {
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
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
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
                    gap: 8px;
                    flex: 1;
                }

                .location-icon {
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

                .governorates-list {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .governorate-item {
                    padding: 0 16px;
                }

                .governorate-item.hidden {
                    display: none;
                }

                .governorate-checkbox {
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

                .governorate-checkbox:hover {
                    background-color: #f9fafb;
                }

                .governorate-input {
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

                .governorate-input:checked + .checkmark {
                    background: #d4af37;
                    border-color: #d4af37;
                }

                .governorate-input:checked + .checkmark::after {
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

                .governorate-name {
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

                /* Responsive Design */
                @media (max-width: 768px) {
                    .governorate-filter-container {
                        max-width: 100%;
                    }
                    
                    .filter-trigger {
                        padding: 10px 12px;
                        min-height: 44px;
                    }
                    
                    .trigger-text {
                        font-size: 14px;
                    }
                    
                    .governorates-list {
                        max-height: 250px;
                    }
                    
                    .actions {
                        flex-direction: column;
                    }
                    
                    .action-btn {
                        text-align: center;
                    }
                }

                @media (max-width: 480px) {
                    .filter-dropdown {
                        position: fixed;
                        top: 50%;
                        left: 16px;
                        right: 16px;
                        transform: translateY(-50%) scale(0.95);
                        max-height: 80vh;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .filter-dropdown.show {
                        transform: translateY(-50%) scale(1);
                    }
                    
                    .governorates-list {
                        flex: 1;
                        overflow-y: auto;
                    }
                }

                /* Scrollbar Styling */
                .governorates-list::-webkit-scrollbar {
                    width: 6px;
                }

                .governorates-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .governorates-list::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .governorates-list::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        const trigger = document.getElementById('filter-trigger');
        const dropdown = document.getElementById('filter-dropdown');
        const searchInput = document.getElementById('governorate-search');
        const selectAllBtn = document.getElementById('select-all-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');
        const applyBtn = document.getElementById('apply-filter');
        const checkboxes = document.querySelectorAll('.governorate-input');

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
            this.filterGovernorates(e.target.value);
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
        const trigger = document.getElementById('filter-trigger');
        const dropdown = document.getElementById('filter-dropdown');
        
        if (dropdown.classList.contains('show')) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        const trigger = document.getElementById('filter-trigger');
        const dropdown = document.getElementById('filter-dropdown');
        
        trigger.classList.add('active');
        dropdown.classList.add('show');
        
        // Focus search input
        setTimeout(() => {
            document.getElementById('governorate-search').focus();
        }, 100);
    }

    closeDropdown() {
        const trigger = document.getElementById('filter-trigger');
        const dropdown = document.getElementById('filter-dropdown');
        
        trigger.classList.remove('active');
        dropdown.classList.remove('show');
    }

    filterGovernorates(searchTerm) {
        const items = document.querySelectorAll('.governorate-item');
        const term = searchTerm.toLowerCase().trim();
        
        items.forEach(item => {
            const governorateName = item.querySelector('.governorate-name').textContent.toLowerCase();
            if (governorateName.includes(term)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    selectAll() {
        const checkboxes = document.querySelectorAll('.governorate-input:not(.hidden)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedGovernorates.add(checkbox.value);
        });
        this.updateTriggerText();
    }

    clearAll() {
        const checkboxes = document.querySelectorAll('.governorate-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.selectedGovernorates.clear();
        this.updateTriggerText();
    }

    handleCheckboxChange(checkbox) {
        if (checkbox.checked) {
            // إذا تم اختيار "توصيل لكل المحافظات"، قم بإلغاء اختيار باقي المحافظات
            if (checkbox.value === 'توصيل لكل المحافظات') {
                this.clearAll();
                this.selectedGovernorates.add('توصيل لكل المحافظات');
                checkbox.checked = true;
            } else {
                // إذا تم اختيار أي محافظة أخرى، قم بإلغاء اختيار "توصيل لكل المحافظات"
                const allGovernoratesCheckbox = document.querySelector('.governorate-input[value="توصيل لكل المحافظات"]');
                if (allGovernoratesCheckbox) {
                    allGovernoratesCheckbox.checked = false;
                    this.selectedGovernorates.delete('توصيل لكل المحافظات');
                }
                this.selectedGovernorates.add(checkbox.value);
            }
        } else {
            this.selectedGovernorates.delete(checkbox.value);
        }
        this.updateTriggerText();
    }

    updateTriggerText() {
        const triggerText = document.querySelector('.trigger-text');
        const selectedCount = document.getElementById('selected-count');
        
        if (this.selectedGovernorates.size === 0) {
            triggerText.textContent = this.placeholder;
            selectedCount.style.display = 'none';
        } else if (this.selectedGovernorates.has('توصيل لكل المحافظات')) {
            triggerText.textContent = 'توصيل لكل المحافظات';
            selectedCount.style.display = 'none';
        } else if (this.selectedGovernorates.size === 1) {
            triggerText.textContent = Array.from(this.selectedGovernorates)[0];
            selectedCount.style.display = 'none';
        } else {
            triggerText.textContent = `${this.selectedGovernorates.size} محافظة مختارة`;
            selectedCount.textContent = this.selectedGovernorates.size;
            selectedCount.style.display = 'inline-block';
        }
    }

    applyFilter() {
        this.closeDropdown();
        this.onChange(Array.from(this.selectedGovernorates));
    }

    // Public methods
    getSelected() {
        return Array.from(this.selectedGovernorates);
    }

    setSelected(governorates) {
        this.selectedGovernorates.clear();
        governorates.forEach(gov => this.selectedGovernorates.add(gov));
        
        // Update checkboxes
        const checkboxes = document.querySelectorAll('.governorate-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.selectedGovernorates.has(checkbox.value);
        });
        
        this.updateTriggerText();
    }

    clear() {
        this.clearAll();
        this.onChange([]);
    }
}

// مكون عرض المحافظات في بطاقات المنتجات
class GovernorateDisplay {
    static createBadge(governorate) {
        if (!governorate) return '';
        
        return `
            <div class="governorate-badge-large">
                <svg class="badge-icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span class="badge-text-large">${governorate}</span>
            </div>
        `;
    }

    static createDetailDisplay(governorate) {
        if (!governorate) return '';
        
        return `
            <div class="governorate-detail">
                <div class="detail-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div class="detail-content">
                    <span class="detail-label">المحافظة:</span>
                    <span class="detail-value">${governorate}</span>
                </div>
            </div>
        `;
    }

    static addStyles() {
        const styleId = 'governorate-display-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                .governorate-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .badge-icon {
                    width: 12px;
                    height: 12px;
                    flex-shrink: 0;
                }

                .badge-text {
                    line-height: 1;
                }

                .governorate-badge-large {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    text-align: center;
                    margin: 4px 0;
                    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
                    transition: all 0.3s ease;
                    width: fit-content;
                }

                .governorate-badge-large:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
                }

                .badge-icon-large {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                .badge-text-large {
                    line-height: 1.2;
                    font-size: 13px;
                    font-weight: 600;
                }

                .governorate-detail {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 0;
                }

                .detail-icon {
                    width: 20px;
                    height: 20px;
                    color: #d4af37;
                    flex-shrink: 0;
                }

                .detail-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .detail-label {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 500;
                }

                .detail-value {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .governorate-badge {
                        font-size: 10px;
                        padding: 3px 6px;
                    }
                    
                    .badge-icon {
                        width: 10px;
                        height: 10px;
                    }

                    .governorate-badge-large {
                        padding: 5px 10px;
                        font-size: 12px;
                        margin: 3px 0;
                    }

                    .badge-icon-large {
                        width: 12px;
                        height: 12px;
                    }

                    .badge-text-large {
                        font-size: 12px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Make GovernorateDisplay available globally
window.GovernorateDisplay = GovernorateDisplay;

// Verify that GovernorateDisplay is properly defined
// console.log('🔧 GovernorateDisplay created:', {
//     instance: window.GovernorateDisplay,
//     methods: Object.getOwnPropertyNames(Object.getPrototypeOf(window.GovernorateDisplay)),
//     createBadge: typeof window.GovernorateDisplay.createBadge,
//     addStyles: typeof window.GovernorateDisplay.addStyles
// }); 