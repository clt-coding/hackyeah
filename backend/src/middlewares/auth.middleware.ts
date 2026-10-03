import { Request, Response, NextFunction } from 'express';
import jwtPkg from 'jsonwebtoken';

const jwt = (jwtPkg as any).default || jwtPkg;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Forbidden. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}