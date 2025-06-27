import { Router, Request, Response } from "express";
import { registerLocalUser } from "../utils/user";
import { comparePassword } from "../utils/hash";
import { prisma } from "..";
import jwt from 'jsonwebtoken';
import { authenticateJWT } from "../middleware/authenticateJWT";

const authRouter = Router();

authRouter.post('/register', (req: Request, res: Response) => {
    registerLocalUser(req.body.username, req.body.email, req.body.password, res);
});

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                username: req.body.username
            }
        })

        if(!comparePassword(req.body.password, user.password!)) res.status(400).send("Invalid Credentials.");

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' }) ;
        res.status(200).json({ token });
    } catch (e) {
        res.status(400).send("Invalid Credentials");
    }
});

authRouter.get('/status', authenticateJWT, (req: Request, res: Response) => {
    if(req.user){
        res.status(200).send("Logged in as: " + req.user.username);
    }
    else{
        res.status(401).send("Not Authenticated");
    }
});

export default authRouter;