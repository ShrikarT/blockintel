import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import NetworkGraph from './components/NetworkGraph';
import AddressDetail from './components/AddressDetail';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/graph" element={<NetworkGraph />} />
        <Route path="/address/:id" element={<AddressDetail />} />
      </Routes>
    </AuthProvider>
  );
}
