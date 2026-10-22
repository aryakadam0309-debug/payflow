import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import Transactions from './pages/Transactions';
import AdminFraud from './pages/AdminFraud';
import Profile from './pages/Profile'; // <-- IMPORT
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/admin/fraud" element={<AdminFraud />} />
          <Route path="/profile" element={<Profile />} /> {/* <-- ADD ROUTE */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;