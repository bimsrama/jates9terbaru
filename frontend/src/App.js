import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import HealthQuiz from "./pages/HealthQuiz";
import Challenge from "./pages/Challenge";
import ProductPage from "./pages/ProductPage";
import AIChat from "./pages/AIChat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword"; // [BARU] Import ForgotPassword

// User Dashboard Pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import HealthReport from "./pages/dashboard/HealthReport";
import DailyCheckin from "./pages/dashboard/DailyCheckin";
import Affiliate from "./pages/dashboard/Affiliate";
import Withdrawal from "./pages/dashboard/Withdrawal";
import ArticlePage from "./pages/ArticlePage"; 

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import PurchaseVerification from "./pages/admin/PurchaseVerification";
import WithdrawalManagement from "./pages/admin/WithdrawalManagement";
import Broadcast from "./pages/admin/Broadcast"; 

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navigation /><LandingPage /></>} />
            <Route path="/quiz" element={<><Navigation /><HealthQuiz /></>} />
            <Route path="/challenge" element={<><Navigation /><Challenge /></>} />
            <Route path="/product" element={<><Navigation /><ProductPage /></>} />
            <Route path="/chat" element={<><Navigation /><AIChat /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* [BARU] Route Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* [BARU] Route untuk Artikel (Bisa diakses publik atau user login) */}
            <Route path="/article/:id" element={<ArticlePage />} />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/health-report" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HealthReport />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/checkin" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DailyCheckin />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/affiliate" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Affiliate />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/withdrawal" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Withdrawal />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/purchases" element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <PurchaseVerification />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/withdrawals" element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <WithdrawalManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/broadcast" element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <Broadcast />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
