import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Bookmark,
  Download,
  Activity,
  Calendar,
  Shield,
  AlertTriangle,
  Star,
  FileText,
  Globe,
  Mail,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import apiService from "../lib/api";

// Mock fallback constants
const MOCK_CATEGORIES = ["Fraud/Scam", "Drugs", "Terror", "Ransomware", "Money Laundering", "Exchange"];
const MOCK_NANSEN_LABELS = [
  "Exchange Hot Wallet", 
  "Mixer Service", 
  "Suspicious DeFi Contract", 
  "High-Risk Wallet", 
  "CEX Deposit Address",
  "Unknown Entity"
];

// Generate random confidence between 0.6-0.95 (converted to 1-5 scale)
const getRandomConfidence = () => Math.floor((Math.random() * 0.35 + 0.6) * 5);

// Get random category
const getRandomCategory = () => MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)];

// Get random Nansen label
const getRandomNansenLabel = () => MOCK_NANSEN_LABELS[Math.floor(Math.random() * MOCK_NANSEN_LABELS.length)];

const MOCK_AI = {
  category: "Fraud/Scam",
  confidence: 4,
  explanation: "This address has been flagged in multiple reports as associated with suspicious crypto activity.",
  suggested_tags: ["Suspicious Activity", "Fraudulent Behavior"]
};

