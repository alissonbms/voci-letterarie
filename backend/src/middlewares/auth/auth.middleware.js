import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = await req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        message: "You are not authorized, access denied.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "You are not authorized, access denied.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error: ", error);
    return res.status(401).json({
      message: "You are not authorized, access denied.",
    });
  }
};

export default protectRoute;
