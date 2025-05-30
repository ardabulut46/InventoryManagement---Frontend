import React from 'react';
import { Typography, Container, Paper } from '@mui/material';

function InventoryReports() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper 
                sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: 3
                }}
            >
                <Typography variant="h4" gutterBottom component="div">
                    Envanter Raporları
                </Typography>
                <Typography variant="body1">
                    Bu sayfa envanter raporlarını görüntülemek için kullanılacaktır. İçerik yakında eklenecektir.
                </Typography>
            </Paper>
        </Container>
    );
}

export default InventoryReports; 