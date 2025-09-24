import { useState } from "react";
import {
  Bookmark,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Search,
  Filter,
  Star,
} from "lucide-react";

export default function CaseManagement({ savedCases, onViewAddress }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("savedAt");
  const [selectedCases, setSelectedCases] = useState(new Set());

  const filteredCases = savedCases
    .filter((caseItem) => {
      const matchesSearch =
        caseItem.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.tag.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterCategory === "all" || caseItem.category === filterCategory;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "savedAt":
          return new Date(b.savedAt) - new Date(a.savedAt);
        case "confidence":
          return b.confidence - a.confidence;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const categories = ["all", ...new Set(savedCases.map((c) => c.category))];

  const getCategoryIcon = (category) => {
    const icons = {
      Scam: "⚠️",
      Drugs: "💊",
      Terror: "💣",
      Ransomware: "🔒",
      Fraud: "🕵️",
      "Money Laundering": "💰",
      Exchange: "🏢",
      "Terrorist Financing": "🏴‍☠️",
      "Sanctioned Entities": "🚫",
      "Illicit Address": "🔴",
      "Abnormal Cross Chain Transactions": "🔗",
    };
    return icons[category] || "🔍";
  };

  const getCategoryColor = (category) => {
    const colors = {
      Scam: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      Drugs:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      Terror:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      Ransomware:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      Fraud:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      "Money Laundering":
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      Exchange:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      "Terrorist Financing":
        "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300",
      "Sanctioned Entities":
        "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-300",
      "Illicit Address":
        "bg-red-100 text-red-900 dark:bg-red-900/25 dark:text-red-400",
      "Abnormal Cross Chain Transactions":
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    );
  };

  const toggleCaseSelection = (caseId) => {
    setSelectedCases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  };

  const selectAllCases = () => {
    if (selectedCases.size === filteredCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(filteredCases.map((c) => c.address)));
    }
  };

  const exportSelected = (format) => {
    const selectedData = filteredCases.filter((c) =>
      selectedCases.has(c.address),
    );

    if (format === "json") {
      const dataStr = JSON.stringify(selectedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `crypto-investigation-cases-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = [
        "Address",
        "Tag",
        "Category",
        "Confidence",
        "Last Seen",
        "Saved At",
        "Source",
      ];
      const csvData = selectedData.map((c) => [
        c.address,
        c.tag,
        c.category,
        c.confidence,
        c.last_seen,
        c.savedAt,
        c.source,
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `crypto-investigation-cases-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    }
  };

  const deleteSelected = () => {
    // In a real app, this would call an API to delete the cases
    console.log("Delete selected cases:", Array.from(selectedCases));
    setSelectedCases(new Set());
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#F3F3F3] dark:bg-[#0A0A0A] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] lg:text-[30px] font-semibold leading-[110%] text-white font-inter animate-fade-in">
            BlockIntel Investigation Cases
          </h2>
          <p className="text-[#a0a0a0] mt-1 font-inter">
            {filteredCases.length} cases saved for review
          </p>
        </div>

        {selectedCases.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => exportSelected("json")}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Export JSON
            </button>

            <button
              onClick={() => exportSelected("csv")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 text-sm"
            >
              <FileText size={16} />
              Export CSV
            </button>

            <button
              onClick={deleteSelected}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]"
            />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-white dark:bg-[#111111] text-black dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:border-blue-500 transition-all duration-300 hover:shadow-md focus:shadow-lg transform focus:scale-[1.02]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-white dark:bg-[#111111] text-black dark:text-white focus:border-blue-500 transition-colors"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-white dark:bg-[#111111] text-black dark:text-white focus:border-blue-500 transition-colors"
          >
            <option value="savedAt">Sort by Date Saved</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="category">Sort by Category</option>
          </select>

          {/* Select All */}
          <button
            onClick={selectAllCases}
            className="px-4 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-[#F9FAFB] dark:hover:bg-[#262626] transition-colors text-sm"
          >
            {selectedCases.size === filteredCases.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-12 text-center">
          <Bookmark
            size={48}
            className="text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-4"
          />
          <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            No saved cases yet
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Start investigating addresses with BlockIntel and save cases for later review
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
          <div className="divide-y divide-[#F0F0F0] dark:divide-[#2A2A2A]">
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem.address}
                className={`p-6 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors ${
                  selectedCases.has(caseItem.address)
                    ? "bg-blue-50 dark:bg-blue-900/10"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedCases.has(caseItem.address)}
                    onChange={() => toggleCaseSelection(caseItem.address)}
                    className="w-4 h-4 rounded border-[#D1D5DB] dark:border-[#404040] text-blue-500 focus:ring-blue-500"
                  />

                  {/* Category Icon */}
                  <div className="text-2xl">
                    {getCategoryIcon(caseItem.category)}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-black dark:text-white mb-1">
                          {caseItem.tag}
                        </h3>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-jetbrains">
                          {caseItem.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(caseItem.category)}`}
                        >
                          {caseItem.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span>{caseItem.confidence}/5 confidence</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          Saved{" "}
                          {new Date(caseItem.savedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        Last seen:{" "}
                        {new Date(caseItem.last_seen).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewAddress(caseItem)}
                      className="p-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 transform hover:scale-110 active:scale-95"
                      title="View Details"
                    >
                      <Eye
                        size={16}
                        className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                      />
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://etherscan.io/address/${caseItem.address}`,
                          "_blank",
                        )
                      }
                      className="p-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 transform hover:scale-110 active:scale-95"
                      title="View on Etherscan"
                    >
                      <FileText
                        size={16}
                        className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredCases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Total Cases
            </h3>
            <p className="text-2xl font-bold text-black dark:text-white">
              {filteredCases.length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              High Risk Cases
            </h3>
            <p className="text-2xl font-bold text-red-500">
              {filteredCases.filter((c) => c.confidence >= 4).length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Categories
            </h3>
            <p className="text-2xl font-bold text-blue-500">
              {new Set(filteredCases.map((c) => c.category)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
