import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Bistro from './pages/Bistro';
import Home from './pages/Home';
import Loja from './pages/Loja';
import Rustichella from './pages/Rustichella';
import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/a-loja" element={<Loja />} />
        <Route path="/bistro" element={<Bistro />} />
        {/* URL curta de proposito: e ela que vai na bio do Instagram, no
            cartao impresso e na boca dos garcons. */}
        <Route path="/rustichella" element={<Rustichella />} />
        <Route path="/bistro/rustichella" element={<Rustichella />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
