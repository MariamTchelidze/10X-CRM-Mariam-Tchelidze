import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const comparePasswords = (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
