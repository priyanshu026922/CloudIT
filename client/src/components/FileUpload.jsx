import React, { useRef, useState, useEffect } from 'react'; 

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [accessList, setAccessList] = useState('');
  const [result, setResult] = useState(null); // now holds { downloadLink, fileId }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(30);


  const [shareEmail, setShareEmail] = useState('');
  const [emailSharing, setEmailSharing] = useState(false);
  const [emailShareStatus, setEmailShareStatus] = useState(''); // success/error message


  // share link state
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);

  const fileInputRef = useRef();

  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  const generateShareLink = async () => {
    if (!result?.fileId) return;
    setSharing(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/files/${result.fileId}/share`, {
        method: 'POST',
        credentials: 'include',
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to generate share link');
      await navigator.clipboard.writeText(resData.data.shareUrl);
      setShareUrl(resData.data.shareUrl);
    } catch (err) {
      setError(err.message || 'Failed to generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const shareViaEmail = async () => {
  if (!result?.fileId || !shareEmail.trim()) return;
  setEmailSharing(true);
  setEmailShareStatus('');
  setError('');
  try {
    const res = await fetch(`http://localhost:8000/api/v1/files/${result.fileId}/share-to-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: shareEmail.trim() }),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to share file');

    setEmailShareStatus(
      resData.data.method === 'in-app'
        ? `Notified ${shareEmail} `
        : `Emailed ${shareEmail} the download link`
    );
    setShareEmail('');
  } catch (err) {
    setError(err.message);
  } finally {
    setEmailSharing(false);
  }
};


  useEffect(() => {
    const upload = async () => {
      if (file) {
        setLoading(true);
        setError('');
        setResult(null);
        setShareUrl('');
        const data = new FormData();
        data.append("name", file.name);
        data.append("file", file);

        const ids = accessList.split(',').map(id => id.trim()).filter(id => id);
        ids.forEach(id => {
          data.append("accessList", id);
        });

        try {
          console.log("Uploading file:", file.name);
          console.log("With access list:", ids);

          const response = await fetch('http://localhost:8000/api/v1/files/upload', {
            method: 'POST',
            body: data,
            credentials: 'include'
          });

          if (response.status === 429) {
            setRateLimited(true);
            let secs = 30;
            const interval = setInterval(() => {
              secs -= 1;
              setCountdown(secs);
              if (secs <= 0) {
                clearInterval(interval);
                setRateLimited(false);
                setCountdown(30);
              }
            }, 1000);
            return;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }

          const responseData = await response.json();
          console.log(responseData);
          setResult(responseData.data); // { downloadLink, fileId }

        } catch (err) {
          setError(err.message || 'Failed to upload file. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    upload();
  }, [file]);

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {rateLimited && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
            </svg>
            <span className="font-semibold">
              Too many attempts. Try again in <strong>{countdown}s</strong>
            </span>
          </div>
          <button
            onClick={() => setRateLimited(false)}
            className="text-white/80 hover:text-white text-xl font-bold leading-none"
          >
            ✕
          </button>
        </div>
      )}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg text-center space-y-8 relative z-10 transform hover:scale-[1.02] transition-all duration-300">

        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 rounded-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Simple File Sharing
            </h1>
            <p className="text-lg text-gray-600 font-medium">Upload a file and share the download link instantly.</p>
          </div>
          <div className="w-full max-w-sm mx-auto">
            <label htmlFor="accessList" className="  space-y-8 text-left block text-sm font-semibold text-gray-700 mb-2">
              Share with (User IDs, comma separated)
            </label>
            <div className=''>
              <div className="relative">

                <input
                  type="text"
                  id="accessList"
                  value={accessList}
                  onChange={(e) => setAccessList(e.target.value)}
                  placeholder="60d5f...e9a, 60d5f...f8b"
                  className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                  disabled={loading}
                />

                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </div>

          </div>

          <div className="relative">
            <button
              onClick={onUploadClick}
              disabled={loading}
              className="w-full max-w-sm mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-lg relative overflow-hidden group"
            >

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative z-10">Uploading...</span>
                </>
              ) : (
                <span className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Choose File
                </span>
              )}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
          />

          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg transform animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-green-500 rounded-full p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-3">🎉 Your file is ready! Copy the link below:</p>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-green-200 mb-3">
                <a
                  href={result.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium break-all hover:text-blue-800 transition-colors duration-200 text-sm"
                >
                  {result.downloadLink}
                </a>
              </div>

              {/* Generate 20-min share link */}
              <button
                onClick={generateShareLink}
                disabled={sharing}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sharing ? "Generating..." : "Generate 20-min Share Link"}
              </button>

              {shareUrl && (
                <div className="mt-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-1">⏱ Expires in 20 min — copied to clipboard:</p>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 font-medium break-all text-sm"
                  >
                    {shareUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Share via email */}
       
       
        <div className="mt-4 pt-4 border-t border-green-200">
          <p className="text-xs font-semibold text-gray-600 mb-2 text-left">Or send directly to someone:</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 border-2 border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
              disabled={emailSharing}
            />
            <button
              onClick={shareViaEmail}
              disabled={emailSharing || !shareEmail.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailSharing ? "Sending..." : "Send"}
            </button>
          </div>
          {emailShareStatus && (
            <p className="text-xs text-green-600 mt-2">{emailShareStatus}</p>
          )}
        </div>


          {error && (
            <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-lg transform animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-red-500 rounded-full p-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;