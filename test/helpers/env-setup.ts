import * as dotenv from 'dotenv';
import * as path from 'path';

// load .env.test.local before any NestJS/Prisma code
dotenv.config({ path: path.resolve(__dirname, '../../.env.test.local'), override: true });
