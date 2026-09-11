import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;