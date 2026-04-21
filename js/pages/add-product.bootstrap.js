
        // Wait for ProductService to be loaded
        function waitForProductService() {
            return new Promise((resolve) => {
                if (window.ProductService && window.supabaseClient) {
                    resolve(window.ProductService);
                } else {
                    const checkInterval = setInterval(() => {
                        if (window.ProductService && window.supabaseClient) {
                            clearInterval(checkInterval);
                            resolve(window.ProductService);
                        }
                    }, 100);
                    
                    // Timeout after 5 seconds
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        console.error('âŒ ProductService or Supabase not loaded after 5 seconds');
                        resolve(null);
                    }, 5000);
                }
            });
        }
        
        // Check if all required services are loaded
        function checkRequiredServices() {
            const services = {
                'Supabase': typeof window.supabaseClient !== 'undefined',
                'ProductService': typeof window.ProductService !== 'undefined',
                'ProductService.addProduct': typeof window.ProductService?.addProduct === 'function',
                'ProductService.supabase': typeof window.ProductService?.supabase !== 'undefined'
            };
            
            // Check if all services are available
            const allAvailable = Object.values(services).every(available => available);
            if (!allAvailable) {
                console.error('âŒ Some required services are not available:', services);
            }
            
            return services;
        }
    
