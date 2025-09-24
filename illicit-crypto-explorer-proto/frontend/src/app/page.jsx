

import { useState, useEffect } from "react";
import CryptoExplorerSidebar from "../components/CryptoExplorerSidebar";
import CryptoExplorerHeader from "../components/CryptoExplorerHeader";
import Dashboard from "../components/Dashboard";
import NetworkGraph from "../components/network-graph/components/NetworkGraph";
import AddressDetail from "../components/AddressDetail";
import CaseManagement from "../components/CaseManagement";
import apiService from "../lib/api";


export default function BlockIntel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedCases, setSavedCases] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to load data from API
  const apiAddresses = await apiService.getAddresses();
        
        if (apiAddresses && apiAddresses.length > 0) {
          setAddresses(apiAddresses);
        } else {
          // Fallback to mock data if API returns no data
          setAddresses([
            {
              address: "0x653477c392c16b0765603074f157314Cc4f40c32",
              tag: "Illicit Wallet",
              category: "Darknet Markets",
              confidence: 4,
              last_seen: "2025-09-20T10:00:00Z",
              source: "Chainalysis",
              nansen_label: "Darknet Market",
              ai_classification: "Suspicious Activity",
            },
            {
              address: "0x94A1B5CdB22c43faab4AbEb5c74999895464Ddaf",
              tag: "Terror Support Wallet",
              category: "Terrorist Financing",
              confidence: 5,
              last_seen: "2025-09-21T12:30:00Z",
              source: "Elliptic",
              nansen_label: "Terrorist Support",
              ai_classification: "High Risk",
            },
            {
              address: "0x94A1B5CdB22c43faab4AbEb5c74999895464Ddaf",
              tag: "Sanctioned Entity Wallet",
              category: "Sanctioned Entities",
              confidence: 5,
              last_seen: "2025-09-22T11:45:00Z",
              source: "OFAC Database",
              nansen_label: "Sanctioned Entity",
              ai_classification: "OFAC Sanctioned Individual",
            },
          ]);
        }
      } catch (err) {
        console.log('API call failed, using mock data:', err);
        // Silently fall back to mock data - no error shown to user
        setAddresses([
          {
            address: "0x94A1B5CdB22c43faab4AbEb5c74999895464Ddaf",
            tag: "Illicit Wallet",
            category: "Darknet Markets",
            confidence: 4,
            last_seen: "2025-09-20T10:00:00Z",
            source: "Chainalysis",
            nansen_label: "Darknet Market",
            ai_classification: "Suspicious Activity",
          },
          {
            address: "0xb1C8094B234DcE6e03f10a5b673c1d8C69739A00",
            tag: "Terror Support Wallet",
            category: "Terrorist Financing",
            confidence: 5,
            last_seen: "2025-09-21T12:30:00Z",
            source: "Elliptic",
            nansen_label: "Terrorist Support",
            ai_classification: "High Risk",
          },
          {
            address: "0x1356c899D8C9467C7f71C195612F8A395aBf2f0a",
            tag: "Sanctioned Entity Wallet",
            category: "Sanctioned Entities",
            confidence: 5,
            last_seen: "2025-09-22T11:45:00Z",
            source: "OFAC Database",
            nansen_label: "Sanctioned Entity",
            ai_classification: "OFAC Sanctioned Individual",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleViewAddress = (address) => {
    setSelectedAddress(address);
    setActiveView("address-detail");
  };

  const handleSaveCase = (caseData) => {
    setSavedCases((prev) => [...prev, caseData]);
    setActiveView("cases");
  };

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading addresses...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connection Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard addresses={addresses} onViewAddress={handleViewAddress} />
        );
      case "network":
        return (
          <div className="h-full w-full bg-[#0A0A0A] text-white">
            <NetworkGraph 
              selectedNode={selectedAddress} 
              onNodeClick={handleViewAddress} 
              onNodeDoubleClick={handleViewAddress}
              filters={{ category: 'All', riskLevel: 'All' }}
              searchQuery=""
            />
          </div>
        );
      case "address-detail":
        return (
          <AddressDetail
            address={selectedAddress}
            onSaveCase={handleSaveCase}
            onBack={() => setActiveView("dashboard")}
          />
        );
      case "cases":
        return (
          <CaseManagement
            savedCases={savedCases}
            onViewAddress={handleViewAddress}
          />
        );
      default:
        return (
          <Dashboard addresses={addresses} onViewAddress={handleViewAddress} />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}
      >
        <CryptoExplorerSidebar
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onViewChange={setActiveView}
          savedCasesCount={savedCases.length}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <CryptoExplorerHeader
          onMenuClick={() => setSidebarOpen(true)}
          addresses={addresses}
          onViewAddress={handleViewAddress}
        />

        {/* Content area */}
        <div className="flex-1 overflow-hidden">{renderActiveView()}</div>
      </div>
    </div>
  );
}
