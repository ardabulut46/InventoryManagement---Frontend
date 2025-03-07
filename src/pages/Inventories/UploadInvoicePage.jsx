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
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Container,
    Breadcrumbs,
    Link as MuiLink,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    ArrowBack as ArrowBackIcon,
    Description as DescriptionIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    InsertDriveFile as FileIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getInventories, uploadInvoice } from '../../api/InventoryService';
import { useTheme } from '@mui/material/styles';

function UploadInvoicePage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [inventories, setInventories] = useState([]);
    const [files, setFiles] = useState([]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    useEffect(() => {
        loadInventories();
    }, []);

    const loadInventories = async () => {
        setLoading(true);
        try {
            const response = await getInventories();
            setInventories(response.data);
            setError('');
        } catch (err) {
            console.error('Envanterler yüklenirken hata oluştu:', err);
            setError('Envanterler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return <FileIcon />;
        
        const type = fileType.toLowerCase();
        if (type.includes('pdf')) return <PdfIcon color="error" />;
        if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) 
            return <ImageIcon color="primary" />;
        if (type.includes('doc')) return <DescriptionIcon color="info" />;
        
        return <FileIcon />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setError('');
        setSuccess('');
        
        if (selectedFiles.length === 0) return;
        
        // Validate each file
        const invalidFiles = selectedFiles.filter(file => {
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            return !ALLOWED_FILE_TYPES.includes(fileExtension) || file.size > MAX_FILE_SIZE;
        });
        
        if (invalidFiles.length > 0) {
            const fileNames = invalidFiles.map(f => f.name).join(', ');
            setError(`Geçersiz dosya(lar): ${fileNames}. Dosya boyutu 10MB'dan küçük olmalı ve izin verilen türler: ${ALLOWED_FILE_TYPES.join(', ')}`);
            event.target.value = null;
            return;
        }
        
        // Add new files to existing files
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        
        // Reset the file input to allow selecting the same file again
        event.target.value = null;
    };
    
    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedInventory) {
            setError('Lütfen bir envanter seçin');
            return;
        }

        if (files.length === 0) {
            setError('Lütfen en az bir fatura dosyası seçin');
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadInvoice(selectedInventory.id, files, description);
            console.log('Upload response:', response);
            setSuccess(`Fatura(lar) başarıyla yüklendi: ${selectedInventory.brand} ${selectedInventory.model}`);
            setFiles([]);
            setDescription('');
            setSelectedInventory(null);
        } catch (err) {
            console.error('Fatura yüklenirken hata oluştu:', err);
            setError(err.response?.data?.message || 'Fatura yüklenirken bir hata oluştu');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <MuiLink component={Link} to="/" color="inherit">
                    Ana Sayfa
                </MuiLink>
                <MuiLink component={Link} to="/inventories" color="inherit">
                    Envanterler
                </MuiLink>
                <Typography color="text.primary">Fatura Yükle</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton 
                    component={Link} 
                    to="/inventories" 
                    sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Fatura Yükle
                </Typography>
            </Box>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Left Side - Form */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        height: '100%',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert 
                                    severity="success" 
                                    sx={{ mb: 3 }}
                                    icon={<CheckCircleIcon fontSize="inherit" />}
                                >
                                    {success}
                                </Alert>
                            )}

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                                        Fatura Bilgileri
                                    </Typography>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Autocomplete
                                                options={inventories}
                                                getOptionLabel={(inventory) => 
                                                    `${inventory.barcode || 'Barkod Yok'} - ${inventory.brand || ''} ${inventory.model || ''}`
                                                }
                                                value={selectedInventory}
                                                onChange={(event, newValue) => {
                                                    setSelectedInventory(newValue);
                                                    setError('');
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Envanter Seçin"
                                                        required
                                                        fullWidth
                                                        helperText="Faturayı eklemek istediğiniz envanter öğesini seçin"
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="body1">
                                                                {option.brand} {option.model}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Barkod: {option.barcode || 'Yok'} | 
                                                                Seri No: {option.serialNumber || 'Yok'}
                                                            </Typography>
                                                        </Box>
                                                    </li>
                                                )}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Açıklama"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                multiline
                                                rows={2}
                                                helperText="Fatura(lar) hakkında açıklama ekleyebilirsiniz (isteğe bağlı)"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box 
                                                sx={{ 
                                                    border: '2px dashed',
                                                    borderColor: 'primary.main',
                                                    borderRadius: 2,
                                                    p: 3,
                                                    textAlign: 'center',
                                                    bgcolor: 'background.paper',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    }
                                                }}
                                            >
                                                <input
                                                    accept={ALLOWED_FILE_TYPES.join(',')}
                                                    style={{ display: 'none' }}
                                                    id="raised-button-file"
                                                    multiple
                                                    type="file"
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="raised-button-file">
                                                    <Button
                                                        variant="contained"
                                                        component="span"
                                                        startIcon={<CloudUploadIcon />}
                                                        sx={{ mb: 2 }}
                                                    >
                                                        Dosya Seç
                                                    </Button>
                                                </label>
                                                <Typography variant="body2" color="text.secondary">
                                                    Sürükle ve bırak desteklenmez. Lütfen "Dosya Seç" butonuna tıklayın.
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    İzin verilen dosya türleri: {ALLOWED_FILE_TYPES.join(', ')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Maksimum dosya boyutu: 10MB
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        
                                        {files.length > 0 && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                                    Seçilen Dosyalar ({files.length})
                                                </Typography>
                                                <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                                    {files.map((file, index) => (
                                                        <ListItem key={index} divider={index < files.length - 1}>
                                                            <ListItemIcon>
                                                                {getFileIcon(file.type)}
                                                            </ListItemIcon>
                                                            <ListItemText 
                                                                primary={file.name}
                                                                secondary={formatFileSize(file.size)}
                                                            />
                                                            <ListItemSecondaryAction>
                                                                <IconButton 
                                                                    edge="end" 
                                                                    aria-label="delete"
                                                                    onClick={() => handleRemoveFile(index)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} sx={{ mt: 2 }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                disabled={isUploading || !selectedInventory || files.length === 0}
                                                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                                fullWidth
                                                sx={{ py: 1.5 }}
                                            >
                                                {isUploading ? 'Yükleniyor...' : 'Fatura Yükle'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side - Info */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <InfoIcon color="info" sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    Bilgi
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body2" paragraph>
                                Bu sayfada envanter öğelerine fatura ekleyebilirsiniz. Fatura eklemek için:
                            </Typography>
                            <Box component="ol" sx={{ pl: 2, mb: 2 }}>
                                <li>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Listeden bir envanter öğesi seçin
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        İsteğe bağlı olarak bir açıklama ekleyin
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        "Dosya Seç" butonuna tıklayarak bir veya birden fazla dosya seçin
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body2">
                                        "Fatura Yükle" butonuna tıklayarak dosyaları yükleyin
                                    </Typography>
                                </li>
                            </Box>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Artık birden fazla fatura dosyası yükleyebilirsiniz!
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default UploadInvoicePage; 