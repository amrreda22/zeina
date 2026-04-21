// ملف مشترك يحتوي على دوال التصنيفات الموحدة
// Common utilities for category management

// Get category name in Arabic
function getCategoryName(category) {
    const categories = {
        'koshat': 'كوشات',
        'mirr': 'مرايا',
        'cake': 'تورتات',
        'other': 'ديكورات متنوعة',
        'invitations': 'دعوات وتوزيعات'
    };
    return categories[category] || category;
}

// Get subcategory name in Arabic
function getSubcategoryName(subcategory) {
    const subcategories = {
        // كوشات
        'koshat-wedding': 'كوشات زفاف',
        'koshat-engagement': 'كوشات خطوبة',
        'koshat-birthday': 'كوشات عيد ميلاد',
        'koshat-party': 'كوشات حفلات',
        'koshat-corporate': 'كوشات شركات',
        
        // مرايا - تصحيح المفاتيح
        'mirr-wedding': 'مرايا زفاف',
        'mirr-engagement': 'مرايا خطوبة',
        'mirr-birthday': 'مرايا عيد ميلاد',
        'mirr-decorative': 'مرايا ديكور',
        'mirr-custom': 'مرايا مخصصة',
        'mirr-classic': 'مرايا كلاسيكية',
        'mirr-modern': 'مرايا عصرية',
        'mirr-luxury': 'مرايا فاخرة',
        
        // مرايا - إضافة المفاتيح البديلة
        'mirror-wedding': 'مرايا زفاف',
        'mirror-engagement': 'مرايا خطوبة',
        'mirror-birthday': 'مرايا عيد ميلاد',
        'mirror-decorative': 'مرايا ديكور',
        'mirror-custom': 'مرايا مخصصة',
        'mirror-classic': 'مرايا كلاسيكية',
        'mirror-modern': 'مرايا عصرية',
        'mirror-luxury': 'مرايا فاخرة',
        
        // تورتة
        'cake-wedding': 'تورتة زفاف',
        'cake-engagement': 'تورتة خطوبة',
        'cake-birthday': 'تورتة عيد ميلاد',
        'cake-chocolate': 'تورتة شوكولاتة',
        'cake-fruit': 'تورتة فواكه',
        'cake-custom': 'تورتة مخصصة',
        
        // ديكورات متنوعة
        'other-birthday': 'ديكور عيد ميلاد',
        'other-hospital': 'ديكور استقبال مستشفى',
        'other-bride': 'ديكور استقبال عروسة',
        'other-party': 'ديكور حفلات بسيطة',
        'other-balloons': 'بالونات وهدايا',
        'other-flowers': 'زهور وأزهار',
        'other-lights': 'إضاءات ديكور',
        
        // دعوات
        'invitation-wedding': 'دعوة زفاف',
        'invitation-engagement': 'دعوة خطوبة',
        'invitation-birthday': 'دعوة عيد ميلاد',
        'invitation-party': 'دعوة حفلة',
        'invitation-corporate': 'دعوة شركة',
        
        // باقات الزهور
        'flowerbouquets-natural': 'بوكيهات طبيعية',
        'flowerbouquets-artificial': 'بوكيهات صناعية',
        'flowerbouquets-stand': 'بوكيهات استاند',
        'flowerbouquets-dried': 'بوكيهات مجففة',
        'flowerbouquets-arranged': 'بوكيهات مشكلة'
    };
    return subcategories[subcategory] || subcategory;
}

