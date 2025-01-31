import React from 'react';
import { Chip } from '@mui/material';
import { getPriorityInfo } from '../utils/ticketConfig';

function PriorityChip({ priority, size = 'small' }) {
    const priorityInfo = getPriorityInfo(priority);
    
    return (
        <Chip
            label={priorityInfo.label}
            size={size}
            sx={{
                color: priorityInfo.color,
                backgroundColor: priorityInfo.backgroundColor,
                fontWeight: 'medium',
                '& .MuiChip-label': {
                    padding: '0 8px',
                }
            }}
        />
    );
}

export default PriorityChip; 