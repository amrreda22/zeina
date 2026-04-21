// Authentication Service for the application

class AuthService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            // Wait for Supabase client to be available
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
                this.initialized = true;
                // console.log('✅ AuthService: Supabase client already available');
            } else {
                // Wait for initialization
                if (window.initializeSupabase) {
                    this.supabase = await window.initializeSupabase();
                } else {
                    // Fallback: wait for supabaseClient to be set
                    await new Promise((resolve) => {
                        const checkInterval = setInterval(() => {
                            if (window.supabaseClient) {
                                clearInterval(checkInterval);
                                this.supabase = window.supabaseClient;
                                this.initialized = true;
                                resolve();
                            }
                        }, 100);
                        
                        setTimeout(() => {
                            clearInterval(checkInterval);
                            console.error('❌ AuthService: Supabase client not loaded after 10 seconds');
                            resolve();
                        }, 10000);
                    });
                }
            }
            
            if (this.supabase) {
                // AuthService initialized successfully
            } else {
                console.error('❌ AuthService: Failed to initialize Supabase client');
            }
        } catch (error) {
            console.error('❌ AuthService initialization error:', error);
        }
    }

    // Helper method to ensure initialization
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
        return this.supabase !== null;
    }

    // Check if user is logged in
    async isLoggedIn() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return false;
            }

            const { data: { session } } = await this.supabase.auth.getSession();
            return !!session;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return null;
            }

            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Sign out user
    async signOut() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'AuthService not initialized' };
            }

            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                console.error('Sign out error:', error);
                return { success: false, error: error.message };
            }


            return { success: true };
        } catch (error) {
            console.error('Error in signOut:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'AuthService not initialized' };
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Sign in error:', error);
                return { success: false, error: error.message };
            }


            return { success: true, data: data.user };
        } catch (error) {
            console.error('Error in signIn:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign up with email and password
    async signUp(email, password, userData = {}) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return { success: false, error: 'AuthService not initialized' };
            }

            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: userData
                }
            });

            if (error) {
                console.error('Sign up error:', error);
                return { success: false, error: error.message };
            }


            return { success: true, data: data.user };
        } catch (error) {
            console.error('Error in signUp:', error);
            return { success: false, error: error.message };
        }
    }

    // Get session
    async getSession() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return null;
            }

            const { data: { session } } = await this.supabase.auth.getSession();
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    // Listen to auth state changes
    onAuthStateChange(callback) {
        try {
            if (!this.supabase) {
                console.error('❌ Supabase client not available for auth state change');
                return null;
            }

            return this.supabase.auth.onAuthStateChange(callback);
        } catch (error) {
            console.error('Error setting up auth state change listener:', error);
            return null;
        }
    }
}

// Create global instance
window.AuthService = new AuthService();

// Verify that AuthService is properly defined
// console.log('🔧 AuthService initialized:', {
//     instance: window.AuthService,
//     methods: Object.getOwnPropertyNames(Object.getPrototypeOf(window.AuthService)),
//     isLoggedIn: typeof window.AuthService.isLoggedIn,
//     getCurrentUser: typeof window.AuthService.getCurrentUser,
//     signOut: typeof window.AuthService.signOut,
//     supabase: typeof window.AuthService.supabase
// });

// Also create after DOM is loaded for consistency
document.addEventListener('DOMContentLoaded', () => {
    if (!window.AuthService) {
        window.AuthService = new AuthService();
    }
}); 