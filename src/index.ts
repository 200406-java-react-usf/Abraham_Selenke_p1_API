import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';

import { sessionMiddleware } from './middleware/sessionMiddeware';
import { corsFilter } from './middleware/cors-filter'

import { UserRouter } from './routers/user-router';
import { AuthRouter } from './routers/auth-router';
import { ReimbursementRouter } from './routers/reimbursement-router';

//Environment Configuration
dotenv.config();

//Database Configuration
export const connectionPool: Pool = new Pool({
    host: process.env['DB_HOST'],
    port: +process.env['DB_PORT'],
    database: process.env['DB_NAME'],
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    max: 5
})

//Web Server Configuration
const app = express();

app.use(sessionMiddleware);
app.use(corsFilter);
app.use('/', express.json());
app.use('/users', UserRouter);
app.use('/auth', AuthRouter);
app.use('/account', ReimbursementRouter);

app.listen(8080, () => {
    console.log('Application running and listening at: http://localhost:8080');
})
