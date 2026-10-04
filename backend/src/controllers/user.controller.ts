import { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

export async function updateUser(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, surname, password, password_confirm } = req.body as {
        name?: string;
        surname?: string;
        password?: string;
        password_confirm?: string;
    };

    try {
        const updatedUser = await userService.updateUser(
            userId,
            name,
            surname,
            password,
            password_confirm
        );

        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        const message = (error as Error).message;

        if (message === 'Passwords do not match') {
            return res.status(400).json({ error: message });
        }
        if (message === 'User not found') {
            return res.status(404).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
}

export async function deleteUser(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await userService.deleteUser(userId);

        res.clearCookie('token');

        return res.status(200).json(result);
    } catch (error) {
        const message = (error as Error).message;

        if (message === 'User not found') {
            return res.status(404).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
}