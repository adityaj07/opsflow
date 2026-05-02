import argon2 from 'argon2';

// Hash a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

// Compare plain text password with stored hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return argon2.verify(hash, password);
};
