import express from 'express';
import cors from 'cors';
import { verifyToken } from './src/middlewares/auth.middleware';
import dotenv from 'dotenv';
import router from './src/routes/routes';

dotenv.config();

const app = express();

const PORT = 8091;

app.use(cors({ origin: '*' }));
app.options('*', cors());

app.use('/api/v1', verifyToken, router);

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
