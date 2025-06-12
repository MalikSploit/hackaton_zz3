import { Router, Request, Response, RequestHandler } from 'express';
import { SiweMessage } from 'siwe';
import { db, User } from '../db';
import { ethers } from 'ethers';
import { Session } from 'express-session';

interface SessionExt extends Session { nonce?: string; userId?: number; }
interface Req extends Request { session: SessionExt; }

const router = Router();

// router.get('/nonce', (req: Req, res: Response): void => {
//     req.session.nonce = ethers.hexlify(ethers.randomBytes(8));
//     res.json({ nonce: req.session.nonce });
// });
//
// router.post('/login', async (req: Req, res: Response): Promise<void> => {
//     const { message, signature, firstName, lastName, email } = req.body;
//     try {
//         const { success, data } = await new SiweMessage(message).verify({
//             signature,
//             nonce: req.session.nonce,
//             time: new Date().toISOString()
//         });
//         if (!success) throw new Error('Signature invalide');
//
//         let user = db.prepare('SELECT * FROM users WHERE address = ?').get(data.address) as User | undefined;
//         if (!user) {
//             db.prepare('INSERT INTO users (address, first_name, last_name, email) VALUES (?,?,?,?)').run(
//                 data.address,
//                 firstName,
//                 lastName,
//                 email
//             );
//             user = db.prepare('SELECT * FROM users WHERE address = ?').get(data.address) as User;
//         }
//
//         req.session.userId = user.id;
//         res.json({ ok: true, user });
//     } catch (e: any) {
//         res.status(400).json({ ok: false, error: e.message });
//     }
// });

const currentUser: RequestHandler = (req, res): void => {
    const sess = req.session as SessionExt;
    if (!sess.userId) {
        res.status(401).json({ ok: false });
        return;
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sess.userId) as User;
    res.json({ ok: true, user });
};
router.get('/me', currentUser);

router.post('/logout', (req: Req, res: Response): void => {
    req.session.destroy(() => res.json({ ok: true }));
});

export default router;