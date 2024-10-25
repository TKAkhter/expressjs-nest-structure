import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRoutes } from './routes/routes';
import { morganStream } from './common/winston/winston';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev', { stream: morganStream }));
app.use(express.json());
app.post('/api', apiRoutes);

export default app;