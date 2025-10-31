// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   FaSearch,
//   FaMapMarkerAlt,
//   FaThumbsUp,
//   FaCommentDots,
//   FaChevronLeft,
//   FaChevronRight,
// } from "react-icons/fa";
// import { issuesAPI } from "../../services/api";
// import IssuesMap from "../../components/IssuesMap";

// // Helper functions
// function normalizeStatus(status) {
//   if (!status) return "Open";
//   const statusMap = {
//     open: "Open",
//     "in progress": "In Progress",
//     inprogress: "In Progress",
//     resolved: "Resolved",
//     closed: "Resolved",
//   };
//   return statusMap[status.toLowerCase()] || status;
// }

// function getTimeAgo(dateString) {
//   if (!dateString) return "Unknown";
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//     if (diffDays === 0) return "Today";
//     if (diffDays === 1) return "Yesterday";
//     if (diffDays < 7) return `${diffDays} days ago`;
//     if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
//     if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
//     return `${Math.floor(diffDays / 365)} years ago`;
//   } catch {
//     return "Unknown";
//   }
// }

// export default function Issues() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   useEffect(() => {
//     fetchIssues();
//   }, []);

//   // const fetchIssues = async () => {
//   //   try {
//   //     setLoading(true);
//   //     const data = await issuesAPI.getIssues();
//   //     setIssues(data || []);
//   //     setError(null);
//   //   } catch (err) {
//   //     console.error('Error fetching issues:', err);
//   //     setError('Failed to load issues. Please try again later.');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // Complete fetchIssues function for Issues.jsx
//   // Replace your current fetchIssues function with this:

//   const fetchIssues = async () => {
//     try {
//       setLoading(true);
//       const response = await issuesAPI.getIssues();
//       console.log("API Response:", response); // Debug log

//       // Handle different response formats
//       let issuesData;
//       if (Array.isArray(response)) {
//         issuesData = response;
//       } else if (response.data && Array.isArray(response.data)) {
//         issuesData = response.data;
//       } else if (response.issues && Array.isArray(response.issues)) {
//         issuesData = response.issues;
//       } else {
//         issuesData = [];
//       }

//       console.log("Issues Data:", issuesData); // Debug log
//       console.log("First issue ID:", issuesData[0]?._id); // Debug log

//       setIssues(issuesData);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching issues:", err);
//       setError("Failed to load issues. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter issues
//   const filteredIssues = issues.filter((issue) => {
//     const matchesSearch =
//       !searchQuery ||
//       issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       issue.location?.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesCategory =
//       !selectedCategory ||
//       issue.category?.toLowerCase() === selectedCategory.toLowerCase();

//     return matchesSearch && matchesCategory;
//   });

//   const categories = [
//     { name: "lighting", label: "Lighting" },
//     { name: "road", label: "Road & Infrastructure" },
//     { name: "waste", label: "Waste" },
//     { name: "water", label: "Water Supply" },
//   ];

//   const getPinBadgeClass = (status) => {
//     switch (status) {
//       case "Open":
//         return "bg-gradient-to-b from-yellow-400 to-yellow-500";
//       case "In Progress":
//         return "bg-gradient-to-b from-blue-400 to-blue-600";
//       case "Resolved":
//         return "bg-gradient-to-b from-green-400 to-green-500";
//       default:
//         return "bg-gray-400";
//     }
//   };

//   const handleCategoryClick = (categoryName) => {
//     setSelectedCategory(
//       selectedCategory === categoryName ? null : categoryName
//     );
//   };

