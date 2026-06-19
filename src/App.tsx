import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ColorVisualizer from './pages/ColorVisualizer';
import FurniturePlacement from './pages/FurniturePlacement';
import ThemeRecommendation from './pages/ThemeRecommendation';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/color-visualizer" element={<ColorVisualizer />} />
          <Route path="/furniture-placement" element={<FurniturePlacement />} />
          <Route path="/theme-recommendation" element={<ThemeRecommendation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
