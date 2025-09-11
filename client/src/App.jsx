import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import UploadDownloadPage from "./components/UploadDownloadPage.jsx";
import Upload from "./components/FileUpload.jsx";
import ErrorPage from "./components/ErrorPage.jsx";

function App() {
  const navLinkClasses = ({ isActive }) =>
    isActive
      ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 rounded-xl font-semibold shadow-lg transform scale-105 transition-all duration-300"
      : "text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:transform hover:scale-105";

      const Navigation = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/users/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          navigate('/');
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("An error occurred during logout:", error);
      }
    };

    return (
      <header className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-gradient-to-r from-blue-100 to-purple-100 sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <NavLink 
            to="/" 
            className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-500 transform hover:scale-110"
          >
            CloudIt
          </NavLink>
          <div className="flex items-center space-x-3">
            <NavLink to="/" className={navLinkClasses}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClasses}>
              Register
            </NavLink>
            <NavLink to="/home" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/upload" className={navLinkClasses}>
              Upload
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold border-2 border-red-200 hover:border-red-500 hover:shadow-lg hover:transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
    );
  };

  return (
    <Router>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-indigo-100 min-h-screen font-sans relative overflow-hidden">
    
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <Navigation />

        <main className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-6 sm:p-8 min-h-[calc(100vh-180px)] relative overflow-hidden">
         
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 rounded-2xl"></div>
            
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<UploadDownloadPage />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/*" element={<ErrorPage />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;