//   const handleMarkerClick = (issue) => {
//     setSelectedIssue(issue);
//     // Auto-open sidebar when marker is clicked
//     if (!sidebarOpen) {
//       setSidebarOpen(true);
//     }
//     // Scroll to issue in sidebar
//     setTimeout(() => {
//       // FIXED: Use _id instead of id
//       const issueElement = document.getElementById(`issue-${issue._id}`);
//       if (issueElement) {
//         issueElement.scrollIntoView({ behavior: "smooth", block: "center" });
//       }
//     }, 300);
//   };

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] text-white font-inter">
//       <div className="flex w-full relative">
//         {/* Sidebar */}
//         <div
//           className={`h-screen backdrop-blur-xl bg-white/10 border-r border-white/20 flex flex-col p-6 gap-6 overflow-y-auto transition-all duration-300 ease-in-out ${
//             sidebarOpen ? "w-[400px]" : "w-0 p-0"
//           }`}
//           style={{
//             opacity: sidebarOpen ? 1 : 0,
//             visibility: sidebarOpen ? "visible" : "hidden",
//           }}
//         >
//           {/* Search Field */}
//           <div className="w-full">
//             <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 h-12 flex items-center px-4 gap-2">
//               <FaSearch className="text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search Issues"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="flex-1 text-gray-900 placeholder-gray-500 text-base leading-6 outline-none bg-transparent"
//               />
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="flex flex-wrap gap-3 p-2">
//             {categories.map((category) => (
//               <div
//                 key={category.name}
//                 onClick={() => handleCategoryClick(category.name)}
//                 className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 cursor-pointer transition-colors ${
//                   selectedCategory === category.name
//                     ? "bg-[#00b4db] text-white"
//                     : "bg-gray-100 text-slate-900 hover:bg-gray-200"
//                 }`}
//               >
//                 <span className="text-xs font-medium leading-4">
//                   {category.label}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {loading && (
//             <div className="flex items-center justify-center p-8">
//               <div className="text-white text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
//                 <p>Loading issues...</p>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-white">
//               <p className="font-medium mb-2">Error Loading Issues</p>
//               <p className="text-sm">{error}</p>
//             </div>
//           )}

//           {!loading && !error && (
//             <div className="flex flex-col gap-4 p-2.5">
//               {filteredIssues.length === 0 ? (
//                 <div className="text-white text-center p-8">
//                   <p className="text-lg mb-2">No issues found</p>
//                   <p className="text-sm text-gray-300">
//                     {searchQuery || selectedCategory
//                       ? "Try adjusting your filters"
//                       : "Be the first to report an issue!"}
//                   </p>
//                 </div>
//               ) : (
//                 filteredIssues.map((issue) => (
//                   <div
//                     key={issue._id} // FIXED: Use _id instead of id
//                     id={`issue-${issue._id}`} // FIXED: Use _id instead of id
//                     className={`w-full bg-white rounded-xl shadow-sm p-3 flex flex-col gap-2 cursor-pointer transition-all ${
//                       selectedIssue?._id === issue._id
//                         ? "ring-2 ring-[#00b4db]"
//                         : "" // FIXED: Use _id instead of id
//                     }`}
//                     onClick={() => setSelectedIssue(issue)}
//                   >
//                     <div className="relative h-32 overflow-hidden rounded-xl">
//                       {issue.images && issue.images.length > 0 ? (
//                         <img
//                           src={issue.images[0]}
//                           alt={issue.title}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             e.target.style.display = "none";
//                             e.target.nextSibling.style.display = "flex";
//                           }}
//                         />
//                       ) : null}
//                       <div
//                         className="w-full h-full bg-gray-300 rounded-xl flex items-center justify-center"
//                         style={{
//                           display:
//                             issue.images && issue.images.length > 0
//                               ? "none"
//                               : "flex",
//                         }}
//                       >
//                         <span className="text-gray-400 text-sm">No image</span>
//                       </div>
//                       <div
//                         className={`absolute top-2 left-2 ${getPinBadgeClass(
//                           normalizeStatus(issue.status)
//                         )} text-white rounded-full px-3 py-1 text-xs font-medium`}
//                       >
//                         {normalizeStatus(issue.status)}
//                       </div>
//                     </div>

