// For the home page, create a new file or inline it:
import React from 'react'
import { Typography, Box, Button } from '@mui/material'
import { Link } from 'react-router-dom'

function HomePage() {
    return (
        <Box
            sx={{
                textAlign: 'center',
                padding: 4,
            }}
        >
            <Typography variant="h3" gutterBottom>
                Welcome to Inventory Management
            </Typography>
            <Typography variant="body1" gutterBottom>
                Easily manage your companies, inventories, tickets, and users here!
            </Typography>
            <Link to="/companies" style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ mt: 2 }}>
                    Get Started
                </Button>
            </Link>
        </Box>
    )
}

export default HomePage
