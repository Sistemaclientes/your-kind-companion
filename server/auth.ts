import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-saas-provas';

export interface UserPayload {
  id: number;
  email: string;
  is_master: boolean;
}

export const authService = {
  generateToken: (user: UserPayload) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '8h' });
  },

  verifyToken: (token: string): UserPayload | null => {
    try {
      return jwt.verify(token, SECRET_KEY) as UserPayload;
    } catch (err) {
      return null;
    }
  },

  hashPassword: (password: string) => {
    return bcrypt.hashSync(password, 10);
  },

  comparePassword: (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
  }
};

export const adminMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  req.user = payload;
  next();
};

export const masterMiddleware = (req: any, res: any, next: any) => {
  if (!req.user?.is_master) {
    return res.status(403).json({ error: 'Master access required' });
  }
  next();
};
