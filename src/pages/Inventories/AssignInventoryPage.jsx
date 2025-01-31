import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Autocomplete,
    Alert,
    Container,
} from '@mui/material';
import { getInventories, assignUser } from '../../api/InventoryService';
import { getUsers } from '../../api/UserService';
import { useNavigate } from 'react-router-dom';

function AssignInventoryPage() {
    const [inventories, setInventories] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadInventories();
        loadUsers();
    }, []);

    const loadInventories = async () => {
        try {
            const response = await getInventories();
            setInventories(response.data);
        } catch (err) {
            setError('Failed to load inventories');
        }
    };

    const loadUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedInventory || !selectedUser) {
            setError('Please select both inventory and user');
            return;
        }

        try {
            await assignUser(selectedInventory.id, selectedUser.id, notes);
            setSuccess('Inventory assigned successfully');
            setTimeout(() => {
                navigate('/inventories');
            }, 2000);
        } catch (err) {
            setError('Failed to assign inventory');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    Envanter Ata
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
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
                            <Autocomplete
                                options={users}
                                getOptionLabel={(user) => user.email}
                                value={selectedUser}
                                onChange={(event, newValue) => setSelectedUser(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select User"
                                        required
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                multiline
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/inventories')}
                                    sx={{ 
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ 
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    Assign Inventory
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default AssignInventoryPage; 