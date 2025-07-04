import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ProductDetails from "./components/ProductDetails";
import ModeratorDashboard from "./components/ModeratorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/moderator" element={<ModeratorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
