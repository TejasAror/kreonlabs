import { Routes, Route } from "react-router";
import './App.css'

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RegisterAsset from "./pages/main/RegisterAsset";
import VerifyC2PA from "./pages/main/VerifyC2PA";
import EmbedWatermark from "./pages/main/EmbedWatermark";
import AddC2PA from "./pages/main/AddC2PA";
import RegisterOnStory from "./pages/main/RegisterOnStory";
import C2PALanding from "./pages/C2PA/C2PALanding";
import WatermarkingLanding from "./pages/Watermarking/WatermarkingLanding";
import Scanner from "./pages/Scanner";
import DMCA from "./pages/DMCA";

function App() {
  return(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Main flow paths*/}
      <Route path="/register-asset" element={<RegisterAsset />} />
      <Route path="/verify-c2pa/" element={<VerifyC2PA/>} />
      <Route path="/embed-watermark/" element={<EmbedWatermark/>} />
      <Route path="/add-c2pa/" element={<AddC2PA/>} />
      <Route path="/register-on-story/" element={<RegisterOnStory/>} />

      {/*Scanners Paths */}
      <Route path="/scanners/" element={<Scanner/>} />
      <Route path="/dmca/" element={<DMCA/>} />

      {/*C2PA Paths */}
      <Route path="/c2pa/" element={<C2PALanding/>}>
      
      </Route>

      {/*Watermarking Paths */}
      <Route path="/watermarking/" element={<WatermarkingLanding/>}>
      
      </Route>

    </Routes>
  )
}

export default App
