import { db } from "./../libs/db.js";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Type } from "../types/user.js";

export async function loginUser(email: string, password: string) {
  const user = await db.orm.public.User.first({
    email: email,
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return user;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  surname: string,
  type: Type,
) {
  const existingUser = await db.orm.public.User.first({
    email: email,
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const newUser = await db.orm.public.User.create({
    email,
    password_hash,
    name,
    surname,
    type,
  });

  return newUser;
}

export function generateJWT(email: string) {
  const user = db.orm.public.User.first({
    email: email,
  });

  if (!user) {
    throw new Error("User not found");
  }

  const payload = {
    email: email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

  return token;
}
