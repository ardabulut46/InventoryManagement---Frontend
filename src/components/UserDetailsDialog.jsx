import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
    Box,
    Grid,
    Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const UserDetailsDialog = ({ open, onClose, user }) => {
    if (!user) return null;

    const userDetails = [
        { label: 'Name', value: user.name },
        { label: 'Surname', value: user.surname },
        { label: 'Email', value: user.email },
        { label: 'Location', value: user.location || '-' },
        { label: 'Department', value: user.department?.name || '-' },
        { label: 'City', value: user.city || '-' },
        { label: 'District', value: user.district || '-' },
        { label: 'Address', value: user.address || '-' },
        { label: 'Floor', value: user.floor || '-' },
        { label: 'Room', value: user.room || '-' },
        { label: 'Group', value: user.group || '-' },
        { label: 'Permissions', value: user.permissions || '-' },
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 3,
            }}>
                <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ fontWeight: 'bold' }}
                >
                    User Details
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {userDetails.map((detail, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {detail.label}
                                </Typography>
                                <Typography variant="body1">
                                    {detail.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailsDialog; 