import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Checkbox,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getTicketSolutionById, 
    updateTicketSolution, 
    uploadSolutionAttachments,
    getAttachments,
    deleteAttachment,
    downloadAttachment 
} from '../../api/TicketSolutionService';
import SolutionTypeService from '../../api/SolutionTypeService';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DownloadIcon from '@mui/icons-material/Download';

function EditTicketSolutionPage() {
    const navigate = useNavigate();
    const { ticketId, solutionId } = useParams();
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        solutionTypeId: '',
        isChronicle: false,
    });
    const [attachments, setAttachments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSolutionTypes();
        fetchSolution();
        fetchAttachments();
    }, [solutionId]);

    const fetchAttachments = async () => {
        try {
            const response = await getAttachments(solutionId);
            setAttachments(response.data);
        } catch (error) {
            console.error('Error fetching attachments:', error);
        }
    };

    const handleDownloadAttachment = async (attachmentId, fileName) => {
        try {
            const response = await downloadAttachment(attachmentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading attachment:', error);
            setError('Failed to download attachment');
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        try {
            await deleteAttachment(attachmentId);
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        } catch (error) {
            console.error('Error deleting attachment:', error);
            setError('Failed to delete attachment');
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await updateTicketSolution(solutionId, formData);

            if (selectedFiles.length > 0) {
                await uploadSolutionAttachments(solutionId, selectedFiles);
            }

            navigate(`/tickets/${ticketId}/solutions`);
        } catch (error) {
            console.error('Error updating solution:', error);
            setError(error.response?.data || 'Failed to update solution');
        } finally {
            setLoading(false);
        }
    };

    const fetchSolutionTypes = async () => {
        try {
            const response = await SolutionTypeService.getSolutionTypes();
            setSolutionTypes(response.data);
        } catch (error) {
            console.error('Error fetching solution types:', error);
            setError('Failed to fetch solution types');
        }
    };

    const fetchSolution = async () => {
        try {
            const response = await getTicketSolutionById(solutionId);
            const solution = response.data;
            setFormData({
                subject: solution.subject,
                description: solution.description,
                solutionTypeId: solution.solutionTypeId,
                isChronicle: solution.isChronicle || false,
            });
        } catch (error) {
            console.error('Error fetching solution:', error);
            setError('Failed to fetch solution');
        }
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isChronicle' ? checked : value
        }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Çözümü Düzenle
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Solution Type</InputLabel>
                        <Select
                            name="solutionTypeId"
                            value={formData.solutionTypeId}
                            onChange={handleChange}
                            required
                            label="Solution Type"
                        >
                            {solutionTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                name="isChronicle"
                                checked={formData.isChronicle}
                                onChange={handleChange}
                            />
                        }
                        label="Kronik Çözüm"
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Mevcut Dosya Ekleri
                        </Typography>
                        <List>
                            {attachments.map((attachment) => (
                                <ListItem key={attachment.id}>
                                    <AttachmentIcon sx={{ mr: 1 }} />
                                    <ListItemText primary={attachment.fileName} />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                                            title="Dosyayı İndir"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteAttachment(attachment.id)}
                                            title="Dosyayı Sil"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ mt: 2 }}>
                            <input
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                                id="attachment-files"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <label htmlFor="attachment-files">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Yeni Dosya Ekle
                                </Button>
                            </label>
                        </Box>

                        {selectedFiles.length > 0 && (
                            <List>
                                {selectedFiles.map((file, index) => (
                                    <ListItem key={index}>
                                        <AttachmentIcon sx={{ mr: 1 }} />
                                        <ListItemText primary={file.name} />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemoveSelectedFile(index)}
                                                title="Dosyayı Kaldır"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/tickets/${ticketId}/solutions`)}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Güncelleniyor...' : 'Güncelle'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

export default EditTicketSolutionPage; 