import 'dotenv/config';
import { start } from '../server';

process.env.SERVER_PORT = 8081;
module.exports = () => start();
