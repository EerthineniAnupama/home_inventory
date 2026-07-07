import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import AddItem from './pages/AddItem.jsx';
import EditItem from './pages/EditItem.jsx';
import ItemDetails from './pages/ItemDetails.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes - ProtectedRoute checks auth AND renders Sidebar/Navbar via <Outlet /> */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/add" element={<AddItem />} />
        <Route path="/inventory/:id/edit" element={<EditItem />} />
        <Route path="/inventory/:id" element={<ItemDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;