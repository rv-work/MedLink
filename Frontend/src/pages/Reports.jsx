import { useState, useEffect } from "react";
import { FileText, Shield, Globe, CheckCircle, Heart } from "lucide-react";
import HealthcareCard3D from "@/components/HealthCard";
import { useWeb3 } from "@/context/Web3Context";

const BeautifulReportsDashboard = () => {
  const [userReportsWeb2, setUserReportsWeb2] = useState([]);
  const [userReportsWeb3, setUserReportsWeb3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("user123");
  const [activeTab, setActiveTab] = useState("web2");

  const { contractInstance, connectWallet } = useWeb3();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/user/reports", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          setUserReportsWeb2(data.web2Reports || []);
          setUserId(data.userId);

          const web3BackendReports = data.web3Reports || [];
          console.log("top reports:", web3BackendReports);

          if (!contractInstance) {
            connectWallet();
          }

          if (contractInstance && data.userId) {
            const reportsOnChain = await contractInstance.getReports(userId, 0);
            const parsed = reportsOnChain.map((r) => ({
              ipfsHash: r.ipfsHash,
              reportId: r.reportId,
              timestamp: Number(r.timestamp),
            }));

            console.log("obje: ", parsed);
            console.log("abck : ", web3BackendReports);

            const mergedReports = parsed.map((onChain) => {
              const match = web3BackendReports.find(
                (r) => r._id === onChain.reportId
              );

              if (!match) {
                console.warn("No backend report found for:", onChain.reportId);
              }

              console.log("mathc : ", match);

              return {
                ...onChain,
                ...match,
              };
            });

            setUserReportsWeb3(mergedReports);
            console.log("web3Reports  :", userReportsWeb3);
          }
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInstance, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-lg font-medium text-gray-600">
            Loading your medical reports...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching data from Web2 and Web3 sources
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto animate-reverse"
              style={{ animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="text-lg font-medium text-gray-600">
            Loading your medical reports...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching data from Web2 and Web3 sources
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-3 shadow-2xl border border-white/20">
            <div className="flex space-x-3 ">
              <button
                onClick={() => setActiveTab("web2")}
                className={`relative px-8 cursor-pointer py-4 rounded-2xl font-bold transition-all duration-500 flex items-center space-x-3 ${
                  activeTab === "web2"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                }`}
              >
                <Globe className="h-5 w-5" />
                <span>Traditional Reports</span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activeTab === "web2"
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {userReportsWeb2.length}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("web3")}
                className={`relative px-8 cursor-pointer py-4 rounded-2xl font-bold transition-all duration-500 flex items-center space-x-3 ${
                  activeTab === "web3"
                    ? "bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-xl transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Blockchain Secured</span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activeTab === "web3"
                      ? "bg-white/20 text-white"
                      : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {userReportsWeb3.length}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="space-y-8 my-24">
          {activeTab === "web2" && (
            <div className="flex flex-col gap-y-40">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
                  <Globe className="h-10 w-10 text-blue-400" />
                  <span>Traditional Medical Reports</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Securely stored in our advanced database systems
                </p>
              </div>

              {userReportsWeb2.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 shadow-2xl border border-white/20 max-w-lg mx-auto">
                    <FileText className="h-20 w-20 text-gray-400 mx-auto mb-8" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Reports Found
                    </h3>
                    <p className="text-slate-300 text-lg">
                      Your traditional medical reports will appear here once
                      uploaded.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-20 gap-y-80">
                  {userReportsWeb2.map((report, index) => (
                    <>
                      <HealthcareCard3D report={report} key={index} />
                    </>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "web3" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
                  <Shield className="h-10 w-10 text-purple-400" />
                  <span>Blockchain Secured Reports</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Immutable records stored on IPFS with blockchain verification
                </p>
              </div>

              {userReportsWeb3.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 shadow-2xl border border-white/20 max-w-lg mx-auto">
                    <Shield className="h-20 w-20 text-gray-400 mx-auto mb-8" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Blockchain Reports Found
                    </h3>
                    <p className="text-slate-300 text-lg">
                      Your blockchain-secured medical reports will appear here
                      once uploaded to IPFS.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-20 gap-y-80">
                  {userReportsWeb3.map((report, index) => (
                    <>
                      <HealthcareCard3D report={report} key={index} />
                    </>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Interactive 3D
            </h3>
            <p className="text-slate-400 text-sm">
              Hover and interact with your medical reports in stunning 3D space
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Secure & Verified
            </h3>
            <p className="text-slate-400 text-sm">
              HIPAA compliant with blockchain verification for Web3 reports
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Real-time Updates
            </h3>
            <p className="text-slate-400 text-sm">
              Live health monitoring with animated status indicators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulReportsDashboard;
