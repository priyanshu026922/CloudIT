const RATE_LIMIT_KEY = "rl_login_until";

export const setRateLimited = () => {
    const until = Date.now() + 30 * 1000; 
    localStorage.setItem(RATE_LIMIT_KEY, until.toString());
};

export const getRateLimitSecondsLeft = () => {
    const until = localStorage.getItem(RATE_LIMIT_KEY);
    if (!until) return 0;
    const secondsLeft = Math.ceil((parseInt(until) - Date.now()) / 1000);
    return secondsLeft > 0 ? secondsLeft : 0;
};

export const clearRateLimit = () => {
    localStorage.removeItem(RATE_LIMIT_KEY);
};