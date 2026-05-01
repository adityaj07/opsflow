// Hash a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  return Bun.password.hash(password);
};

// Compare plain text password with stored hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return Bun.password.verify(password, hash);
};
