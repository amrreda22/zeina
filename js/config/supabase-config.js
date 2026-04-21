// Supabase Configuration for Admin Panel
const SUPABASE_URL = 'https://bekzucjtdmesirfjtcip.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla3p1Y2p0ZG1lc2lyZmp0Y2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDU0MTMsImV4cCI6MjA2NTc4MTQxM30.oPvSTjkrnpCRJB8QRE7lw4_XvWl-RhN3todWuDR2O6g';

// Wait for Supabase library to be loaded
function initializeSupabase() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 150; // زيادة عدد المحاولات إلى 15 ثانية
        
        const checkSupabase = () => {
            attempts++;
            
            if (typeof window.supabase !== 'undefined' && window.supabase) {

                try {
                    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    window.supabaseClient = supabase;
                    

                    
                    resolve(supabase);
                } catch (error) {
                    console.error('❌ Error creating Supabase client:', error);
                    resolve(null);
                }
            } else {
                if (attempts % 10 === 0) { // طباعة كل 10 محاولات
                    
                }
                
                if (attempts >= maxAttempts) {
                    console.error('❌ Supabase library not loaded after 15 seconds');
                    console.error('🔍 Debug info:', {
                        windowSupabase: typeof window.supabase,
                        windowSupabaseValue: window.supabase,
                        documentReadyState: document.readyState
                    });
                    resolve(null);
                } else {
                    setTimeout(checkSupabase, 100);
                }
            }
        };
        
        checkSupabase();
    });
}

// Initialize when script loads
initializeSupabase();

// Also initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
});

// Make initialization function globally available
window.initializeSupabase = initializeSupabase; 