import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRateLimitSecondsLeft, clearRateLimit } from '../services/rateLimit.js';

const RateLimitGuard = ({ children }) => {
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const secondsLeft = getRateLimitSecondsLeft();

    if (secondsLeft > 0) {
      setCountdown(secondsLeft);

      // Force redirect to login if they're anywhere else
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }

      // Start ticking
      const interval = setInterval(() => {
        const left = getRateLimitSecondsLeft();
        setCountdown(left);
        if (left <= 0) {
          clearInterval(interval);
          clearRateLimit();
          setCountdown(0);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [location.pathname]); 

  return (
    <>
      {countdown > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-500 text-white px-6 py-4 flex items-center gap-3 shadow-lg">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
          </svg>
          <span className="font-semibold">
            Too many login attempts. Try again in <strong>{countdown}s</strong> — you have been redirected to login.
          </span>
        </div>
      )}
      {children}
    </>
  );
};

export default RateLimitGuard;