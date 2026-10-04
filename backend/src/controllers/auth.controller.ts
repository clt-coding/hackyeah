import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { Type } from '../types/user.js';

// Konfiguracja bezpiecznego ciasteczka
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni w ms
};

export async function login(req: Request, res: Response) {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await authService.loginUser(email, password);

        const token = authService.generateJWT(user);
        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        return res.status(401).json({ error: (error as Error).message });
    }
}

export async function register(req: Request, res: Response) {
    const { email, email_confirm, password, password_confirm, name, surname, type } = req.body as {
        email?: string;
        email_confirm?: string;
        password?: string;
        password_confirm?: string;
        name?: string;
        surname?: string;
        type?: Type
    };

    if (!email || !email_confirm || !password || !password_confirm || !name || !surname || type === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (email !== email_confirm) {
        return res.status(400).json({ error: 'Email addresses do not match' });
    }

    if (password !== password_confirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const user = await authService.registerUser(email, password, name, surname, type);
        if (user) {
            const token = authService.generateJWT(user);

            res.cookie('token', token, COOKIE_OPTIONS);

            return res.status(201).json({ message: 'Registration successful', user: { email } });
        }
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
}

export function logout(_req: Request, res: Response) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    return res.status(200).json({ message: 'Logout successful' });
}