import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/home-page/home-page';
import MapPage from './pages/map-page/map-page';
import NanniesPage from './pages/nannies-page/nannies-page';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="topbar">
          <div className="logo">
            <span className="logo-icon">❤️</span> <strong>MomWork</strong>
          </div>
          <nav className="nav-links">
            <Link to="/">Główna</Link>
            <Link to="/map">Mapa</Link>
            <Link to="/nannies">Nianie</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/nannies" element={<NanniesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
