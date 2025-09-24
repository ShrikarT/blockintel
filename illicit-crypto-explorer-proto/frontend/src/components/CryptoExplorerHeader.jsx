import { useState } from "react";
import { Search, Bell, MessageCircle, Menu, Filter, ChevronDown } from "lucide-react";

export default function CryptoExplorerHeader({ onMenuClick, addresses, onViewAddress }) {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    confidence: [],
    dateRange: "all"
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const categories = ["Scam", "Drugs", "Terror", "Ransomware", "Fraud", "Money Laundering", "Exchange"];
  const confidenceLevels = [1, 2, 3, 4, 5];

  const handleSearch = (value) => {
    setSearchValue(value);
    if (value.length > 0) {
      const results = addresses.filter(addr => 
        addr.address.toLowerCase().includes(value.toLowerCase()) ||
        addr.tag.toLowerCase().includes(value.toLowerCase()) ||
        addr.category.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  return (
    <div className="h-16 bg-[#F3F3F3] dark:bg-[#1A1A1A] flex items-center justify-between px-4 md:px-6 flex-shrink-0 border-b border-[#E4E4E4] dark:border-[#404040]">
      {/* Left side - Mobile menu button and title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-all duration-150 hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] active:bg-[#EEEEEE] dark:active:bg-[#2A2A2A] active:scale-95"
        >
          <Menu size={20} className="text-[#4B4B4B] dark:text-[#B0B0B0]" />
        </button>

        <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-inter transition-all duration-300 hover:text-gray-200">
          BlockIntel
        </h1>
      </div>

      {/* Center - Search and Filters */}
      <div className="flex-1 max-w-2xl mx-4 relative">
        <div className="flex gap-2">
          {/* Search field */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search addresses, entities, or tags..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className={`w-full h-10 pl-10 pr-4 rounded-full bg-white dark:bg-[#1E1E1E] border transition-all duration-300 font-inter text-sm text-black dark:text-[#f5f5f5] placeholder-[#6E6E6E] dark:placeholder-[#a0a0a0] shadow-sm hover:shadow-md focus:shadow-lg transform focus:scale-[1.02] ${
                isSearchFocused
                  ? "border-black dark:border-white"
                  : "border-[#E5E5E5] dark:border-[#333333] hover:border-[#D0D0D0] dark:hover:border-[#444444]"
              }`}
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#6E6E6E] dark:text-[#888888]"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] rounded-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onViewAddress(result);
                      setShowSearchResults(false);
                      setSearchValue("");
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F8F8F8] dark:hover:bg-[#262626] border-b border-[#F0F0F0] dark:border-[#2A2A2A] last:border-b-0"
                  >
                    <div className="font-medium text-sm text-black dark:text-white font-jetbrains">
                      {result.address}
                    </div>
                    <div className="text-xs text-[#6E6E6E] dark:text-[#888888] mt-1">
                      {result.tag} • {result.category}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-4 rounded-full border transition-all duration-150 flex items-center gap-2 ${
              showFilters
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                : "bg-white dark:bg-[#1E1E1E] text-black dark:text-white border-[#E5E5E5] dark:border-[#333333] hover:border-[#D0D0D0] dark:hover:border-[#444444]"
            }`}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">Filters</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] rounded-lg z-40 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-sm text-black dark:text-white mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleFilter('categories', category)}
                        className="w-4 h-4 rounded border-[#D0D0D0] dark:border-[#444444]"
                      />
                      <span className="text-sm text-black dark:text-white">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Confidence Filter */}
              <div>
                <h3 className="font-medium text-sm text-black dark:text-white mb-2">Confidence</h3>
                <div className="space-y-2">
                  {confidenceLevels.map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.confidence.includes(level)}
                        onChange={() => toggleFilter('confidence', level)}
                        className="w-4 h-4 rounded border-[#D0D0D0] dark:border-[#444444]"
                      />
                      <span className="text-sm text-black dark:text-white flex items-center gap-1">
                        {Array.from({length: level}).map((_, i) => (
                          <span key={i} className="text-yellow-500">⭐</span>
                        ))}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <h3 className="font-medium text-sm text-black dark:text-white mb-2">Date Range</h3>
                <select 
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({...prev, dateRange: e.target.value}))}
                  className="w-full p-2 rounded border border-[#D0D0D0] dark:border-[#444444] bg-white dark:bg-[#2A2A2A] text-black dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#F0F0F0] dark:border-[#2A2A2A]">
              <button
                onClick={() => setFilters({ categories: [], confidence: [], dateRange: "all" })}
                className="px-4 py-2 text-sm text-[#6E6E6E] dark:text-[#888888] hover:text-black dark:hover:text-white"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right side - Action buttons and profile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Create Alert Button */}
        <button className="h-10 px-4 md:px-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 font-inter">
          <span className="hidden sm:inline">New Alert</span>
          <span className="sm:hidden">+</span>
        </button>

        {/* Notification Bell */}
        <button className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-blue-200 dark:hover:border-blue-800 transform hover:scale-110 active:scale-95 hover:shadow-lg">
          <Bell size={18} className="text-[#4B4B4B] dark:text-[#B0B0B0] transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400" />
        </button>

        {/* User Avatar */}
        <div className="relative">
          <img
            src="https://i.pravatar.cc/80"
            alt="User Avatar"
            className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-[#333333] transition-all duration-300 hover:ring-blue-200 dark:hover:ring-blue-800 hover:ring-4 cursor-pointer transform hover:scale-110 shadow-lg hover:shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}