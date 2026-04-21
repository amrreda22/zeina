/* events module for mirr */

function updateSelectedCities() {
            const selected = [];
            const checkboxes = document.querySelectorAll('.city-checkbox');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    selected.push(checkbox.value);
                }
            });
            activeFilters.cities = selected;
            displaySelectedCities();
        }

function updateCitiesPlaceholder() {
            const placeholder = document.getElementById('cities-placeholder');
            if (activeFilters.cities.length === 0) {
                placeholder.textContent = 'اختر المدن/المناطق';
            } else if (activeFilters.cities.length === 1) {
                placeholder.textContent = activeFilters.cities[0];
            } else {
                placeholder.textContent = `${activeFilters.cities.length} مدينة مختارة`;
            }
        }

function displayPagination(totalProducts) {
            const totalPages = Math.ceil(totalProducts / productsPerPage);
            const paginationContainer = document.getElementById('pagination-container');
            console.log('displayPagination:', { totalProducts, totalPages, currentPage, productsPerPage });
            
            if (totalPages <= 1) {
                paginationContainer.classList.add('hidden');
                return;
            }
            
            paginationContainer.classList.remove('hidden');
            
            let paginationHTML = '<div class="flex items-center justify-center space-x-2 space-x-reverse">';
            
            // زر السابق
            if (currentPage > 1) {
                paginationHTML += `<a href="?page=${currentPage - 1}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">السابق</a>`;
            } else {
                paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">السابق</span>`;
            }
            
            // أرقام الصفحات
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            if (startPage > 1) {
                paginationHTML += `<a href="?page=1" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">1</a>`;
                if (startPage > 2) {
                    paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-500">...</span>`;
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-white bg-pink-500 border border-pink-500 rounded-md">${i}</span>`;
                } else {
                    paginationHTML += `<a href="?page=${i}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">${i}</a>`;
                }
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-500">...</span>`;
                }
                paginationHTML += `<a href="?page=${totalPages}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">${totalPages}</a>`;
            }
            
            // زر التالي
            if (currentPage < totalPages) {
                paginationHTML += `<a href="?page=${currentPage + 1}" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700">التالي</a>`;
            } else {
                paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">التالي</span>`;
            }
            
            paginationHTML += '</div>';
            
            // معلومات الصفحة الحالية
            paginationHTML += `
                <div class="text-center mt-4 text-sm text-gray-600">
                    صفحة ${currentPage} من ${totalPages} • عرض ${Math.min((currentPage - 1) * productsPerPage + 1, totalProducts)} - ${Math.min(currentPage * productsPerPage, totalProducts)} من ${totalProducts} منتج
                </div>
            `;
            
            paginationContainer.innerHTML = paginationHTML;
        }

function goToPage(pageNumber) {
            console.log('goToPage called with:', pageNumber);
            currentPage = pageNumber;
            updateURL();
            // تأخير صغير للتأكد من تحديث DOM قبل التمرير
            setTimeout(() => {
                scrollToTop();
            }, 50);
            applyFilters(false);
        }

        // مستمع النقر على الترقيم
        document.addEventListener('click', function(event) {
            if (event.target.matches('#pagination-container a[href*="page="]')) {
                event.preventDefault();
                const href = event.target.getAttribute('href');
                const pageMatch = href.match(/page=(\d+)/);
                if (pageMatch) {
                    const pageNumber = parseInt(pageMatch[1]);
                    console.log('Clicking on page:', pageNumber);
                    goToPage(pageNumber);
                }
            }
        });

        // مستمع تغيير التاريخ
        window.addEventListener('popstate', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const newPage = parseInt(urlParams.get('page')) || 1;
            if (newPage !== currentPage) {
                currentPage = newPage;
                applyFilters(false);
            }
        });

        // تحديث عداد المفضلة

