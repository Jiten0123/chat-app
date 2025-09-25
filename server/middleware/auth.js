import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) return res.status(401).json({ success: false, message: "No token provided" });


        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        // token payload contains `userId` (lowercase) — use that
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.json({success: false, message: "User not found"})

        req.user = user;
        next();
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