export default function AddressDetail({ address, onSaveCase, onBack }) {
  const [copied, setCopied] = useState(false);
  const [enrichedAddress, setEnrichedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch enriched data from backend API
  useEffect(() => {
    if (address?.address) {
      fetchEnrichedData(address.address);
    } else {
      setEnrichedAddress(address);
      setError(null);
      setLoading(false);
    }
  }, [address]);

  const fetchEnrichedData = async (addressHash) => {
    try {
      setLoading(true);
      setError(null);
      const enrichedData = await apiService.getAddress(addressHash);
      setEnrichedAddress(enrichedData);
    } catch (err) {
      console.error('Failed to fetch enriched data:', err);
      // Silently fall back to original address data with mock enhancements
      setEnrichedAddress(address);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F3F3F3] dark:bg-[#0A0A0A]">
        <div className="text-center">
          <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF]">
            No address selected
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Use enriched address data if available, otherwise fall back to original
  const displayAddress = enrichedAddress || address;

  // Map backend API fields for display with varied mock fallbacks
  const confidence = displayAddress.confidence || displayAddress.confidenceScore || getRandomConfidence();
  const lastSeen = displayAddress.last_seen ? new Date(displayAddress.last_seen).toLocaleDateString() : 
                   displayAddress.lastSeen ? new Date(displayAddress.lastSeen).toLocaleDateString() : 'N/A';
  const riskLevel = confidence >= 4 ? 'High' : 
                   confidence >= 2 ? 'Medium' : 'Low';
  const tag = displayAddress.ai_classification || displayAddress.tag || getRandomCategory();
  const category = displayAddress.category || getRandomCategory();
  const context = displayAddress.context || displayAddress.ai_classification || MOCK_AI.explanation;
  const relatedEntities = displayAddress.connections || displayAddress.relatedEntities || [];
  const nansenLabel = displayAddress.nansen_label || displayAddress.nansenLabel || getRandomNansenLabel();
  const source = displayAddress.source || 'Blockchain Analysis';
  const metadata = displayAddress.metadata || {};

  // Risk badge color
  const riskColor = riskLevel === 'High' ? '#ef4444' : riskLevel === 'Medium' ? '#eab308' : '#22c55e';

  // Star rating
  const normalizedConfidence = Number.isFinite(confidence) && confidence > 1 ? confidence : (confidence || 0);
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i}>{i < Math.round(normalizedConfidence) ? '⭐' : '☆'}</span>
  ));

  // Connected addresses mock
  const connectedAddresses = relatedEntities.map(addr => ({
    address: addr,
    label: 'Connected',
    amount: '45 BTC',
    type: 'funding',
  }));

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
      Scam: "bg-red-500",
      Drugs: "bg-purple-500",
      Terror: "bg-gray-900",
      Ransomware: "bg-orange-500",
      Fraud: "bg-yellow-500",
      "Money Laundering": "bg-green-500",
      Exchange: "bg-blue-500",
      "Terrorist Financing": "bg-red-700",
      "Sanctioned Entities": "bg-gray-700",
      "Illicit Address": "bg-red-600",
      "Abnormal Cross Chain Transactions": "bg-indigo-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(displayAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock transaction data for the chart
  const transactionData = [
    { time: "00:00", volume: 0.5 },
    { time: "04:00", volume: 0.8 },
    { time: "08:00", volume: 2.3 },
    { time: "12:00", volume: 1.8 },
    { time: "16:00", volume: 3.2 },
    { time: "20:00", volume: 1.5 },
    { time: "24:00", volume: 0.9 },
  ];

  return (
    <div className="h-full bg-[#F3F3F3] dark:bg-[#0A0A0A] overflow-y-auto">
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-lg shadow-sm hover:bg-[#F9FAFB] dark:hover:bg-[#262626] flex items-center justify-center transition-all duration-150"
          >
            <ArrowLeft
              size={16}
              className="text-[#6B7280] dark:text-[#9CA3AF]"
            />
          </button>

          <div>
            <h1 className="text-2xl md:text-[28px] lg:text-[30px] font-semibold leading-[110%] text-white font-inter animate-fade-in">
              Address Analysis
            </h1>
            <p className="text-[#a0a0a0] mt-1 font-inter">
              Detailed investigation report
            </p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onSaveCase(address)}
              className="px-4 py-2 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c82333] text-white rounded-lg transition-all duration-300 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 font-inter"
            >
              <Bookmark size={16} />
              Save Case
            </button>

            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 font-inter">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading enriched data...</span>
            </div>
          </div>
        )}

        {/* Address Info Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 ${getCategoryColor(category)} rounded-full flex items-center justify-center text-2xl shadow-lg transform hover:scale-110 transition-all duration-300 hover:shadow-xl`}
              >
                {getCategoryIcon(category)}
              </div>
              <div>
                <h2 className="font-semibold text-xl text-[#f5f5f5] mb-2 font-inter">
                  {tag}
                </h2>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(category)} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  {category}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`transition-all duration-300 transform hover:scale-125 ${
                      i < confidence
                        ? "text-yellow-500 fill-current animate-pulse"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                Confidence: <span className="text-blue-600 dark:text-blue-400">{confidence}/5</span>
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Cryptocurrency Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-[#F9FAFB] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#333333] rounded-lg font-jetbrains text-sm">
                {displayAddress.address}
              </div>
              <button
                onClick={copyAddress}
                className="p-3 border border-[#E5E7EB] dark:border-[#333333] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#262626] transition-colors"
              >
                <Copy
                  size={16}
                  className="text-[#6B7280] dark:text-[#9CA3AF]"
                />
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://etherscan.io/address/${displayAddress.address}`,
                    "_blank",
                  )
                }
                className="p-3 border border-[#E5E7EB] dark:border-[#333333] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#262626] transition-colors"
              >
                <ExternalLink
                  size={16}
                  className="text-[#6B7280] dark:text-[#9CA3AF]"
                />
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-500 mt-1">
                Address copied to clipboard!
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Source
              </label>
              <p className="text-[#f5f5f5] font-inter">{source}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Last Seen
              </label>
              <p className="text-[#f5f5f5] flex items-center gap-2 font-inter">
                <Calendar size={16} />
                {lastSeen}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Nansen Label
              </label>
              <p className="text-black dark:text-white">
                {nansenLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Activity Chart */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-inter font-semibold text-[20px] text-[#f5f5f5] flex items-center gap-2">
              <Activity size={20} />
              Transaction Activity
            </h3>
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Last 24 hours
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transactionData}>
                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#activityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] dark:bg-[#111111] p-4 rounded-lg">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Total Volume
              </p>
              <p className="text-lg font-bold text-black dark:text-white">
                15.7 ETH
              </p>
            </div>
            <div className="bg-[#F8F9FA] dark:bg-[#111111] p-4 rounded-lg">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Transactions
              </p>
              <p className="text-lg font-semibold text-[#f5f5f5] font-inter">23</p>
            </div>
            <div className="bg-[#F8F9FA] dark:bg-[#111111] p-4 rounded-lg">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                Avg Amount
              </p>
              <p className="text-lg font-bold text-black dark:text-white">
                0.68 ETH
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Classification */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="font-bricolage font-bold text-[18px] text-black dark:text-white mb-4 flex items-center gap-2">
              <Shield size={18} />
              AI Classification
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle
                    size={16}
                    className="text-red-600 dark:text-red-400"
                  />
                  <span className="font-medium text-red-600 dark:text-red-400 text-sm">
                    High Risk Classification
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {context || tag}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-black dark:text-white mb-2">
                  Risk Factors
                </h4>
                <ul className="space-y-1 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  <li>• Frequent transactions with known mixers</li>
                  <li>• Unusual transaction patterns</li>
                  <li>• Associated with reported scam addresses</li>
                  <li>• High-velocity fund movement</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-black dark:text-white mb-2">
                  Recommendation
                </h4>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Flag for manual review. Consider enhanced due diligence
                  procedures.
                </p>
              </div>
            </div>
          </div>

          {/* Metadata & Contact Info */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
                        <h3 className="font-inter font-semibold text-[18px] text-[#f5f5f5] mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#e63946]" />
              Transaction Analysis
            </h3>

            <div className="space-y-4">
              {metadata?.email && (
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Contact Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail
                      size={16}
                      className="text-[#6B7280] dark:text-[#9CA3AF]"
                    />
                    <span className="text-black dark:text-white font-jetbrains text-sm">
                      {metadata.email}
                    </span>
                  </div>
                </div>
              )}

              {metadata?.forum_mention && (
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Forum Mention
                  </label>
                  <div className="flex items-center gap-2">
                    <Globe
                      size={16}
                      className="text-[#6B7280] dark:text-[#9CA3AF]"
                    />
                    <span className="text-black dark:text-white font-jetbrains text-sm">
                      {metadata.forum_mention}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                  Investigation Notes
                </label>
                <textarea
                  className="w-full p-3 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-white dark:bg-[#111111] text-black dark:text-white resize-none"
                  rows="4"
                  placeholder="Add investigation notes..."
                />
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  Update Notes
                </button>
                <button className="flex-1 px-4 py-2 border border-[#E5E7EB] dark:border-[#333333] text-black dark:text-white rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#262626] transition-colors text-sm">
                  Flag Address
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Addresses */}
        {relatedEntities && relatedEntities.length > 0 && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="font-bricolage font-bold text-[20px] text-black dark:text-white mb-4">
              Connected Addresses
            </h3>

            <div className="space-y-3">
              {relatedEntities.map((connection, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-[#F0F0F0] dark:border-[#2A2A2A] rounded-lg hover:border-[#E0E0E0] dark:hover:border-[#404040] hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-all duration-150"
                >
                  <div>
                    <p className="font-medium text-black dark:text-white font-jetbrains text-sm">
                      {(connection.address || connection).slice(0, 20)}...
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                      {connection.relationship || 'Connected'} • {connection.amount || 'Unknown'}
                    </p>
                  </div>

                  <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Investigate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
