import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';

// Import your pages
import CompaniesPage from './pages/Companies/CompaniesPage'
import CreateCompanyPage from './pages/Companies/CreateCompanyPage'
import EditCompanyPage from './pages/Companies/EditCompanyPage'
import InventoriesPage from './pages/Inventories/InventoriesPage'
import CreateInventoryPage from './pages/Inventories/CreateInventoryPage'
import EditInventoryPage from './pages/Inventories/EditInventoryPage'
import AssignInventoryPage from './pages/Inventories/AssignInventoryPage'
import TicketsPage from './pages/Tickets/TicketsPage'
import CreateTicketPage from './pages/Tickets/CreateTicketPage'
import EditTicketPage from './pages/Tickets/EditTicketPage'
import TicketDetailPage from './pages/Tickets/TicketDetailPage'
import TicketHistoryPage from './pages/Tickets/TicketHistoryPage'
import UsersPage from './pages/Users/UsersPage'
import CreateUserPage from './pages/Users/CreateUserPage'
import EditUserPage from './pages/Users/EditUserPage'
import DashboardPage from './pages/DashboardPage'
import MyProfilePage from './pages/MyProfilePage'
import GroupsPage from './pages/Groups/GroupsPage'
import CreateTicketSolutionPage from './pages/Tickets/CreateTicketSolutionPage'
import EditTicketSolutionPage from './pages/Tickets/EditTicketSolutionPage'
import TicketSolutionsPage from './pages/Tickets/TicketSolutionsPage'
import UploadInvoicePage from './pages/Inventories/UploadInvoicePage'
import AdminPage from './pages/Admin/AdminPage'

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Public Route component (for login page)
const PublicRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <CssBaseline />
                <Router>
                    <Routes>
                        {/* Public route (Login) */}
                        <Route 
                            path="/login" 
                            element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            } 
                        />
                        
                        {/* Protected routes */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/" element={<DashboardPage />} />
                            
                            {/* COMPANIES */}
                            <Route path="/companies" element={<CompaniesPage />} />
                            <Route path="/companies/create" element={<CreateCompanyPage />} />
                            <Route path="/companies/edit/:id" element={<EditCompanyPage />} />

                            {/* INVENTORIES */}
                            <Route path="/inventories" element={<InventoriesPage />} />
                            <Route path="/inventories/create" element={<CreateInventoryPage />} />
                            <Route path="/inventories/edit/:id" element={<EditInventoryPage />} />
                            <Route path="/inventories/assign" element={<AssignInventoryPage />} />
                            <Route path="/inventories/upload-invoice" element={<UploadInvoicePage />} />

                            {/* TICKETS */}
                            <Route path="/tickets" element={<TicketsPage />} />
                            <Route path="/tickets/create" element={<CreateTicketPage />} />
                            <Route path="/tickets/edit/:id" element={<EditTicketPage />} />
                            <Route path="/tickets/:id" element={<TicketDetailPage />} />
                            <Route path="/tickets/:id/history" element={<TicketHistoryPage />} />
                            <Route path="/tickets/:id/solutions" element={<TicketSolutionsPage />} />
                            <Route path="/tickets/:id/solutions/create" element={<CreateTicketSolutionPage />} />
                            <Route path="/tickets/:id/solutions/edit/:solutionId" element={<EditTicketSolutionPage />} />

                            {/* USERS */}
                            <Route path="/users" element={<UsersPage />} />
                            <Route path="/users/create" element={<CreateUserPage />} />
                            <Route path="/users/edit/:id" element={<EditUserPage />} />

                            {/* GROUPS */}
                            <Route path="/groups" element={<GroupsPage />} />

                            {/* PROFILE */}
                            <Route path="/profile" element={<MyProfilePage />} />

                            {/* ADMIN */}
                            <Route path="/admin" element={<AdminPage />} />
                        </Route>

                        {/* Catch all other routes and redirect to login if not authenticated */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App
