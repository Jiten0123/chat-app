import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        // sanitize token header (trim + remove wrapping quotes)
        const rawToken = req.headers.token || "";
        const token = rawToken.toString().trim().replace(/^['"]|['"]$/g, "");
        if (!token) return res.status(401).json({ success: false, message: "No token provided" });

        // sanitize JWT_SECRET
        const secret = (process.env.JWT_SECRET || "").toString().trim().replace(/^['"]|['"]$/g, "");

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        // token payload contains `userId`
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json({ success: false, message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}