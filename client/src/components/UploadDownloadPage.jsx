import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegCopy } from "react-icons/fa";

import FileSearch from './FileSearch';
import NotificationBell from './NotificationBell';

const UploadDownload = () => {
  const [downloadLink, setDownloadLink] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [user, setuser] = useState(null);

  const copyUserId = async () => {
    await navigator.clipboard.writeText(user._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('http://localhost:8000/api/v1/users/me', {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setuser(data.data);
      }
    };

    fetchUser();
  }, []);

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    setError('');

    const apiUrl = downloadLink.trim();

    if (!apiUrl) {
      setError('Please paste the API link.');
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to fetch download link.');
      }

      const data = await response.json();
      console.log(data)
      const actualDownloadLink = data.data.actualDownloadLink;

      if (!actualDownloadLink) {
        throw new Error("Download link not found in the server response.");
      }
      window.open(actualDownloadLink, '_blank', 'noopener,noreferrer');

    } catch (err) {
      setError('An error occurred. Please check the link and try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {user && (
        <div className="absolute top-6 right-6 flex items-start gap-3 z-20">
          <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-2">
            <NotificationBell />
          </div>

          <div className="bg-white/20 backdrop-blur-md text-white text-sm px-5 py-4 rounded-xl shadow-lg border border-white/20 flex flex-col gap-2">
            <div className="mb-2">
              <span className="opacity-80 font-medium">User ID:</span>

              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono break-all text-sm flex-1">
                  {user._id}
                </p>

                <button
                  onClick={copyUserId}
                  className="p-1 rounded-md hover:bg-white/20 transition"
                  title="Copy User ID"
                >
                  <FaRegCopy size={16} />
                </button>
              </div>

              {copied && (
                <p className="text-green-200 text-xs mt-1">
                  ✓ Copied!
                </p>
              )}
            </div>

            <div>
              <span className="opacity-80">Name:</span>
              <div className="font-semibold">{user.name}</div>
            </div>

            <div>
              <span className="opacity-80">Email:</span>
              <div className="font-semibold">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-lg rounded-3xl shadow-2xl p-10 space-y-10 border border-white/20">

        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Upload a New File</h2>
            <p className="text-gray-600 text-lg">Share your files with the world securely and easily.</p>
          </div>
          <button
            onClick={handleUploadClick}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/25 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Upload File
          </button>
        </div>

        {/* Search your uploaded files
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 py-2 text-gray-500 font-medium text-sm rounded-full border border-gray-200 shadow-sm">
              YOUR FILES
            </span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <FileSearch />
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 py-2 text-gray-500 font-medium text-sm rounded-full border border-gray-200 shadow-sm">
              OR
            </span>
          </div>
        </div> */}

        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Download a File</h2>
            <p className="text-gray-600 text-lg">Paste a shared link below to download the file instantly.</p>
          </div>

          <form onSubmit={handleDownloadClick} className="space-y-5">
            <div className="relative">
              <label htmlFor="download-link" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                File Link
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <input
                  id="download-link"
                  type="url"
                  value={downloadLink}
                  onChange={(e) => setDownloadLink(e.target.value)}
                  placeholder="https://app.com/share/..."
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-lg"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 focus:ring-4 focus:ring-cyan-500/25 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Download File
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDownload;