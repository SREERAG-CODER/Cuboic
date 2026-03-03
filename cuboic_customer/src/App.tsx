import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackerPage } from './pages/OrderTrackerPage';
import { CheckoutPage } from './pages/CheckoutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:orderId" element={<OrderTrackerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

