import { verifyJwtToken } from "../config/jwt.js"

export const authMiddleware = (req, res, next) => {
    // const authHeader = req.headers.authorization
    try {

        const auth = req.get("Authorization");

        if (!auth?.startsWith("Bearer "))
            return res.sendStatus(401);

        const token = auth.split(" ")[1];

        const decoded = verifyJwtToken(token);
        req.userId = decoded.userId;

        next();

    } catch {
        return res.sendStatus(401);
    }
}