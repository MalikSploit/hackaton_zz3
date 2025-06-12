import { Router, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { db, User } from '../db';

const router = Router();

const signup: RequestHandler = async (req, res) => {
    const { name, email, password } = req.body as Record<string, string>;

    if (!name || !email || !password) {
        res.status(400).json({ ok: false, error: 'Champs manquants.' });
        return;
    }

    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
        res.status(409).json({ ok: false, error: 'Email déjà utilisé.' });
        return;
    }

    const hash = await bcrypt.hash(password, 10);

    const info = db
        .prepare('INSERT INTO users (full_name, email, password) VALUES (?,?,?)')
        .run(name.trim(), email.toLowerCase(), hash);

    const user = db
        .prepare('SELECT id, full_name, email, created_at FROM users WHERE id = ?')
        .get(info.lastInsertRowid as number);

    req.session.userId = info.lastInsertRowid as number;
    res.json({ ok: true, user });
};

router.post('/signup', signup);

const login: RequestHandler = async (req, res) => {
    const { email, password } = req.body as Record<string, string>;

    if (!email || !password) {
        res.status(400).json({ ok: false, error: 'Champs manquants.' });
        return;
    }

    const user = db
        .prepare('SELECT * FROM users WHERE email = ?')
        .get(email.toLowerCase()) as User | undefined;

    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ ok: false, error: 'Identifiants invalides.' });
        return;
    }

    req.session.userId = user.id;
    const { password: _, ...safeUser } = user;
    res.json({ ok: true, user: safeUser });
};
router.post('/login', login);

router.get('/me', ((req, res) => {
    if (!req.session.userId) return res.status(401).json({ ok: false });

    const user = db
        .prepare('SELECT id, full_name, email, created_at FROM users WHERE id = ?')
        .get(req.session.userId) as Omit<User, 'password'>;

    res.json({ ok: true, user });
}) as RequestHandler);

router.post('/logout', ((req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
}) as RequestHandler);

export default router;
