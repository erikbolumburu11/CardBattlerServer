import { Router, Request, Response } from "express";
import { registerLocalUser } from "../utils/user";
import { comparePassword } from "../utils/hash";
import { prisma } from "..";
import jwt from 'jsonwebtoken';
import { authenticateJWT } from "../middleware/authenticateJWT";

const cardRouter = Router();

cardRouter.post('/new', authenticateJWT, async (req: Request, res: Response) => {
    if(!req.user?.admin) {
        res.status(401).send("Unauthorized Access")
        return;
    }
    try {
        const card = await prisma.card.create({
            data: {
                name:   req.body.name,
                damage: req.body.damage,
                health: req.body.health,
                image:  req.body.image
            }
        })
        res.status(200).send(card);
    } catch (e) {
        res.status(400).send(e);
    }
});

cardRouter.get('/get', async (req: Request, res: Response) => {
    try {
        const card = await prisma.card.findUniqueOrThrow({
            where: {
                id: req.body.id
            }
        })
        res.status(200).send(card);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

export default cardRouter;