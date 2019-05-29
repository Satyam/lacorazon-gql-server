import dotenv from 'dotenv';

dotenv.config({ path: '.env.tests' });
dotenv.config();

// eslint-disable-next-line import/first
import { start } from '../server';

module.exports = () => start();
