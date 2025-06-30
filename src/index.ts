import express, { Express, Request, Response , Application } from 'express';
import { PrismaClient } from '../generated/prisma'
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import deckRouter from './routes/deck';
import cardRouter from './routes/card';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(express.json());

export const prisma = new PrismaClient();

app.use('/auth', authRouter);
app.use('/card', cardRouter);
app.use('/deck', deckRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Home');
});

app.listen(port, () => {
    console.log(`Server @ http://localhost:${port}`);
});
