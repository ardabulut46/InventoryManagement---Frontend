import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Alert,
    Autocomplete,
    TextField,
    Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getInventories, uploadInvoice } from '../../api/InventoryService';

function UploadInvoicePage() {
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [inventories, setInventories] = useState([]);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    useEffect(() => {
        loadInventories();
    }, []);

    const loadInventories = async () => {
        try {
            const response = await getInventories();
            setInventories(response.data);
        } catch (err) {
            console.error('Error loading inventories:', err);
            setError('Failed to load inventories');
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setError('');
        
        if (selectedFile) {
            // Check file type
            const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
            if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
                setError(`Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.join(', ')}`);
                event.target.value = null;
                return;
            }

            // Check file size
            if (selectedFile.size > MAX_FILE_SIZE) {
                setError('File size must be less than 10MB');
                event.target.value = null;
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedInventory) {
            setError('Please select an inventory');
            return;
        }

        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsUploading(true);
        try {
            await uploadInvoice(selectedInventory.id, file);
            setSuccess('Invoice uploaded successfully');
            setFile(null);
            setSelectedInventory(null);
            // Reset the file input
            e.target.reset();
        } catch (err) {
            console.error('Error uploading invoice:', err);
            setError('Failed to upload invoice');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box component={Paper} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Fatura Yükle
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={inventories}
                            getOptionLabel={(inventory) => 
                                `${inventory.barcode} - ${inventory.brand} ${inventory.model}`
                            }
                            value={selectedInventory}
                            onChange={(event, newValue) => setSelectedInventory(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Inventory"
                                    required
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ mt: 1 }}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Select Invoice'}
                            <input
                                type="file"
                                hidden
                                accept={ALLOWED_FILE_TYPES.join(',')}
                                onChange={handleFileChange}
                            />
                        </Button>
                        {file && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                                Selected file: {file.name}
                            </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                            Allowed file types: {ALLOWED_FILE_TYPES.join(', ')} | Max size: 10MB
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!selectedInventory || !file || isUploading}
                        >
                            Upload Invoice
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default UploadInvoicePage; 