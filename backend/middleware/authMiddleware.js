import jwt from "jsonwebtoken";
export const verifyUser = (req, res, next) => {
  // Check for token in cookies first (for web frontend)
  let token = req.cookies.authToken;

  // If no cookie token, check Authorization header (for mobile apps)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

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
