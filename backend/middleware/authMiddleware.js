const jwt = require("jsonwebtoken");

const verifyToken = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Token missing" });
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: "Access denied" });
            }

            req.user = decoded;
            next();

        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
};

module.exports = verifyToken; 