import { Router, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { db, User } from '../db';

const router = Router();

router.get('/session', (_req, res) => {
    res.json({ logged: !!_req.session.userId });
});

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

const changePassword: RequestHandler = async (req, res) => {
    const userId = req.session.userId;
    const { current, next } = req.body as {
        current?: string;
        next?: string;
    };

    if (!userId) {
        res.status(401).json({ ok: false, error: 'Non authentifié.' });
        return;
    }
    if (!current || !next) {
        res.status(400).json({ ok: false, error: 'Champs manquants.' });
        return;
    }

    const row = db
        .prepare('SELECT password FROM users WHERE id = ?')
        .get(userId) as Pick<User, 'password'> | undefined;
    if (!row) {
        res.status(404).json({ ok: false, error: 'Utilisateur introuvable.' });
        return;
    }

    const match = await bcrypt.compare(current, row.password);
    if (!match) {
        res.status(400).json({ ok: false, error: 'Mot de passe actuel incorrect.' });
        return;
    }

    const newHash = await bcrypt.hash(next, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, userId);
    res.json({ ok: true });
};
router.post('/change-password', changePassword);

export default router;
