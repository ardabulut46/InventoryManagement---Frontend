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
import CreateTicketSolutionPage from './pages/Tickets/CreateTicketSolutionPage'
import EditTicketSolutionPage from './pages/Tickets/EditTicketSolutionPage'
import TicketSolutionsPage from './pages/Tickets/TicketSolutionsPage'
import UploadInvoicePage from './pages/Inventories/UploadInvoicePage'
import AdminPage from './pages/Admin/AdminPage'
import MyCreatedTicketsPage from './pages/Tickets/MyCreatedTicketsPage'
import IdleBreachTicketsPage from './pages/Tickets/IdleBreachTicketsPage'
import DepartmentTicketsPage from './pages/Tickets/DepartmentTicketsPage'
import InventoryDetailPage from './pages/Inventories/InventoryDetailPage'
import AssignedTicketsPage from './pages/Tickets/AssignedTicketsPage'
import WarrantyStatusPage from './pages/Inventories/WarrantyStatusPage'
import DepartmentsPage from './pages/Departments/DepartmentsPage'
import GroupsPage from './pages/Groups/GroupsPage'
import TicketSettingsPage from './pages/Admin/TicketSettingsPage'
import SolutionTimesPage from './pages/Admin/SolutionTimesPage'
import ProblemTypesPage from './pages/Admin/ProblemTypesPage'
import SolutionTypesPage from './pages/Admin/SolutionTypesPage'
import AssignmentTimesPage from './pages/Admin/AssignmentTimesPage'
import MyTicketsPage from './pages/Tickets/MyTicketsPage'
import CompanySettingsPage from './pages/Admin/CompanySettingsPage'
import RolesPage from './pages/Admin/RolesPage'

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
                            {/* <Route path="/companies" element={<CompaniesPage />} />
                            <Route path="/companies/create" element={<CreateCompanyPage />} />
                            <Route path="/companies/edit/:id" element={<EditCompanyPage />} /> */}

                            {/* INVENTORIES */}
                            <Route path="/inventories" element={<InventoriesPage />} />
                            <Route path="/inventories/create" element={<CreateInventoryPage />} />
                            <Route path="/inventories/edit/:id" element={<EditInventoryPage />} />
                            <Route path="/inventories/assign" element={<AssignInventoryPage />} />
                            <Route path="/inventories/upload-invoice" element={<UploadInvoicePage />} />
                            <Route path="/inventories/detail/:id" element={<InventoryDetailPage />} />
                            <Route path="/inventories/warranty-status" element={<WarrantyStatusPage />} />

                            {/* TICKETS */}
                            <Route path="/tickets" element={<TicketsPage />} />
                            <Route path="/tickets/create" element={<CreateTicketPage />} />
                            <Route path="/tickets/edit/:id" element={<EditTicketPage />} />
                            <Route path="/tickets/:id" element={<TicketDetailPage />} />
                            <Route path="/tickets/:id/history" element={<TicketHistoryPage />} />
                            <Route path="/tickets/:id/solutions" element={<TicketSolutionsPage />} />
                            <Route path="/tickets/:id/solutions/create" element={<CreateTicketSolutionPage />} />
                            <Route path="/tickets/:id/solutions/edit/:solutionId" element={<EditTicketSolutionPage />} />
                            <Route path="/tickets/my-created-tickets" element={<MyCreatedTicketsPage />} />
                            <Route path="/tickets/my-tickets" element={<MyTicketsPage />} />
                            <Route path="/tickets/idle-breach" element={<IdleBreachTicketsPage />} />
                            <Route path="/tickets/department" element={<DepartmentTicketsPage />} />
                            <Route path="/tickets/assigned" element={<AssignedTicketsPage />} />

                            {/* PROFILE */}
                            <Route path="/profile" element={<MyProfilePage />} />

                            {/* ADMIN */}
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/roles" element={<RolesPage />} />
                            <Route path="/admin/users" element={<UsersPage />} />
                            <Route path="/admin/users/create" element={<CreateUserPage />} />
                            <Route path="/admin/users/edit/:id" element={<EditUserPage />} />
                            <Route path="/admin/company-settings" element={<CompanySettingsPage />} />
                            <Route path="/admin/companies" element={<CompaniesPage />} />
                            <Route path="/admin/companies/create" element={<CreateCompanyPage />} />
                            <Route path="/admin/companies/edit/:id" element={<EditCompanyPage />} />
                            <Route path="/admin/departments" element={<DepartmentsPage />} />
                            <Route path="/admin/groups" element={<GroupsPage />} />
                            <Route path="/admin/ticket-settings" element={<TicketSettingsPage />} />
                            <Route path="/admin/ticket-settings/solution-times" element={<SolutionTimesPage />} />
                            <Route path="/admin/ticket-settings/problem-types" element={<ProblemTypesPage />} />
                            <Route path="/admin/ticket-settings/solution-types" element={<SolutionTypesPage />} />
                            <Route path="/admin/ticket-settings/assignment-times" element={<AssignmentTimesPage />} />
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
