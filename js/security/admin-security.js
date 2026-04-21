// Admin Security System
class AdminSecurity {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        this.setupActivityTracking();
    }

    // التحقق من المصادقة
    async checkAuth() {
        try {
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient غير متاح في checkAuth');
                return false;
            }
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                return false;
            }

            // التحقق من دور المستخدم
            const { data: userProfile, error } = await window.supabaseClient
                .from('users')
                .select('role, status')
                .eq('id', user.id)
                .single();

            if (error || !userProfile) {
                return false;
            }

            // التحقق من أن المستخدم نشط ولديه صلاحيات إدارية
            if (userProfile.status !== 'نشط' || !['admin', 'editor'].includes(userProfile.role)) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    // التوجيه لصفحة تسجيل الدخول
    redirectToLogin() {
        console.log('🔄 التوجيه إلى صفحة تسجيل دخول الإدارة...');
        window.location.href = 'admin-login.html';
    }

    // تسجيل الخروج
    async logout() {
        try {
            console.log('🔄 بدء عملية تسجيل الخروج...');
            
            // التحقق من وجود supabaseClient
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient غير متاح');
                window.location.href = 'admin-login.html';
                return;
            }
            
            await window.supabaseClient.auth.signOut();
            console.log('✅ تم تسجيل الخروج بنجاح من Supabase');
            console.log('🔄 التوجيه إلى صفحة تسجيل دخول الإدارة...');
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('❌ خطأ في تسجيل الخروج:', error);
            console.log('🔄 التوجيه إلى صفحة تسجيل دخول الإدارة رغم الخطأ...');
            window.location.href = 'admin-login.html';
        }
    }

    // إعداد تتبع النشاط
    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            });
        });

        // فحص النشاط كل دقيقة
        setInterval(() => {
            this.checkInactivity();
        }, 60000);
    }

    // فحص عدم النشاط
    checkInactivity() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;

        if (timeSinceLastActivity > this.sessionTimeout) {
            this.logSecurityEvent('session_timeout', { 
                timeout_duration: this.sessionTimeout 
            });
            this.logout();
        }
    }

    // تسجيل الأحداث الأمنية
    async logSecurityEvent(action, details = {}) {
        try {
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient غير متاح في logSecurityEvent');
                return;
            }
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            const logData = {
                user_id: user ? user.id : null,
                email: user ? user.email : 'unknown',
                action: action,
                details: details,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            };

            const { error } = await window.supabaseClient
                .from('admin_logs')
                .insert([logData]);

            if (error) {
                console.error('Error logging security event:', error);
            }
        } catch (error) {
            console.error('Error in logSecurityEvent:', error);
        }
    }

    // الحصول على IP العميل
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // التحقق من قوة كلمة المرور
    validatePassword(password) {
        const errors = [];
        const isValid = true;

        if (password.length < 8) {
            errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // التحقق من الصلاحيات
    async checkPermission(requiredRole = 'admin') {
        try {
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient غير متاح في checkPermission');
                return false;
            }
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                return false;
            }

            const { data: userProfile, error } = await window.supabaseClient
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error || !userProfile) {
                return false;
            }

            if (requiredRole === 'admin') {
                return userProfile.role === 'admin';
            } else if (requiredRole === 'editor') {
                return ['admin', 'editor'].includes(userProfile.role);
            }

            return false;
        } catch (error) {
            console.error('Permission check error:', error);
            return false;
        }
    }

    // الحصول على معلومات المستخدم الحالي
    async getCurrentUser() {
        try {
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient غير متاح في getCurrentUser');
                return null;
            }
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                return null;
            }

            const { data: userProfile, error } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                return null;
            }

            return {
                id: user.id,
                email: user.email,
                fullName: userProfile.full_name,
                role: userProfile.role,
                status: userProfile.status,
                createdAt: userProfile.created_at
            };
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    // تحديث آخر نشاط
    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    // إعادة تعيين مهلة الجلسة
    resetSessionTimeout() {
        this.lastActivity = Date.now();
    }
}

// إنشاء مثيل من نظام الأمان بعد تحميل Supabase
let supabaseClientCheckStarted = false;

function initializeAdminSecurity() {
    // التحقق من عدم وجود adminSecurity بالفعل
    if (window.adminSecurity) {
        console.log('✅ adminSecurity already exists, skipping initialization');
        return;
    }
    
    const checkSupabaseClient = () => {
        if (supabaseClientCheckStarted) {
            return; // منع التكرار
        }
        
        if (window.supabaseClient && window.supabaseClient.auth) {
            // console.log('✅ Initializing AdminSecurity with Supabase client');
            window.adminSecurity = new AdminSecurity();
        } else {
            console.log('⏳ Waiting for Supabase client to load...');
            supabaseClientCheckStarted = true;
            setTimeout(checkSupabaseClient, 100);
        }
    };
    
    checkSupabaseClient();
}

// بدء التهيئة عند تحميل الصفحة
let adminSecurityInitStarted = false;

function startAdminSecurityInitialization() {
    // منع التكرار
    if (adminSecurityInitStarted) {
        return;
    }
    
    // التحقق من عدم وجود adminSecurity بالفعل
    if (window.adminSecurity) {
        console.log('✅ adminSecurity already exists');
        return;
    }
    
    adminSecurityInitStarted = true;
    
    // انتظار تحميل Supabase أولاً
    if (window.supabaseClient && window.supabaseClient.auth) {
        initializeAdminSecurity();
    } else {
        console.log('⏳ Waiting for Supabase client to be ready...');
        setTimeout(startAdminSecurityInitialization, 100);
    }
}

// بدء التهيئة مرة واحدة فقط
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAdminSecurityInitialization);
} else {
    startAdminSecurityInitialization();
}

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSecurity;
} 