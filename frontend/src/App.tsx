import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import NanniesPage from './pages/Nannies';
import TopNav from './components/TopNav';
import './styles.css';

function App() {
  return (
    <Router>
        <TopNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/nannies" element={<NanniesPage />} />
        </Routes>
    </Router>
  );
}

export default App;
