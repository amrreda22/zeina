        // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø£Ù…Ø§Ù† - Ø³ÙŠØªÙ… ØªÙ†ÙÙŠØ°Ù‡ Ø¨Ø¹Ø¯ ØªØ­Ù…ÙŠÙ„ adminSecurity
        async function checkAuthOnLoad() {
            // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ Supabase Ø£ÙˆÙ„Ø§Ù‹
            let attempts = 0;
            while (!window.supabaseClient && attempts < 100) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.supabaseClient) {
                console.error('Supabase client not available');
                window.location.href = 'admin-login.html';
                return;
            }
            
            // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    console.log('No user logged in, redirecting to login');
                    window.location.href = 'admin-login.html';
                    return;
                }
                
                // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø³Ø¬Ù„
                console.log('User in dashboard:', user);
                
                // Ø§Ù„Ø³Ù…Ø§Ø­ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙŠÙ† Ø¨Ø§Ù„Ø¯Ø®ÙˆÙ„ (Ù…Ø¤Ù‚ØªØ§Ù‹)
                if (user.email) {
                    console.log('âœ… User authenticated successfully');
                } else {
                    console.log('User not authenticated');
                    window.location.href = 'admin-login.html';
                    return;
                }
                
                console.log('âœ… User authenticated successfully');
                
            } catch (error) {
                console.error('Auth check error:', error);
                window.location.href = 'admin-login.html';
                return;
            }
            
            // Ø¥Ø°Ø§ ÙˆØµÙ„Ù†Ø§ Ù‡Ù†Ø§ØŒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„ ÙˆÙ„Ø¯ÙŠÙ‡ ØµÙ„Ø§Ø­ÙŠØ§Øª
            // Ø§Ù†ØªØ¸Ø§Ø± ØªØ­Ù…ÙŠÙ„ adminSecurity Ù„Ù„ÙˆØ¸Ø§Ø¦Ù Ø§Ù„Ø£Ø®Ø±Ù‰
            while (!window.adminSecurity) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        checkAuthOnLoad();
    
