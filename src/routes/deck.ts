import { Router, Request, Response } from "express";
import { registerLocalUser } from "../utils/user";
import { comparePassword } from "../utils/hash";
import { prisma } from "..";
import jwt from 'jsonwebtoken';
import { authenticateJWT } from "../middleware/authenticateJWT";

const deckRouter = Router();

deckRouter.post('/new', authenticateJWT, async (req: Request, res: Response) => {
    if(req.user == null || req.user == undefined) {
        res.status(401).send("Not Logged In");
    }
    try {
        const deck = await prisma.deck.create({
            data: {
                name: req.body.name,
                user: {
                    connect: {
                        id: req.user?.id
                    }
                },
            }
        })
        res.status(200).send(deck);
    } catch (e) {
        res.status(400).send(e);
    }
});

deckRouter.post('/add', authenticateJWT, async (req: Request, res: Response) => {
    if(req.user == null || req.user == undefined) {
        res.status(401).send("Not Logged In");
    }

    try {
        const {deckId, cardId } = req.body;

        // Check if card is already in deck
        const existingDeckCard = await prisma.deckCard.findUnique({
            where: {
                deckId_cardId: {
                    deckId,
                    cardId
                }
            }
        });

        // Update quantity if it exists, otherwise create new DeckCard
        if(existingDeckCard) {
            await prisma.deckCard.update({
                where: {
                    deckId_cardId: {
                        deckId,
                        cardId
                    },
                },
                data: {
                    quantity: {
                        increment: 1,
                    }
                }
            })
        }
        else {
            await prisma.deckCard.create({
                data: {
                    deck: { connect: { id: deckId } },
                    card: { connect: { id: cardId } },
                }
            })
        }

        // Get Deck
        const deck = await prisma.deck.findUniqueOrThrow({
            where: {
                id: deckId
            },
            include: {
                cards: true
            }
        })
        res.status(200).send(deck);
    } catch (e) {
        res.status(400).send(e);
    }
});

deckRouter.post('/remove', authenticateJWT, async (req: Request, res: Response) => {
    if(req.user == null || req.user == undefined) {
        res.status(401).send("Not Logged In");
    }

    try {
        const {deckId, cardId } = req.body;

        // Check if card is already in deck
        const existingDeckCard = await prisma.deckCard.findUnique({
            where: {
                deckId_cardId: {
                    deckId,
                    cardId
                }
            }
        });

        // Decerement quantity if card exists, otherwise delete DeckCard record
        if(existingDeckCard?.quantity! > 1) {
            await prisma.deckCard.update({
                where: {
                    deckId_cardId: {
                        deckId,
                        cardId
                    },
                },
                data: {
                    quantity: {
                        decrement: 1,
                    }
                }
            })
        }
        else {
            await prisma.deckCard.delete({
                where: {
                    deckId_cardId: {
                        deckId,
                        cardId
                    }
                }
            })
        }

        // Get Deck
        const deck = await prisma.deck.findUniqueOrThrow({
            where: {
                id: deckId
            },
            include: {
                cards: true
            }
        })
        res.status(200).send(deck);
    } catch (e) {
        res.status(400).send(e);
    }
});

deckRouter.post('/delete', async (req: Request, res: Response) => {
    try {
        const deck = await prisma.deck.delete({
            where: {
                id: req.body.id
            }
        })
        res.status(200).send(`${deck.name} Deleted Successfully`);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

deckRouter.get('/get', async (req: Request, res: Response) => {
    try {
        const deck = await prisma.deck.findUniqueOrThrow({
            where: {
                id: req.body.id
            },
            include: {
                cards: true
            }
        })
        res.status(200).send(deck);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

export default deckRouter;