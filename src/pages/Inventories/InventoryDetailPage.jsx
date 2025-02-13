import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stack
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getInventoryById, downloadInvoice, getAssignmentHistory } from '../../api/InventoryService';

const statusColors = {
  'Müsait': 'success',
  'Kullanımda': 'primary',
  'Bakımda': 'warning',
  'Emekli': 'error',
  'Kayıp': 'error',
};

const CURRENCY_MAP = {
  1: 'TRY',
  2: 'USD',
  3: 'EUR'
};

const InventoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [inventory, setInventory] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInventoryById(id);
        setInventory(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Error fetching inventory details.');
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await getAssignmentHistory(id);
        setHistory(response.data);
      } catch (err) {
        console.error('Error loading assignment history:', err);
      }
    };

    fetchData();
    fetchHistory();
  }, [id]);

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      const response = await downloadInvoice(inventory.id);
      let filename = `invoice_${inventory.id}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!inventory) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={2}>
            <LinearProgress />
            <Typography align="center" color="text.secondary">Envanter detayları yükleniyor...</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/inventories')}
          sx={{ mb: 2 }}
        >
          Envanterlere Dön
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Main Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
              >
                Envanter Detayları
              </Typography>
              <Button
                component={Link}
                to={`/inventories/edit/${inventory.id}`}
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Envanteri Düzenle
              </Button>
            </Box>

            {/* Basic Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Temel Bilgiler
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Barkod</Typography>
                  <Typography>{inventory.barcode || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Seri Numarası</Typography>
                  <Typography>{inventory.serialNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Marka & Model</Typography>
                  <Typography>{inventory.brand} {inventory.model}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tür</Typography>
                  <Typography>{inventory.type || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Aile</Typography>
                  <Typography>{inventory.family || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Status and Assignment */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Durum ve Atama
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                  <Chip
                    label={inventory.status}
                    color={statusColors[inventory.status] || 'default'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Atanan Kullanıcı</Typography>
                  <Typography>{inventory.assignedUser?.email || 'Atanmamış'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Departman</Typography>
                  <Typography>{inventory.department?.name || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Location Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Konum Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Konum</Typography>
                  <Typography>{inventory.location || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Oda</Typography>
                  <Typography>{inventory.room || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Kat</Typography>
                  <Typography>{inventory.floor || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Blok</Typography>
                  <Typography>{inventory.block || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Purchase Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Satın Alma Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Satın Alma Fiyatı</Typography>
                  <Typography>
                    {inventory.purchasePrice ? `${inventory.purchasePrice.toLocaleString()} ${CURRENCY_MAP[inventory.purchaseCurrency] || '-'}` : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Warranty and Support */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Garanti ve Destek
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Garanti Süresi</Typography>
                  <Typography>
                    {inventory.warrantyStartDate ? `${formatDate(inventory.warrantyStartDate)} - ${formatDate(inventory.warrantyEndDate)}` : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tedarikçi</Typography>
                  <Typography>{inventory.supplier || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Destek Şirketi</Typography>
                  <Typography>{inventory.supportCompany?.name || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Invoice Section */}
            {inventory.invoiceAttachmentPath && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                  Fatura
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography>{inventory.invoiceAttachmentPath.split('/').pop()}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadInvoice}
                    disabled={isDownloading}
                    sx={{ borderRadius: 1, textTransform: 'none', minWidth: 'auto' }}
                  >
                    {isDownloading ? 'İndiriliyor...' : 'Faturayı İndir'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Dates */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Tarihler
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Oluşturulma Tarihi</Typography>
                  <Typography>{new Date(inventory.createdDate).toLocaleString()}</Typography>
                </Grid>
                {inventory.updatedDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Son Güncelleme</Typography>
                    <Typography>{new Date(inventory.updatedDate).toLocaleString()}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Assignment History */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main, mb: 2 }}>
              Atama Geçmişi
            </Typography>
            {history && history.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Kullanıcı</TableCell>
                      <TableCell>Atama Tarihi</TableCell>
                      <TableCell>İade Tarihi</TableCell>
                      <TableCell>Notlar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.user?.email}</TableCell>
                        <TableCell>{new Date(item.assignmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : <Chip label="Aktif" color="primary" size="small" />}</TableCell>
                        <TableCell>{item.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Atama geçmişi bulunamadı.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InventoryDetailPage; 