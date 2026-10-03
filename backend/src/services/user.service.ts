import { db } from './../libs/db.js';
import bcrypt from 'bcrypt';

export async function getUserById(userId: string) {
    const user = await db.orm.public.User.first({
        id: userId
    });

    if (!user) {
        throw new Error('User not found');
    }

    return { name: user.name, surname: user.surname, type: user.type };
};

export async function updateUser(
    userId: string,
    name?: string,
    surname?: string,
    password?: string,
    password_confirm?: string
) {
    const user = await db.orm.public.User.first({
        id: userId
    });

    if (!user) {
        throw new Error('User not found');
    }

    const updateData: { name?: string; surname?: string; password_hash?: string } = {};

    if (name) updateData.name = name;
    if (surname) updateData.surname = surname;

    if (password || password_confirm) {
        if (password !== password_confirm) {
            throw new Error('Passwords do not match');
        }

        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }
    }

    if (Object.keys(updateData).length === 0) {
        return user;
    }

    const updatedUser = await db.orm.public.User
        .where({ id: userId })
        .update(updateData);

    return updatedUser;
}