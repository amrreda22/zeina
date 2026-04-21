// ترجمة التصنيفات الفرعية من الإنجليزية إلى العربية
// يستخدم في صفحة إدارة المنتجات لعرض الأسماء العربية الصحيحة

const subcategoryTranslations = {
    // كوشات
    'koshat-wedding': 'كوشات زفاف',
    'koshat-engagement': 'كوشات خطوبة',
    'kosh-wedding': 'كوشات زفاف',
    'kosh-engagement': 'كوشات خطوبة',

    // مرايا
    'mirr-wedding': 'مرآة زفاف',
    'mirr-engagement': 'مرآة خطوبة',
    'mirr-decorative': 'مرآة ديكور',
    'mirror-wedding': 'مرآة زفاف',
    'mirror-engagement': 'مرآة خطوبة',
    'mirror-decorative': 'مرآة ديكور',

    // تورتات وأنواع الشوكولاتة
    'cake-wedding': 'تورتة زفاف',
    'cake-engagement': 'تورتة خطوبة',
    'cake-birthday': 'تورتة عيد ميلاد',
    'cake-chocolate': 'تورتة شوكولاتة',
    'cake-fruit': 'تورتة فواكه',
    'cake-chocolate-tray': 'صينية شوكولاتة',

    // ديكورات متنوعة
    'other-birthday': 'ديكور عيد ميلاد',
    'other-hospital': 'استقبال المولود بالمستشفى',
    'other-bride': 'ديكور استقبال عروسة',
    'other-party': 'ديكور حفلات بسيطة',

    // دعوات وتوزيعات
    'invitation-wedding': 'دعوة زفاف',
    'invitation-engagement': 'دعوة خطوبة',
    'invitation-wedding-distribution': 'توزيعات فرح',
    'invitation-engagement-distribution': 'توزيعات خطوبة',
    'invitation-chocolate': 'توزيعات بالشوكولاتة',
    'invitation-perfumed': 'توزيعات بالعطور / البرفان',
    'invitation-gift': 'توزيعات مع هدية صغيره',
    'invitation-baby-week': 'توزيعات سبوع',
    'invitation-kids': 'توزيعات أطفال',
    'invitation-flowers': 'توزيعات ورد',
    'invitation-candles': 'توزيعات شموع',
    'invitation-digital': 'دعوة رقمية',

    // بوكيهات الورد
    'flowerbouquets-natural': 'بوكيهات طبيعية',
    'flowerbouquets-artificial': 'بوكيهات صناعية',
    'flowerbouquets-stand': 'بوكيهات استاند',
    'flowerbouquets-dried': 'بوكيهات مجففة',
    'flowerbouquets-arranged': 'بوكيهات مشكلة'
};

/**
 * تحويل اسم التصنيف الفرعي من الإنجليزية إلى العربية
 * @param {string} englishSubcategory - الاسم الإنجليزي للتصنيف الفرعي
 * @returns {string} الاسم العربي أو الاسم الأصلي إذا لم يكن موجود في الترجمة
 */
function translateSubcategory(englishSubcategory) {
    if (!englishSubcategory) return '';

    // إذا كان التصنيف الفرعي مصفوفة أو نص متعدد
    if (Array.isArray(englishSubcategory)) {
        const firstItem = englishSubcategory[0];
        // إذا كان العنصر الأول مصفوفة أيضاً، خذ العنصر الأول منها
        const actualItem = Array.isArray(firstItem) ? firstItem[0] : firstItem;
        return translateSubcategory(actualItem);
    }

    // إذا كان نص مفصول بفواضل
    if (typeof englishSubcategory === 'string' && englishSubcategory.includes(',')) {
        return englishSubcategory.split(',').map(sub => {
            let trimmed = sub.trim();
            // إزالة علامات الاقتباس الإضافية
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                trimmed = trimmed.slice(1, -1);
            }
            if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
                trimmed = trimmed.slice(1, -1);
            }
            return subcategoryTranslations[trimmed] || trimmed;
        }).join(', ');
    }

    let trimmed = englishSubcategory.trim();

    // إزالة علامات الاقتباس الإضافية إذا كانت موجودة
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        trimmed = trimmed.slice(1, -1);
    }
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        trimmed = trimmed.slice(1, -1);
    }

    // البحث المباشر في الترجمة
    if (subcategoryTranslations[trimmed]) {
        return subcategoryTranslations[trimmed];
    }

    // محاولة إصلاح الأخطاء الإملائية الشائعة
    const correctedSubcategory = fixCommonSpellingErrors(trimmed);
    if (subcategoryTranslations[correctedSubcategory]) {
        return subcategoryTranslations[correctedSubcategory];
    }

    // إذا لم يتم العثور على ترجمة، محاولة استخراج المعنى من الاسم
    const extractedTranslation = extractMeaningFromName(trimmed);
    if (extractedTranslation !== trimmed) {
        return extractedTranslation;
    }

    // إذا لم يتم العثور على ترجمة، إرجاع الاسم الأصلي
    return trimmed;
}

/**
 * استخراج المعنى من اسم التصنيف الفرعي عندما لا توجد ترجمة مباشرة
 * @param {string} subcategoryName - اسم التصنيف الفرعي
 * @returns {string} الترجمة المستخرجة أو الاسم الأصلي
 */
