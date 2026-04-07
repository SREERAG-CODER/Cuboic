import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import GlobalDashboard from './pages/GlobalDashboard';
import AlertConsole from './pages/AlertConsole';
import FleetMonitor from './pages/FleetMonitor';

// Temporary placeholders for missing pages
const RestaurantsPage = () => <div className="scifi-page"><h2>Restaurant Matrix</h2><p>Coming Soon...</p></div>;
const LogsPage = () => <div className="scifi-page"><h2>Neural Log Archives</h2><p>Coming Soon...</p></div>;

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            element={
                                <ProtectedRoute role="Admin">
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<GlobalDashboard />} />
                            <Route path="/alerts" element={<AlertConsole />} />
                            <Route path="/fleet" element={<FleetMonitor />} />
                            <Route path="/restaurants" element={<RestaurantsPage />} />
                            <Route path="/logs" element={<LogsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}