//                     <div className="flex flex-col gap-1">
//                       <h3 className="text-slate-900 text-base leading-6 font-medium">
//                         {issue.title}
//                       </h3>
//                       <div className="flex items-center gap-1.5 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1 w-fit">
//                         <span className="text-xs font-medium leading-4 capitalize">
//                           {issue.category}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between text-slate-500 text-xs leading-4 font-medium">
//                       <div className="flex items-center gap-1">
//                         <FaMapMarkerAlt className="w-4 h-4" />
//                         <span>{issue.location}</span>
//                       </div>
//                       <span>
//                         {getTimeAgo(issue.reportedDate || issue.createdAt)}
//                       </span>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       {/* <Link
//                         to={`/issues/${issue._id}`} // FIXED: Use _id instead of id
//                         className="text-[#0083b0] text-xs leading-4 font-medium cursor-pointer hover:underline"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         View Details
//                       </Link> */}
//                       <Link
//                         to={`/issues/${issue._id || 'error'}`}
//                         className="text-[#0083b0] text-xs leading-4 font-medium cursor-pointer hover:underline"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           console.log('CLICKED ISSUE:', issue);
//                           console.log('ISSUE ID:', issue._id);
//                           console.log('FULL ISSUE OBJECT:', JSON.stringify(issue));
//                         }}
//                       >
//                         View Details
//                       </Link>
//                       <div className="flex items-center gap-3">
//                         <div className="flex items-center gap-1 text-slate-500">
//                           <FaThumbsUp className="w-4 h-4" />
//                           <span className="text-xs leading-4 font-medium">
//                             {issue.upvotes || 0}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-1 text-slate-500">
//                           <FaCommentDots className="w-4 h-4" />
//                           <span className="text-xs leading-4 font-medium">
//                             {Array.isArray(issue.comments)
//                               ? issue.comments.length
//                               : 0}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>

//         {/* Toggle Button */}
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-white text-slate-900 rounded-r-lg p-3 shadow-lg hover:bg-gray-100 transition-all duration-300"
//           style={{
//             left: sidebarOpen ? "400px" : "0px",
//             transition: "left 0.3s ease-in-out",
//           }}
//           title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
//         >
//           {sidebarOpen ? (
//             <FaChevronLeft className="w-5 h-5" />
//           ) : (
//             <FaChevronRight className="w-5 h-5" />
//           )}
//         </button>

//         {/* Map Area */}
//         <div className="flex-1 relative h-screen overflow-hidden">
//           {!loading && !error ? (
//             <IssuesMap
//               issues={filteredIssues}
//               selectedIssue={selectedIssue}
//               onMarkerClick={handleMarkerClick}
//             />
//           ) : (
//             <div className="w-full h-full bg-gray-600 flex items-center justify-center">
//               <p className="text-white text-lg">
//                 {loading ? "Loading map..." : "Map unavailable"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaThumbsUp,
  FaCommentDots,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { issuesAPI } from "../../services/api";
import IssuesMap from "../../components/IssuesMap";

// Helper functions
function normalizeStatus(status) {
  if (!status) return "Open";
  const statusMap = {
    open: "Open",
    "in progress": "In Progress",
    inprogress: "In Progress",
    resolved: "Resolved",
    closed: "Resolved",
  };
  return statusMap[status.toLowerCase()] || status;
}

function getTimeAgo(dateString) {
  if (!dateString) return "Unknown";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "Unknown";
  }
}

