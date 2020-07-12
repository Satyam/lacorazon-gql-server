import { writeFile } from 'fs-extra';
import { join } from 'path';

module.exports = () =>
  writeFile(
    'prisma/.env',
    `PRISMA_SOURCE=file:${join(process.cwd(), global.SQLITE_FILE)}`
  );
