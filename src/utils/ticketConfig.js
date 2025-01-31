export const TICKET_PRIORITIES = {
    1: {
        label: 'Kritik',
        color: '#DC2626', // Stronger red
        backgroundColor: '#FEE2E2'
    },
    2: {
        label: 'Yüksek',
        color: '#EA580C', // Stronger orange
        backgroundColor: '#FFEDD5'
    },
    3: {
        label: 'Orta',
        color: '#0D9488', // Teal/green color
        backgroundColor: '#CCFBF1'
    },
    4: {
        label: 'Düşük',
        color: '#2563EB', // Stronger blue
        backgroundColor: '#DBEAFE'
    }
};

export const getPriorityInfo = (priority) => {
    return TICKET_PRIORITIES[priority] || TICKET_PRIORITIES[4]; // Default to Low if priority not found
}; 