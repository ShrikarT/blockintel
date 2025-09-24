import { useState } from "react";
import {
  LayoutDashboard,
  Network,
  Eye,
  Bookmark,
  MessageCircle,
  Shield,
  Search
} from "lucide-react";

export default function CryptoExplorerSidebar({ onClose, activeView, onViewChange, savedCasesCount }) {
  const handleItemClick = (viewName) => {
    onViewChange(viewName);
    // Close sidebar on mobile when item is clicked
    if (onClose && typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { name: "Network Graph", icon: Network, view: "network" },
    { name: "Address Detail", icon: Eye, view: "address-detail" },
    { name: "Saved Cases", icon: Bookmark, view: "cases", badge: savedCasesCount > 0 ? savedCasesCount : null },
  ];

  return (
    <div className="w-60 bg-[#F3F3F3] dark:bg-[#1A1A1A] flex-shrink-0 flex flex-col h-full">
      {/* Brand Logo */}
      <div className="p-4 flex justify-start">
                <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#e63946] rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300 hover:bg-[#d62839]">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white font-inter transition-colors duration-300 hover:text-gray-200">
              BlockIntel
            </h1>
            <p className="text-xs text-[#a0a0a0] -mt-1 font-inter">Crypto Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;

            return (
              <div key={item.name}>
                <button
                  onClick={() => handleItemClick(item.view)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-300 font-inter ${
                    isActive
                      ? "bg-[#e63946] text-white shadow-lg transform scale-[1.02]"
                      : "text-[#a0a0a0] hover:bg-white/50 dark:hover:bg-white/10 hover:text-[#333] dark:hover:text-[#f5f5f5] hover:transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "text-black dark:text-white"
                          : "text-black/70 dark:text-white/70"
                      }
                    />
                    <span
                      className={`font-medium text-sm font-plus-jakarta ${
                        isActive
                          ? "text-black dark:text-white"
                          : "text-black/70 dark:text-white/70"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Utility Actions */}
      <div className="p-4">
        <button className="w-10 h-10 bg-white dark:bg-[#262626] rounded-full border border-[#DADADA] dark:border-[#404040] flex items-center justify-center transition-all duration-200 hover:bg-[#F8F8F8] dark:hover:bg-[#2A2A2A] hover:border-[#C0C0C0] dark:hover:border-[#505050] active:bg-[#F0F0F0] dark:active:bg-[#333333] active:scale-95">
          <MessageCircle
            size={18}
            className="text-black/70 dark:text-white/70"
          />
        </button>
      </div>
    </div>
  );
}