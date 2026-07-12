// pages/SharedFilePage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function SharedFilePage() {
  const { token } = useParams();
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/files/share/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setState({ status: "ready", data: json.data });
      })
      .catch((err) => setState({ status: "error", data: { message: err.message } }));
  }, [token]);

  if (state.status === "loading") return <p className="text-center mt-20">Loading...</p>;

  if (state.status === "error") {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold text-red-600">⚠️ {state.data.message}</h2>
        <p className="text-gray-500 mt-2">Ask the owner to generate a new link.</p>
      </div>
    );
  }

  const { fileUrl, fileName, expiresIn } = state.data;

  return (
    <div className="text-center mt-20 space-y-4">
      <h2 className="text-2xl font-bold">{fileName}</h2>
      <p className="text-gray-500">Expires in {Math.floor(expiresIn / 60)}m {expiresIn % 60}s</p>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">Download</button>
      </a>
    </div>
  );
}

export default SharedFilePage;