import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./components/Common/WalletConnect";
import Navigation from "./components/Common/Navigation";

// Pages
import Home from "./pages/Home";
import Write from "./pages/Write";
import Article from "./pages/Article";
import Profile from "./pages/Profile";
import NFTMarketplace from "./components/NFT/NFTMarketplace";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <WalletProvider>
          <div className="min-h-screen bg-gray-900">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/write" element={<Write />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/author/:walletAddress" element={<Profile />} />
              <Route path="/nft-marketplace" element={<NFTMarketplace />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </div>
        </WalletProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
