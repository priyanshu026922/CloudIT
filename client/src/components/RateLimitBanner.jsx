import { useState, useEffect } from "react";

const RateLimitBanner = ({ onDismiss }) => {
    const [seconds, setSeconds] = useState(30);

    useEffect(() => {
        if (seconds <= 0) {
            onDismiss(); 
            return;
        }

        const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds]);

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            backgroundColor: "#ef4444",
            color: "white",
            padding: "14px 20px",
            textAlign: "center",
            zIndex: 9999,
            fontSize: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <span>
                Too many requests. Try again in <strong>{seconds}s</strong>
            </span>
            <button
                onClick={onDismiss}
                style={{
                    background: "transparent",
                    border: "1px solid white",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Dismiss
            </button>
        </div>
    );
};

export default RateLimitBanner;