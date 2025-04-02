export const TICKET_PRIORITIES = {
    1: {
        label: 'Kritik',
        value: 'Critical',
        color: '#DC2626', // Stronger red
        backgroundColor: '#FEE2E2'
    },
    2: {
        label: 'Yüksek',
        value: 'High',
        color: '#EA580C', // Stronger orange
        backgroundColor: '#FFEDD5'
    },
    3: {
        label: 'Normal',
        value: 'Normal',
        color: '#0D9488', // Teal/green color
        backgroundColor: '#CCFBF1'
    },
    4: {
        label: 'Düşük',
        value: 'Low',
        color: '#2563EB', // Stronger blue
        backgroundColor: '#DBEAFE'
    }
};

export const getPriorityInfo = (priority) => {
    return TICKET_PRIORITIES[priority] || TICKET_PRIORITIES[4]; // Default to Low if priority not found
};

// Status colors for different UI components
export const TICKET_STATUS_COLORS = {
    'Open': 'info',
    'InProgress': 'warning',
    'UnderReview': 'secondary',
    'ReadyForTesting': 'primary',
    'Testing': 'primary',
    'Resolved': 'success',
    'Closed': 'success',
    'Reopened': 'warning',
    'Cancelled': 'error',
};

// Ticket status translations to Turkish
export const TICKET_STATUS_TRANSLATIONS = {
    'Open': 'Açık',
    'InProgress': 'İşlemde',
    'UnderReview': 'İncelemede',
    'ReadyForTesting': 'Test İçin Hazır',
    'Testing': 'Test Ediliyor',
    'Resolved': 'Çözüldü',
    'Closed': 'Kapatıldı',
    'Reopened': 'Yeniden Açıldı',
    'Cancelled': 'İptal Edildi',
};

// Function to get Turkish translation of status
export const getStatusTranslation = (status) => {
    return TICKET_STATUS_TRANSLATIONS[status] || status;
};

// Status progress percentages for progress bars
export const TICKET_STATUS_PROGRESS = {
    'Open': 25,
    'InProgress': 50,
    'UnderReview': 60,
    'ReadyForTesting': 70,
    'Testing': 80,
    'Resolved': 90,
    'Closed': 100,
    'Reopened': 40,
    'Cancelled': 100,
}; 