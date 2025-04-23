import jwt from "jsonwebtoken";
export const verifyUser = (req, res, next) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, please log in" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Proceed to next middleware
  } catch (error) {
    return res.status(403).json({ message: "Invalid token, access denied" });
  }
};