// Get subcategory display info (name and color)
function getSubcategoryDisplayInfo(subcategory) {
    const subcategoryMap = {
        // مرايا
        'mirr-wedding': { name: 'مرآة زفاف', color: 'bg-pink-500' },
        'mirr-engagement': { name: 'مرآة خطوبة', color: 'bg-purple-500' },
        'mirr-birthday': { name: 'مرآة عيد ميلاد', color: 'bg-green-500' },
        'mirr-decorative': { name: 'مرآة ديكور', color: 'bg-green-500' },
        'mirr-custom': { name: 'مرآة مخصصة', color: 'bg-indigo-500' },
        'mirr-classic': { name: 'مرآة كلاسيكية', color: 'bg-yellow-500' },
        'mirr-modern': { name: 'مرآة عصرية', color: 'bg-blue-500' },
        'mirr-luxury': { name: 'مرآة فاخرة', color: 'bg-red-500' },
        
        // مرايا - إضافة المفاتيح البديلة
        'mirror-wedding': { name: 'مرآة زفاف', color: 'bg-pink-500' },
        'mirror-engagement': { name: 'مرآة خطوبة', color: 'bg-purple-500' },
        'mirror-birthday': { name: 'مرآة عيد ميلاد', color: 'bg-green-500' },
        'mirror-decorative': { name: 'مرآة ديكور', color: 'bg-green-500' },
        'mirror-custom': { name: 'مرآة مخصصة', color: 'bg-indigo-500' },
        'mirror-classic': { name: 'مرآة كلاسيكية', color: 'bg-yellow-500' },
        'mirror-modern': { name: 'مرآة عصرية', color: 'bg-blue-500' },
        'mirror-luxury': { name: 'مرآة فاخرة', color: 'bg-red-500' },
        
        // كوشات
        'koshat-wedding': { name: 'كوشة زفاف', color: 'bg-pink-500' },
        'koshat-engagement': { name: 'كوشة خطوبة', color: 'bg-purple-500' },
        'koshat-birthday': { name: 'كوشة عيد ميلاد', color: 'bg-green-500' },
        'koshat-party': { name: 'كوشة حفلة', color: 'bg-blue-500' },
        'koshat-corporate': { name: 'كوشة شركة', color: 'bg-indigo-500' },
        
        // تورتات
        'cake-wedding': { name: 'تورتة زفاف', color: 'bg-pink-500' },
        'cake-engagement': { name: 'تورتة خطوبة', color: 'bg-purple-500' },
        'cake-birthday': { name: 'تورتة عيد ميلاد', color: 'bg-green-500' },
        'cake-chocolate': { name: 'تورتة شوكولاتة', color: 'bg-yellow-500' },
        'cake-fruit': { name: 'تورتة فواكه', color: 'bg-orange-500' },
        'cake-custom': { name: 'تورتة مخصصة', color: 'bg-indigo-500' },
        
        // ديكورات أخرى
        'other-birthday': { name: 'ديكور عيد ميلاد', color: 'bg-green-500' },
        'other-hospital': { name: 'ديكور مستشفى', color: 'bg-blue-500' },
        'other-bride': { name: 'ديكور عروسة', color: 'bg-pink-500' },
        'other-party': { name: 'ديكور حفلة', color: 'bg-purple-500' },
        'other-balloons': { name: 'بالونات', color: 'bg-yellow-500' },
        'other-flowers': { name: 'زهور', color: 'bg-red-500' },
        'other-lights': { name: 'إضاءات', color: 'bg-indigo-500' },
        
        // دعوات
        'invitation-wedding': { name: 'دعوة زفاف', color: 'bg-pink-500' },
        'invitation-engagement': { name: 'دعوة خطوبة', color: 'bg-purple-500' },
        'invitation-birthday': { name: 'دعوة عيد ميلاد', color: 'bg-green-500' },
        'invitation-party': { name: 'دعوة حفلة', color: 'bg-blue-500' },
        'invitation-corporate': { name: 'دعوة شركة', color: 'bg-indigo-500' },
        
        // باقات الزهور
        'flowerbouquets-natural': { name: 'بوكيهات طبيعية', color: 'bg-green-500' },
        'flowerbouquets-artificial': { name: 'بوكيهات صناعية', color: 'bg-blue-500' },
        'flowerbouquets-stand': { name: 'بوكيهات استاند', color: 'bg-purple-500' },
        'flowerbouquets-dried': { name: 'بوكيهات مجففة', color: 'bg-yellow-500' },
        'flowerbouquets-arranged': { name: 'بوكيهات مشكلة', color: 'bg-pink-500' }
    };
    
    return subcategoryMap[subcategory] || { name: subcategory, color: 'bg-gray-500' };
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCategoryName,
        getSubcategoryName,
        getSubcategoryDisplayInfo
    };
} else {
    // Make functions globally available
    window.getCategoryName = getCategoryName;
    window.getSubcategoryName = getSubcategoryName;
    window.getSubcategoryDisplayInfo = getSubcategoryDisplayInfo;
} 