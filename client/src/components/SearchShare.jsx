import React, { useState, useEffect } from 'react';

const SearchShare = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeFileId, setActiveFileId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => searchFiles(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const searchFiles = async (q) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/files/search?q=${encodeURIComponent(q)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      setResults(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openSharePanel = (fileId) => {
    setActiveFileId(activeFileId === fileId ? null : fileId);
    setShareEmail('');
    setShareStatus('');
  };

  const shareFile = async (fileId) => {
    if (!shareEmail.trim()) return;
    setSharing(true);
    setShareStatus('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/files/${fileId}/share-to-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: shareEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to share file');

      setShareStatus(
        data.data.method === 'email+in-app'
          ? `Emailed + notified ${shareEmail} in-app`
          : `Emailed ${shareEmail}`
      );
      setShareEmail('');
    } catch (err) {
      setShareStatus(`❌ ${err.message}`);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-2 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Search & Share Files</h1>
        <p className="text-gray-600">Find any file you've uploaded and send it to someone directly.</p>
      </div>

      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your files by name..."
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg"
        />
      </div>

      {loading && <p className="text-sm text-gray-400 mt-3">Searching...</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
          {results.map((file) => (
            <div key={file._id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.fileName}</p>
                    <p className="text-xs text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => openSharePanel(file._id)}
                  className="flex-shrink-0 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {activeFileId === file._id ? "Close" : "Share"}
                </button>
              </div>

              {activeFileId === file._id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="flex-1 border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                      disabled={sharing}
                    />
                    <button
                      onClick={() => shareFile(file._id)}
                      disabled={sharing || !shareEmail.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sharing ? "Sending..." : "Send"}
                    </button>
                  </div>
                  {shareStatus && (
                    <p className={`text-xs mt-2 ${shareStatus.startsWith('❌') ? 'text-red-500' : 'text-green-600'}`}>
                      {shareStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && query.trim() && results.length === 0 && !error && (
        <p className="text-sm text-gray-400 mt-4 text-center">No files found matching "{query}"</p>
      )}
    </div>
  );
};

export default SearchShare;