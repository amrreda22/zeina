
        // Check authentication status before loading the page
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                // Wait for ProductService to be loaded
                const productService = await waitForProductService();
                if (!productService) {
                    console.error('ProductService failed to load');
                    showError('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…');
                    return;
                }
                
                // Get current session
                const { data: { session }, error } = await window.supabaseClient.auth.getSession();
                
                if (error) {
                    console.error('Error checking session:', error);
                    redirectToLogin();
                    return;
                }
                
                // If no session, redirect to login
                if (!session) {
                    redirectToLogin();
                    return;
                }
                
                // User is authenticated, show the page content
                document.body.style.display = 'block';
                
                // Check all required services
                const servicesStatus = checkRequiredServices();
                
            } catch (error) {
                console.error('Authentication check failed:', error);
                redirectToLogin();
            }
        });
        
        function redirectToLogin() {
            // Show loading message
            document.body.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                        <p class="text-gray-600 mb-4">Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„...</p>
                        <p class="text-sm text-gray-500">Ø³ÙŠØªÙ… ØªÙˆØ¬ÙŠÙ‡Ùƒ Ù„ØµÙØ­Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„</p>
                    </div>
                </div>
            `;
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                    window.location.href = 'admin-login.html?redirect=add-product';
            }, 2000);
        }
    
