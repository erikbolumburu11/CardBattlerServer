import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '..';

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        res.status(400).send();
        return;
    }

    const token = authHeader.split(' ')[1];
    const user = await new Promise<JwtPayload>((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET!, async (error, user) => {
            if (error || typeof user !== 'object' || !user) return reject(error || new Error('Invalid Token'));
            resolve(user as JwtPayload);
        });
    })

    const userSearch = await prisma.user.findUnique({
        where: {
            id: (user as jwt.JwtPayload).id
        }
    })

    if(userSearch === null) {
        res.status(400).send();
        return;
    }

    req.user = userSearch;
    next();
}
