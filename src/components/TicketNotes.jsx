import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Card,
    CardContent,
    Stack,
    Chip,
    Tooltip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import {
    AttachFile as AttachmentIcon,
    Send as SendIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Comment as CommentIcon,
    Close as CloseIcon,
    InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    getTicketNotes,
    createTicketNote,
    downloadNoteAttachment,
    deleteNoteAttachment,
} from '../api/TicketNoteService';
import { getCurrentUser } from '../api/auth';

const FilePreview = ({ file, onRemove }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        bgcolor: 'grey.100',
        borderRadius: 1,
        maxWidth: '100%'
    }}>
        <FileIcon color="primary" fontSize="small" />
        <Typography noWrap variant="body2" sx={{ flex: 1 }}>
            {file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>
            ({(file.size / 1024).toFixed(1)} KB)
        </Typography>
        <IconButton size="small" onClick={onRemove}>
            <CloseIcon fontSize="small" />
        </IconButton>
    </Box>
);

const TicketNotes = ({ ticketId, ticket }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showFilesDialog, setShowFilesDialog] = useState(false);
    const currentUser = getCurrentUser();
    const canCreateNotes = ticket?.createdById === currentUser?.id || ticket?.userId === currentUser?.id;

    useEffect(() => {
        fetchNotes();
    }, [ticketId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await getTicketNotes(ticketId);
            setNotes(response.data);
        } catch (err) {
            setError('Notlar yüklenirken bir hata oluştu');
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newNote.trim() && selectedFiles.length === 0) return;

        try {
            setLoading(true);
            setError(''); // Clear any previous errors

            const noteText = newNote.trim();
            const noteType = 'Yorum';

            if (selectedFiles.length > 0) {
                // Create FormData for file upload
                const formData = new FormData();
                // Add the note text and type
                formData.append('Note', noteText || 'Dosya eklendi');
                formData.append('NoteType', noteType);
                // Add files one by one
                selectedFiles.forEach(file => {
                    formData.append('Files', file);
                });

                await createTicketNote(ticketId, formData, true);
            } else {
                // Simple JSON payload for text-only notes
                const noteData = {
                    Note: noteText,
                    NoteType: noteType
                };

                await createTicketNote(ticketId, noteData, false);
            }
            
            // Clear form
            setNewNote('');
            setSelectedFiles([]);
            
            // Refresh notes list
            await fetchNotes();
        } catch (err) {
            console.error('Error adding note:', err);
            // Enhanced error handling
            let errorMessage = 'Not eklenirken bir hata oluştu';
            if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : err.response.data.detail || err.response.data.message || JSON.stringify(err.response.data);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        event.target.value = ''; // Reset input to allow selecting the same file again
    };

    const handleRemoveFile = (fileToRemove) => {
        setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleDownload = async (noteId, fileName, attachmentId) => {
        try {
            const response = await downloadNoteAttachment(ticketId, noteId, attachmentId);
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'attachment');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Dosya indirilirken bir hata oluştu');
            console.error('Error downloading attachment:', err);
        }
    };

    const handleDeleteAttachment = async (noteId, attachmentId) => {
        try {
            await deleteNoteAttachment(ticketId, noteId, attachmentId);
            await fetchNotes();
        } catch (err) {
            setError('Dosya silinirken bir hata oluştu');
            console.error('Error deleting attachment:', err);
        }
    };

    const getFileNameFromPath = (path) => {
        if (!path) return '';
        return path.split('/').pop();
    };

    return (
        <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Notlar ve Yorumlar
                    </Typography>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        onClose={() => setError('')}
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Note Creation Section - Updated visibility condition */}
                {canCreateNotes ? (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder="Not ekle..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    id="file-input"
                                />
                                <label htmlFor="file-input">
                                    <Button
                                        component="span"
                                        startIcon={<AttachmentIcon />}
                                        sx={{ mr: 1 }}
                                    >
                                        Dosya Ekle
                                    </Button>
                                </label>
                                {selectedFiles.length > 0 && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setShowFilesDialog(true)}
                                    >
                                        {selectedFiles.length} dosya seçildi
                                    </Button>
                                )}
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loading || (!newNote.trim() && selectedFiles.length === 0)}
                                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                            >
                                Gönder
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Alert 
                        severity="info" 
                        sx={{ mb: 3 }}
                    >
                        Bu çağrıya sadece çağrıyı oluşturan veya atanan kişi not ekleyebilir.
                    </Alert>
                )}

                {/* Notes List */}
                <List>
                    {notes.length === 0 ? (
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            align="center"
                            sx={{ py: 4 }}
                        >
                            Henüz not eklenmemiş.
                        </Typography>
                    ) : (
                        notes.map((note, index) => (
                            <React.Fragment key={note.id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    sx={{ py: 2 }}
                                    alignItems="flex-start"
                                >
                                    <Box sx={{ width: '100%' }}>
                                        {/* Header */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                {note.createdByEmail}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(new Date(note.createdDate), 'dd.MM.yyyy HH:mm', { locale: tr })}
                                            </Typography>
                                            {note.noteType && (
                                                <Chip
                                                    label={note.noteType}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            )}
                                        </Box>
                                        
                                        {/* Note Content */}
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ whiteSpace: 'pre-wrap', mb: note.attachments?.length > 0 ? 1 : 0 }}
                                        >
                                            {note.note}
                                        </Typography>

                                        {/* Attachments */}
                                        {note.attachments?.length > 0 && (
                                            <Stack spacing={1} sx={{ mt: 1 }}>
                                                {note.attachments.map((attachment) => (
                                                    <Box
                                                        key={attachment.id}
                                                        sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: 1,
                                                            bgcolor: 'grey.100',
                                                            p: 1,
                                                            borderRadius: 1,
                                                            maxWidth: 'fit-content'
                                                        }}
                                                    >
                                                        <FileIcon fontSize="small" color="primary" />
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {attachment.fileName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {(attachment.fileSize / 1024).toFixed(1)} KB
                                                            </Typography>
                                                        </Box>
                                                        <Stack direction="row" spacing={1}>
                                                            <Tooltip title="Dosyayı İndir">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDownload(note.id, attachment.fileName, attachment.id)}
                                                                >
                                                                    <DownloadIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Dosyayı Sil">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteAttachment(note.id, attachment.id)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </ListItem>
                            </React.Fragment>
                        ))
                    )}
                </List>

                {/* Files Dialog */}
                <Dialog
                    open={showFilesDialog}
                    onClose={() => setShowFilesDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Seçilen Dosyalar</DialogTitle>
                    <DialogContent>
                        <Stack spacing={1}>
                            {selectedFiles.map((file, index) => (
                                <FilePreview
                                    key={index}
                                    file={file}
                                    onRemove={() => handleRemoveFile(file)}
                                />
                            ))}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowFilesDialog(false)}>Kapat</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default TicketNotes; 