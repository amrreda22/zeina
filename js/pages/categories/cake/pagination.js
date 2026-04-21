/* pagination module for cake */

function initializePaginationFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get('page');
            if (pageParam && !isNaN(pageParam)) {
                currentPage = Math.max(1, parseInt(pageParam));
            } else {
                currentPage = 1;
            }
        }

        // Load products on page load
        document.addEventListener('DOMContentLoaded', async function() {
            // تهيئة الصفحة من URL
            initializePaginationFromURL();
            initializeFiltersFromURL();
            
            
            
            await loadCategoryProducts();
            setupAdvancedFilters();
            setupToggleFilters();
            setupPagination();
            applyFilters();
        });

        // Load products by category

function setupPagination() {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateURL();
                    displayProductsWithPagination();
                    // تأخير صغير للتأكد من تحديث DOM قبل التمرير
                    setTimeout(() => {
                        scrollToTop();
                    }, 50);
                }
            });
            
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateURL();
                    displayProductsWithPagination();
                    // تأخير صغير للتأكد من تحديث DOM قبل التمرير
                    setTimeout(() => {
                        scrollToTop();
                    }, 50);
                }
            });
        }

        // التمرير لأعلى الصفحة - محسنة للأجهزة المحمولة

function scrollToTop() {
            // التمرير الفوري أولاً
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            
            // محاولة التمرير السلس للشاشات الكبيرة
            try {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                // في حالة عدم دعم التمرير السلس، استخدم التمرير العادي
                window.scrollTo(0, 0);
            }
            
            // فحص إضافي مع تأخير للتأكد من النجاح
            setTimeout(() => {
                // التأكد من الوصول لأعلى الصفحة
                if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
                    // إجبار التمرير إذا لم ينجح
                    window.scrollTo(0, 0);
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    
                    // محاولة أخرى بطريقة مختلفة
                    try {
                        document.querySelector('body').scrollIntoView({ 
                            behavior: 'auto', 
                            block: 'start' 
                        });
                    } catch (e) {
                        // محاولة أخيرة
                        window.location.hash = '';
                        window.scrollTo(0, 0);
                    }
                }
            }, 100);
            
            // فحص نهائي بعد فترة أطول للأجهزة البطيئة
            setTimeout(() => {
                if (window.pageYOffset > 50) {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                }
            }, 300);
        }

        // عرض المنتجات مع ترقيم الصفحات

function updatePaginationUI() {
            const container = document.getElementById('pagination-container');
            const pageInfo = document.getElementById('page-info');
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            const pageNumbers = document.getElementById('page-numbers');
            
            // إخفاء ترقيم الصفحات إذا لم توجد منتجات أو صفحة واحدة فقط
            if (totalPages <= 1) {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'flex';
            
            // تحديث معلومات الصفحة
            const startProduct = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
            const endProduct = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);
            pageInfo.textContent = `عرض ${startProduct} - ${endProduct} من ${filteredProducts.length} منتج`;
            
            // تحديث أزرار السابق والتالي
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;
            
            // تحديث أرقام الصفحات
            updatePageNumbers();
        }

        // تحديث أرقام الصفحات

function updatePageNumbers() {
            const pageNumbers = document.getElementById('page-numbers');
            pageNumbers.innerHTML = '';
            
            // حساب نطاق الصفحات المعروضة
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);
            
            // التأكد من عرض 5 صفحات على الأقل إذا كان ذلك ممكناً
            if (endPage - startPage < 4) {
                if (startPage === 1) {
                    endPage = Math.min(totalPages, startPage + 4);
                } else if (endPage === totalPages) {
                    startPage = Math.max(1, endPage - 4);
                }
            }
            
            // إضافة رقم الصفحة الأولى إذا لم تكن في النطاق
            if (startPage > 1) {
                addPageButton(1);
                if (startPage > 2) {
                    pageNumbers.appendChild(createEllipsis());
                }
            }
            
            // إضافة أرقام الصفحات في النطاق
            for (let i = startPage; i <= endPage; i++) {
                addPageButton(i);
            }
            
            // إضافة رقم الصفحة الأخيرة إذا لم تكن في النطاق
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pageNumbers.appendChild(createEllipsis());
                }
                addPageButton(totalPages);
            }
        }

        // إضافة زر رقم صفحة

function addPageButton(pageNum) {
            const pageNumbers = document.getElementById('page-numbers');
            const button = document.createElement('button');
            button.textContent = pageNum;
            button.className = `px-3 py-2 rounded-lg transition-colors ${
                pageNum === currentPage 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
            }`;
            
            button.addEventListener('click', () => {
                if (pageNum !== currentPage) {
                    currentPage = pageNum;
                    updateURL();
                    displayProductsWithPagination();
                    // تأخير صغير للتأكد من تحديث DOM قبل التمرير
                    setTimeout(() => {
                        scrollToTop();
                    }, 50);
                }
            });
            
            pageNumbers.appendChild(button);
        }

        // إنشاء نقاط الحذف

function createEllipsis() {
            const span = document.createElement('span');
            span.textContent = '...';
            span.className = 'px-2 py-2 text-gray-500';
            return span;
        }

        // تحديث عدد المنتجات

