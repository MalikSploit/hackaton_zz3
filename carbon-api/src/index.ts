import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET as string || 'This_Is_A_Super_Secret_Key!!!',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('API ready → http://localhost:3000'));