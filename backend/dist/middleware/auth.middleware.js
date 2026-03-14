import jwt from 'jsonwebtoken';
export const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('CRITICAL: JWT_SECRET environment variable is not set!');
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Now valid due to global declaration (or use custom interface)
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
//# sourceMappingURL=auth.middleware.js.map