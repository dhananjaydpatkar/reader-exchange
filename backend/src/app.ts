import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import exchangeRoutes from './routes/exchange.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import localityRoutes from './routes/locality.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev')); // Add request logging
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/localities', localityRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
