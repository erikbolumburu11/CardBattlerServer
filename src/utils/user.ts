import { Response } from 'express'
import { prisma } from "..";
import { hashPassword } from "./hash";

export async function registerLocalUser(username: string, email: string, password: string, res: Response){
    try {
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashPassword(password)
            }
        })
        res.status(200).send();
    } catch (e) {
        res.status(400).send(e);
    }
}
