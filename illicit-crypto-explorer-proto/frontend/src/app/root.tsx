import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CryptoExplorer from "./page";
import "./global.css";

export default function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CryptoExplorer />} />
      </Routes>
    </Router>
  );
}