export default function Issues() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getIssues();
      console.log("API Response:", response);

      let issuesData;
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      } else if (response.issues && Array.isArray(response.issues)) {
        issuesData = response.issues;
      } else {
        issuesData = [];
      }

      console.log("Issues Data:", issuesData);
      console.log("First issue ID:", issuesData[0]?._id);

      setIssues(issuesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to load issues. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      !searchQuery ||
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      issue.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { name: "lighting", label: "Lighting" },
    { name: "road", label: "Road & Infrastructure" },
    { name: "waste", label: "Waste" },
    { name: "water", label: "Water Supply" },
  ];

  const getPinBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-gradient-to-b from-yellow-400 to-yellow-500";
      case "In Progress":
        return "bg-gradient-to-b from-blue-400 to-blue-600";
      case "Resolved":
        return "bg-gradient-to-b from-green-400 to-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(
      selectedCategory === categoryName ? null : categoryName
    );
  };

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
    setTimeout(() => {
      const issueElement = document.getElementById(`issue-${issue._id}`);
      if (issueElement) {
        issueElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  };

  // Handle navigation to issue detail
  const handleViewDetails = (issueId) => {
    console.log('Navigating to issue:', issueId);
    if (issueId && issueId !== 'undefined') {
      navigate(`/issues/${issueId}`);
    } else {
      console.error('Invalid issue ID');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] text-white font-inter">
      <div className="flex w-full relative">
        {/* Sidebar */}
        <div
          className={`h-screen backdrop-blur-xl bg-white/10 border-r border-white/20 flex flex-col p-6 gap-6 overflow-y-auto transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-[400px]" : "w-0 p-0"
          }`}
          style={{
            opacity: sidebarOpen ? 1 : 0,
            visibility: sidebarOpen ? "visible" : "hidden",
          }}
        >
          {/* Search Field */}
          <div className="w-full">
            <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 h-12 flex items-center px-4 gap-2">
              <FaSearch className="text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Issues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-gray-900 placeholder-gray-500 text-base leading-6 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-2">
            {categories.map((category) => (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 cursor-pointer transition-colors ${
                  selectedCategory === category.name
                    ? "bg-[#00b4db] text-white"
                    : "bg-gray-100 text-slate-900 hover:bg-gray-200"
                }`}
              >
                <span className="text-xs font-medium leading-4">
                  {category.label}
                </span>
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading issues...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-white">
              <p className="font-medium mb-2">Error Loading Issues</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-4 p-2.5">
              {filteredIssues.length === 0 ? (
                <div className="text-white text-center p-8">
                  <p className="text-lg mb-2">No issues found</p>
                  <p className="text-sm text-gray-300">
                    {searchQuery || selectedCategory
                      ? "Try adjusting your filters"
                      : "Be the first to report an issue!"}
                  </p>
                </div>
              ) : (
                filteredIssues.map((issueItem) => {
                  // Store the ID in a const to ensure closure captures it correctly
                  const currentIssueId = issueItem._id;
                  
                  return (
                    <div
                      key={currentIssueId}
                      id={`issue-${currentIssueId}`}
                      className={`w-full bg-white rounded-xl shadow-sm p-3 flex flex-col gap-2 cursor-pointer transition-all ${
                        selectedIssue?._id === currentIssueId
                          ? "ring-2 ring-[#00b4db]"
                          : ""
                      }`}
                      onClick={() => setSelectedIssue(issueItem)}
                    >
                      <div className="relative h-32 overflow-hidden rounded-xl">
                        {issueItem.images && issueItem.images.length > 0 ? (
                          <img
                            src={issueItem.images[0]}
                            alt={issueItem.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full bg-gray-300 rounded-xl flex items-center justify-center"
                          style={{
                            display:
                              issueItem.images && issueItem.images.length > 0
                                ? "none"
                                : "flex",
                          }}
                        >
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                        <div
                          className={`absolute top-2 left-2 ${getPinBadgeClass(
                            normalizeStatus(issueItem.status)
                          )} text-white rounded-full px-3 py-1 text-xs font-medium`}
                        >
                          {normalizeStatus(issueItem.status)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="text-slate-900 text-base leading-6 font-medium">
                          {issueItem.title}
                        </h3>
                        <div className="flex items-center gap-1.5 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1 w-fit">
                          <span className="text-xs font-medium leading-4 capitalize">
                            {issueItem.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-xs leading-4 font-medium">
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="w-4 h-4" />
                          <span>{issueItem.location}</span>
                        </div>
                        <span>
                          {getTimeAgo(issueItem.reportedDate || issueItem.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(currentIssueId);
                          }}
                          className="text-[#0083b0] text-xs leading-4 font-medium cursor-pointer hover:underline bg-transparent border-none"
                        >
                          View Details
                        </button>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-slate-500">
                            <FaThumbsUp className="w-4 h-4" />
                            <span className="text-xs leading-4 font-medium">
                              {issueItem.upvotes || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <FaCommentDots className="w-4 h-4" />
                            <span className="text-xs leading-4 font-medium">
                              {Array.isArray(issueItem.comments)
                                ? issueItem.comments.length
                                : 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-white text-slate-900 rounded-r-lg p-3 shadow-lg hover:bg-gray-100 transition-all duration-300"
          style={{
            left: sidebarOpen ? "400px" : "0px",
            transition: "left 0.3s ease-in-out",
          }}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? (
            <FaChevronLeft className="w-5 h-5" />
          ) : (
            <FaChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Map Area */}
        <div className="flex-1 relative h-screen overflow-hidden">
          {!loading && !error ? (
            <IssuesMap
              issues={filteredIssues}
              selectedIssue={selectedIssue}
              onMarkerClick={handleMarkerClick}
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <p className="text-white text-lg">
                {loading ? "Loading map..." : "Map unavailable"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}