function extractMeaningFromName(subcategoryName) {
    const lowerName = subcategoryName.toLowerCase();

    // استخراج نوع المناسبة
    let occasion = '';
    if (lowerName.includes('wedding') || lowerName.includes('wedd')) {
        occasion = 'زفاف';
    } else if (lowerName.includes('engagement') || lowerName.includes('engag')) {
        occasion = 'خطوبة';
    } else if (lowerName.includes('birthday') || lowerName.includes('birth')) {
        occasion = 'عيد ميلاد';
    } else if (lowerName.includes('decorative') || lowerName.includes('decor')) {
        occasion = 'ديكور';
    }

    // استخراج نوع المنتج
    let productType = '';
    if (lowerName.includes('mirror') || lowerName.includes('mirr')) {
        productType = 'مرايا';
    } else if (lowerName.includes('koshat') || lowerName.includes('kosh')) {
        productType = 'كوشات';
    } else if (lowerName.includes('cake') || lowerName.includes('cak')) {
        productType = 'تورتة';
    } else if (lowerName.includes('flower') || lowerName.includes('bouquet')) {
        productType = 'بوكيهات';
    } else if (lowerName.includes('invitation') || lowerName.includes('invite')) {
        productType = 'دعوة';
    }

    // دمج النوع والمناسبة
    if (productType && occasion) {
        return `${productType} ${occasion}`;
    } else if (productType) {
        return productType;
    } else if (occasion) {
        return occasion;
    }

    return subcategoryName;
}

/**
 * إصلاح الأخطاء الإملائية الشائعة في أسماء التصنيفات الفرعية
 * @param {string} subcategory - الاسم المراد إصلاحه
 * @returns {string} الاسم المصحح
 */
function fixCommonSpellingErrors(subcategory) {
    const corrections = {
        // إصلاح أخطاء في كلمة "mirr"
        'mirror-wedding': 'mirr-wedding',
        'mirror-engagement': 'mirr-engagement',
        'mirror-decorative': 'mirr-decorative',

        // إصلاح أخطاء في كلمة "koshat"
        'kosh-wedding': 'koshat-wedding',
        'kosh-engagement': 'koshat-engagement',

        // إصلاح أخطاء في كلمة "cake"
        'cak-wedding': 'cake-wedding',
        'cak-engagement': 'cake-engagement',

        // إصلاح أخطاء في كلمة "flowerbouquets"
        'flower-wedding': 'flowerbouquets-natural',
        'flower-engagement': 'flowerbouquets-natural',
    };

    return corrections[subcategory] || subcategory;
}

/**
 * تحويل اسم التصنيف الفرعي من العربية إلى الإنجليزية (للحفظ في قاعدة البيانات)
 * @param {string} arabicSubcategory - الاسم العربي للتصنيف الفرعي
 * @returns {string} الاسم الإنجليزي أو الاسم الأصلي إذا لم يكن موجود في الترجمة
 */
function translateSubcategoryToEnglish(arabicSubcategory) {
    if (!arabicSubcategory) return '';

    // إنشاء خريطة عكسية للترجمة من العربية إلى الإنجليزية
    const arabicToEnglish = {};
    for (const [english, arabic] of Object.entries(subcategoryTranslations)) {
        arabicToEnglish[arabic] = english;
    }

    // إذا كان التصنيف الفرعي مصفوفة أو نص متعدد
    if (Array.isArray(arabicSubcategory)) {
        const firstItem = arabicSubcategory[0];
        // إذا كان العنصر الأول مصفوفة أيضاً، خذ العنصر الأول منها
        const actualItem = Array.isArray(firstItem) ? firstItem[0] : firstItem;
        return translateSubcategoryToEnglish(actualItem);
    }

    // إذا كان نص مفصول بفواصل
    if (typeof arabicSubcategory === 'string' && arabicSubcategory.includes(',')) {
        return arabicSubcategory.split(',').map(sub => {
            const trimmed = sub.trim();
            return arabicToEnglish[trimmed] || trimmed;
        }).join(', ');
    }

    // ترجمة تصنيف فرعي واحد
    return arabicToEnglish[arabicSubcategory] || arabicSubcategory;
}

/**
 * الحصول على جميع التصنيفات الفرعية لفئة معينة
 * @param {string} category - اسم الفئة الرئيسية
 * @returns {Array} مصفوفة من الأسماء العربية للتصنيفات الفرعية
 */
function getSubcategoriesForCategory(category) {
    const categorySubcategories = {
        'koshat': ['كوشات زفاف', 'كوشات خطوبة'],
        'mirr': ['مرايا زفاف', 'مرايا خطوبة', 'مرايا ديكور'],
        'cake': ['تورتة زفاف', 'تورتة خطوبة', 'تورتة عيد ميلاد', 'تورتة شوكولاتة', 'تورتة فواكه', 'صينية شوكولاتة'],
        'other': ['ديكور عيد ميلاد', 'استقبال المولود بالمستشفى', 'ديكور استقبال عروسة', 'ديكور حفلات بسيطة'],
        'invitations': ['دعوة زفاف', 'دعوة خطوبة', 'توزيعات فرح', 'توزيعات خطوبة', 'توزيعات بالشوكولاتة', 'توزيعات بالعطور / البرفان', 'توزيعات مع هدية صغيره', 'توزيعات سبوع', 'توزيعات أطفال', 'توزيعات ورد', 'توزيعات شموع', 'دعوة رقمية'],
        'flowerbouquets': ['بوكيهات طبيعية', 'بوكيهات صناعية', 'بوكيهات استاند', 'بوكيهات مجففة', 'بوكيهات مشكلة']
    };

    return categorySubcategories[category] || [];
}

// تصدير الدوال للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        subcategoryTranslations,
        translateSubcategory,
        translateSubcategoryToEnglish,
        getSubcategoriesForCategory
    };
}
