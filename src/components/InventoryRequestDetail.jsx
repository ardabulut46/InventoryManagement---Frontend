import React from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const InventoryRequestDetail = ({ request, inventoryDetails, inventoryLoading, theme }) => {
    const inventory = inventoryDetails[request.entityId];

    return (
        <Box 
            sx={{ 
                margin: 2, 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.background.default, 0.5) 
            }}
        >
            <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                İstek Detayları
            </Typography>
            
            {request.requesterComments && (
                <Typography variant="body1" paragraph>
                    <strong>Kullanıcı Notu:</strong> {request.requesterComments}
                </Typography>
            )}

            {inventoryLoading && !inventory && (
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }}/>
                    <Typography>Envanter bilgileri yükleniyor...</Typography>
                </Box>
            )}
            
            {inventory && (
                <Link component={RouterLink} to={`/inventories/detail/${request.entityId}`} underline="none" sx={{ color: 'inherit' }}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            mt: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                cursor: 'pointer',
                                boxShadow: theme.shadows[4],
                                borderColor: theme.palette.primary.main,
                            }
                        }}
                    >
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                            İlgili Envanter
                        </Typography>
                        {inventory.error ? (
                            <Typography color="error">{inventory.error}</Typography>
                        ) : (
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={6}><Typography><strong>Marka:</strong> {inventory.brandName || '-'}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><strong>Model:</strong> {inventory.modelName || '-'}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><strong>Seri Numarası:</strong> {inventory.serialNumber || '-'}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><strong>Barkod No:</strong> {inventory.barcode || '-'}</Typography></Grid>
                            </Grid>
                        )}
                    </Paper>
                </Link>
            )}

            {request.status !== 0 && request.approverComments && (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        bgcolor: alpha(theme.palette.info.light, 0.2),
                        p: 1.5,
                        mt: 2,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <strong>Yönetici Notu:</strong> {request.approverComments}
                </Typography>
            )}
        </Box>
    );
};

export default InventoryRequestDetail; 