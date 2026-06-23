const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const token = req.headers.token;
    
    if (!token) {
        return res.status(403).json({
            message: "Token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;

        req.userId = userId;
        next();
    } catch (err) {
        return res.status(403).json({
            message: "Token was incorrect"
        });
    }
}

module.exports = {
    authMiddleware
};