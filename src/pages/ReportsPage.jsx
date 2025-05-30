import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper
} from '@mui/material';

const ReportsPage = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Raporlar
                </Typography>
            </Box>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h6">
                    Raporlar Sayfası
                </Typography>
                <Typography>
                    Bu sayfa yapım aşamasındadır.
                </Typography>
            </Paper>
        </Container>
    );
};

export default ReportsPage; 