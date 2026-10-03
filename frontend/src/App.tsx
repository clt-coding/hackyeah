import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import NanniesPage from './pages/NanniesPage';
import TopNav from './components/TopNav';
import LoginPage from './pages/LoginPage';
import './styles.css';

function App() {
  return (
    <Router>
        <TopNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/nannies" element={<NanniesPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
    </Router>
  );
}

export default App;
