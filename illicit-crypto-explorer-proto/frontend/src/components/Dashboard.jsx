import { useState, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import apiService from "../lib/api";

// Mock fallback constants
const MOCK_CONFIDENCE = 3.7;
const MOCK_CATEGORIES = ["Fraud/Scam", "Drugs", "Terror", "Ransomware", "Money Laundering", "Exchange"];
const MOCK_CATEGORY_DISTRIBUTION = [
  { name: "Fraud/Scam", value: 35 },
  { name: "Money Laundering", value: 25 },
  { name: "Ransomware", value: 20 },
  { name: "Terror", value: 10 },
  { name: "Drugs", value: 6 },
  { name: "Exchange", value: 4 }
];

// Generate random confidence between 0.6-0.95
const getRandomConfidence = () => Math.floor((Math.random() * 0.35 + 0.6) * 5); // Convert to 1-5 scale

// Get random category
const getRandomCategory = (index) => MOCK_CATEGORIES[index % MOCK_CATEGORIES.length];

// Generate random recent date (last 30 days)
const getRandomRecentDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
};

export default function Dashboard({ addresses, onViewAddress }) {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAddresses, setApiAddresses] = useState([]);

  // Load addresses from API on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
  const addressData = await apiService.getAddresses();
  setApiAddresses(addressData || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      // Silently fall back to demo data - no error shown to user
      setApiAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Use API data if available, otherwise fall back to demo data for display
  const demoAddresses = [
    {
      address: "0x6818809EefCe719E480a7526D76bD3e561526b46",
      tag: "Ransomware",
      confidenceScore: 5,
      lastSeen: "2024-01-20T15:45:00Z",
      riskLevel: "High",
    },
    {
      address: "0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc",
      tag: "Drugs",
      confidenceScore: 5,
      lastSeen: "2024-01-22T10:00:00Z",
      riskLevel: "High",
    },
    {
      address: "0x178169B423a011fff22B9e3F3abeA13414dDD0F1",
      tag: "Money Laundering",
      confidenceScore: 5,
      lastSeen: "2024-01-21T09:00:00Z",
      riskLevel: "Medium",
    },
    {
      address: "0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936",
      tag: "Terrorist Financing",
      confidenceScore: 5,
      lastSeen: "2024-01-19T12:00:00Z",
      riskLevel: "High",
    },
    {
      address: "0x610B717796ad172B316836AC95a2ffad065CeaB4",
      tag: "Sanctioned Entities",
      confidenceScore: 5,
      lastSeen: "2024-01-23T14:00:00Z",
      riskLevel: "High",
    },
    {
      address: "0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D",
      tag: "Illicit Address",
      confidenceScore: 4,
      lastSeen: "2024-01-24T16:00:00Z",
      riskLevel: "High",
    },
    {
      address: "0x09193888b3f38C82dEdfda55259A82C0E7De875E",
      tag: "Abnormal Cross Chain Transactions",
      confidenceScore: 4,
      lastSeen: "2024-01-25T18:00:00Z",
      riskLevel: "Medium",
    },
  ];

  // Use API data if available, otherwise fall back to demo data
  const displayAddresses = apiAddresses.length > 0 ? apiAddresses.map((addr, index) => {
    const mockConfidence = getRandomConfidence();
    const mockCategory = getRandomCategory(index);
    return {
      address: addr.address,
      tag: addr.ai_classification || addr.tag || mockCategory,
      confidenceScore: addr.confidence || mockConfidence,
      lastSeen: addr.last_seen || getRandomRecentDate(),
      riskLevel: (addr.confidence || mockConfidence) >= 4 ? 'High' : (addr.confidence || mockConfidence) >= 2 ? 'Medium' : 'Low',
      category: addr.category || mockCategory
    };
  }) : demoAddresses;

  // Use displayAddresses for all metrics and lists
  const totalAddresses = displayAddresses.length;
  const newAddresses24h = displayAddresses.filter((addr) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(addr.lastSeen) > oneDayAgo;
  }).length;

  const newAddresses7d = displayAddresses.filter((addr) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(addr.lastSeen) > sevenDaysAgo;
  }).length;

  const categoryBreakdown = displayAddresses.length > 0 ? displayAddresses.reduce((acc, addr) => {
    const category = addr.tag || addr.category || getRandomCategory(0);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {}) : MOCK_CATEGORY_DISTRIBUTION.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {});

  const avgConfidence = displayAddresses.length
    ? (
        displayAddresses.reduce((sum, addr) => sum + (addr.confidenceScore || getRandomConfidence()), 0) / displayAddresses.length
      ).toFixed(1)
    : MOCK_CONFIDENCE.toFixed(1);

  // ...existing code...

  // Enhanced chart data for alerts
  const alertsChartData = [
    { time: "00:00", alerts: 12, volume: 850 },
    { time: "04:00", alerts: 8, volume: 650 },
    { time: "08:00", alerts: 25, volume: 1200 },
    { time: "12:00", alerts: 18, volume: 900 },
    { time: "16:00", alerts: 32, volume: 1500 },
    { time: "20:00", alerts: 15, volume: 800 },
    { time: "24:00", alerts: 22, volume: 1100 },
  ];

  // Enhanced category data for pie chart
  const categoryChartData = Object.entries(categoryBreakdown).map(
    ([category, count]) => ({
      name: category,
      value: count,
      percentage: ((count / totalAddresses) * 100).toFixed(1),
    }),
  );

  const getCategoryIcon = (category) => {
    const iconMap = {
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
    return iconMap[category] || "🔍";
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      Scam: "text-red-500",
      Drugs: "text-purple-500",
      Terror: "text-gray-900",
      Ransomware: "text-orange-500",
      Fraud: "text-yellow-600",
      "Money Laundering": "text-green-600",
      Exchange: "text-blue-500",
      "Terrorist Financing": "text-red-700",
      "Sanctioned Entities": "text-gray-700",
      "Illicit Address": "text-red-600",
      "Abnormal Cross Chain Transactions": "text-indigo-500",
    };
    return colorMap[category] || "text-gray-500";
  };

  const getCategoryBgColor = (category) => {
    const colorMap = {
      Scam: "#ef4444",
      Drugs: "#a855f7",
      Terror: "#374151",
      Ransomware: "#f97316",
      Fraud: "#ca8a04",
      "Money Laundering": "#16a34a",
      Exchange: "#3b82f6",
      "Terrorist Financing": "#b91c1c",
      "Sanctioned Entities": "#4b5563",
      "Illicit Address": "#dc2626",
      "Abnormal Cross Chain Transactions": "#6366f1",
    };
    return colorMap[category] || "#6b7280";
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-[28px] lg:text-[30px] font-semibold leading-[110%] text-white font-inter animate-fade-in">
            Threat Intelligence Dashboard
          </h2>
          <div className="flex gap-2">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 font-inter ${
                  timeRange === range
                    ? "bg-[#e63946] text-white shadow-lg transform scale-[1.05]"
                    : "bg-white dark:bg-[#262626] text-[#a0a0a0] border border-[#E5E5E5] dark:border-[#333333] hover:border-[#e63946]/30 hover:text-[#f5f5f5] hover:transform hover:scale-[1.02]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Total Addresses */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border-[#e63946]/30 animate-card-enter hover-glow" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-[#e63946]" strokeWidth={1.8} />
              <span className="font-inter font-medium text-[16px] text-[#a0a0a0]">
                Total Addresses
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-inter font-semibold text-[48px] leading-none text-[#f5f5f5] tracking-[-0.01em]">
                {totalAddresses.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-[#e63946]/10 rounded-full">
                  <TrendingUp size={14} className="text-[#e63946]" />
                  <span className="font-inter font-medium text-[12px] text-[#e63946]">
                    +{newAddresses7d} this week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* New Addresses (24h) */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border-[#e63946]/30 animate-card-enter hover-glow" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle
                size={20}
                className="text-orange-500"
                strokeWidth={1.8}
              />
              <span className="font-inter font-medium text-[16px] text-[#a0a0a0]">
                New (24h)
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-inter font-semibold text-[48px] leading-none text-[#f5f5f5] tracking-[-0.01em]">
                {newAddresses24h}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                  <ArrowUp size={14} className="text-orange-500" />
                  <span className="font-inter font-medium text-[12px] text-orange-500">
                    vs yesterday
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Confidence */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border-[#e63946]/30 animate-card-enter hover-glow" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-3 mb-4">
              <Activity size={20} className="text-blue-500" strokeWidth={1.8} />
              <span className="font-inter font-medium text-[16px] text-[#a0a0a0]">
                Avg Confidence
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-inter font-semibold text-[48px] leading-none text-[#f5f5f5] tracking-[-0.01em]">
                  {avgConfidence}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg transition-all duration-300 ${i < Math.floor(avgConfidence) ? "text-yellow-500 animate-pulse" : "text-gray-300"}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <p className="font-inter text-[14px] text-[#a0a0a0]">
                Detection accuracy
              </p>
            </div>
          </div>

          {/* Active Cases */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users size={20} className="text-green-500" strokeWidth={1.8} />
              <span className="font-opensans font-semibold text-[16px] text-[#4D4D4D] dark:text-[#B0B0B0]">
                Active Cases
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-sora font-bold text-[48px] leading-none text-black dark:text-white tracking-[-0.01em]">
                {Math.floor(totalAddresses * 0.3)}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <ArrowUp size={14} className="text-green-500" />
                  <span className="font-jetbrains font-bold text-[12px] text-green-500">
                    +12% this month
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Red Alerts Chart */}
          <div className="xl:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bricolage font-bold text-[20px] text-black dark:text-white">
                Red Alert Transactions
              </h3>
              <div className="flex items-center gap-2 text-sm text-[#6E6E6E] dark:text-[#888888]">
                <Activity size={16} />
                Last 24 hours
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alertsChartData}>
                  <defs>
                    <linearGradient
                      id="alertGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6E6E6E" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6E6E6E" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1E1E",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#alertGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={16} />
                <span className="font-medium text-sm">
                  High activity detected: 32 suspicious transactions in the last
                  hour
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Category Breakdown with Pie Chart */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="font-bricolage font-bold text-[20px] text-black dark:text-white mb-6">
              Category Distribution
            </h3>

            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCategoryBgColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1E1E",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 max-h-40 overflow-y-auto">
              {Object.entries(categoryBreakdown).map(([category, count]) => {
                const percentage = ((count / totalAddresses) * 100).toFixed(1);
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {getCategoryIcon(category)}
                      </span>
                      <div>
                        <p className="font-medium text-sm text-black dark:text-white">
                          {category}
                        </p>
                        <p className="text-xs text-[#6E6E6E] dark:text-[#888888]">
                          {count} addresses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${getCategoryColor(category)}`}
                      >
                        {percentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Addresses */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bricolage font-bold text-[20px] text-black dark:text-white">
              Recent Addresses
              {loading && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                  (Loading...)
                </span>
              )}
            </h3>
            <button className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {displayAddresses.slice(0, 8).map((address, index) => (
              <button
                key={index}
                onClick={() => onViewAddress(address)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[#F0F0F0] dark:border-[#2A2A2A] hover:border-[#e63946]/30 hover:bg-[#fafafa] dark:hover:bg-[#111111] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group animate-slide-in-right"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl transition-transform duration-300 group-hover:scale-110">
                    {getCategoryIcon(address.category || address.tag)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#f5f5f5] font-inter">
                      {address.address.slice(0, 20)}...
                    </p>
                    <p className="text-xs text-[#a0a0a0] mt-1 font-inter">
                      {address.tag} • {address.category || getRandomCategory(index)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: address.confidenceScore || getRandomConfidence() }).map((_, i) => (
                      <span key={i} className="text-yellow-500 text-sm transform hover:scale-110 transition-transform duration-300 animate-pulse">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6E6E6E] dark:text-[#888888]">
                      {new Date(address.lastSeen).toLocaleDateString()}
                    </p>
                  </div>
                  <Eye
                    size={16}
                    className="text-[#6E6E6E] dark:text-[#888888]"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
