import dotenv from 'dotenv';
import connectToDb from './db/db';

dotenv.config();

connectToDb();
