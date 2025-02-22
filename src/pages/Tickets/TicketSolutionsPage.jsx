import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    IconButton,
    Tooltip,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getSolutionsByTicket, 
    deleteTicketSolution, 
    getAttachments,
    downloadAttachment,
    deleteAttachment 
} from '../../api/TicketSolutionService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function TicketSolutionsPage() {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [solutions, setSolutions] = useState([]);
    const [solutionAttachments, setSolutionAttachments] = useState({});
    const [openAttachments, setOpenAttachments] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSolutions();
    }, [ticketId]);

    const fetchSolutions = async () => {
        try {
            const response = await getSolutionsByTicket(ticketId);
            setSolutions(response.data);
            
            // Fetch attachments for each solution
            for (const solution of response.data) {
                fetchSolutionAttachments(solution.id);
            }
        } catch (error) {
            console.error('Error fetching solutions:', error);
            setError('Failed to fetch solutions');
        } finally {
            setLoading(false);
        }
    };

    const fetchSolutionAttachments = async (solutionId) => {
        try {
            const response = await getAttachments(solutionId);
            setSolutionAttachments(prev => ({
                ...prev,
                [solutionId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching attachments for solution ${solutionId}:`, error);
        }
    };

    const handleDelete = async (solutionId) => {
        if (window.confirm('Are you sure you want to delete this solution?')) {
            try {
                await deleteTicketSolution(solutionId);
                await fetchSolutions();
            } catch (error) {
                console.error('Error deleting solution:', error);
                setError('Failed to delete solution');
            }
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

    const handleDeleteAttachment = async (solutionId, attachmentId) => {
        if (window.confirm('Are you sure you want to delete this attachment?')) {
            try {
                await deleteAttachment(attachmentId);
                await fetchSolutionAttachments(solutionId);
            } catch (error) {
                console.error('Error deleting attachment:', error);
                setError('Failed to delete attachment');
            }
        }
    };

    const toggleAttachments = (solutionId) => {
        setOpenAttachments(prev => ({
            ...prev,
            [solutionId]: !prev[solutionId]
        }));
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(`/tickets/${ticketId}`)}
                        sx={{ mr: 2 }}
                    >
                        Geri
                    </Button>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Çözümler
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/tickets/${ticketId}/solutions/create`)}
                >
                    Çözüm Ekle
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Konu</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Çözüm Türü</TableCell>
                            <TableCell>Oluşturan</TableCell>
                            <TableCell>Oluşturma Tarihi</TableCell>
                            <TableCell>İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Çözüm bulunamadı
                                </TableCell>
                            </TableRow>
                        ) : (
                            solutions.map((solution) => (
                                <React.Fragment key={solution.id}>
                                    <TableRow>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleAttachments(solution.id)}
                                            >
                                                {openAttachments[solution.id] ? (
                                                    <KeyboardArrowUpIcon />
                                                ) : (
                                                    <KeyboardArrowDownIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{solution.subject}</TableCell>
                                        <TableCell>{solution.description}</TableCell>
                                        <TableCell>{solution.solutionType?.name}</TableCell>
                                        <TableCell>{solution.createdByUser?.email}</TableCell>
                                        <TableCell>
                                            {new Date(solution.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    onClick={() => navigate(`/tickets/${ticketId}/solutions/${solution.id}/edit`)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    onClick={() => handleDelete(solution.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                            <Collapse in={openAttachments[solution.id]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 1 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Dosya Ekleri
                                                    </Typography>
                                                    <List>
                                                        {solutionAttachments[solution.id]?.length > 0 ? (
                                                            solutionAttachments[solution.id].map((attachment) => (
                                                                <ListItem key={attachment.id}>
                                                                    <ListItemIcon>
                                                                        <AttachmentIcon />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={attachment.fileName} />
                                                                    <Tooltip title="İndir">
                                                                        <IconButton
                                                                            onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                                                                        >
                                                                            <DownloadIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Sil">
                                                                        <IconButton
                                                                            onClick={() => handleDeleteAttachment(solution.id, attachment.id)}
                                                                            color="error"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </ListItem>
                                                            ))
                                                        ) : (
                                                            <ListItem>
                                                                <ListItemText primary="Dosya eki bulunmamaktadır" />
                                                            </ListItem>
                                                        )}
                                                    </List>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default TicketSolutionsPage; 