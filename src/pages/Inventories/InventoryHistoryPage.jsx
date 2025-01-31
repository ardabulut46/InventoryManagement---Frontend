import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getAllAssignmentHistory } from '../../api/InventoryService';

function InventoryHistoryPage() {
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        loadHistoryData();
    }, []);

    const loadHistoryData = async () => {
        try {
            const response = await getAllAssignmentHistory();
            setHistoryData(response.data);
        } catch (err) {
            console.error('Error loading assignment history:', err);
        }
    };

    return (
        <Box component={Paper} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Inventory Assignment History
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Inventory Item</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Assignment Date</TableCell>
                            <TableCell>Return Date</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {historyData.map((history) => (
                            <TableRow key={history.id}>
                                <TableCell>
                                    <Link 
                                        component={RouterLink} 
                                        to={`/inventories/edit/${history.inventory?.id}`}
                                        sx={{ textDecoration: 'none' }}
                                    >
                                        {history.inventory?.barcode} - {history.inventory?.model}
                                    </Link>
                                </TableCell>
                                <TableCell>{history.user?.email}</TableCell>
                                <TableCell>
                                    {new Date(history.assignmentDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {history.returnDate 
                                        ? new Date(history.returnDate).toLocaleDateString()
                                        : <Chip label="Active" color="primary" size="small" />
                                    }
                                </TableCell>
                                <TableCell>{history.notes || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default InventoryHistoryPage; 