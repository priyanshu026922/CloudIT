import React, { useState, useEffect } from 'react';

const FileSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // which file's share panel is currently open
  const [activeFileId, setActiveFileId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchFiles(query);
    }, 400);

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
    setActiveFileId(activeFileId === fileId ? null : fileId); // toggle
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
      setShareStatus(`${err.message}`);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your files by name..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {loading && <p className="text-sm text-gray-400 mt-2">Searching...</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {results.length > 0 && (
        <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {results.map((file) => (
            <div key={file._id} className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate flex-1">{file.fileName}</span>
                <span className="text-xs text-gray-400 mr-3">
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => openSharePanel(file._id)}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {activeFileId === file._id ? "Close" : "Share"}
                </button>
              </div>

              {activeFileId === file._id && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 border-2 border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    disabled={sharing}
                  />
                  <button
                    onClick={() => shareFile(file._id)}
                    disabled={sharing || !shareEmail.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sharing ? "Sending..." : "Send"}
                  </button>
                </div>
              )}

              {activeFileId === file._id && shareStatus && (
                <p className={`text-xs mt-2 ${shareStatus.startsWith('❌') ? 'text-red-500' : 'text-green-600'}`}>
                  {shareStatus}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <p className="text-sm text-gray-400 mt-2">No files found matching "{query}"</p>
      )}
    </div>
  );
};

export default FileSearch;