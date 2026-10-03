import { Request } from 'express';

export interface JwtPayload {
    id: string;
    email: string;
    name: string;
    surname: string;
    type: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}