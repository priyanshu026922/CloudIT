import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { loginUser, logoutUser, registerUser, updateAccessToken ,getUser} from "../controllers/user.controller.js";
import { rateLimitLogin } from "../middleware/rateLimiter.js";

const router = Router();

router.route('/register').post(
    registerUser
)

router.route('/login').post(rateLimitLogin, loginUser);

router.route('/logout').post(
    verifyJWT,
    logoutUser
)

router.route('/me').get(
    verifyJWT,
    getUser
);

router.route('/update-access-token').post(
    verifyJWT,
    updateAccessToken
)

export default router