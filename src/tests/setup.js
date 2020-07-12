import dotenv from 'dotenv';
import { join } from 'path';
import { copy, writeFile } from 'fs-extra';

dotenv.config({ path: '.env.tests' });
const { parsed } = dotenv.config();

function relPath(path) {
  return join(process.cwd(), path);
}

module.exports = async () => {
  const jsonFile = process.env.JSON_FILE;
  const sqliteFile = process.env.SQLITE_FILE;
  global.SQLITE_FILE = parsed.SQLITE_FILE;
  if (!jsonFile) throw new Error('Missing JSON_FILE environment variable');
  if (!sqliteFile) throw new Error('Missing SQLITE_FILE environment variable');
  await copy(relPath('src/tests/data.orig.json'), relPath(jsonFile));
  await copy(relPath('src/tests/db.orig.sqlite'), relPath(sqliteFile));

  await writeFile('prisma/.env', `PRISMA_SOURCE=file:${relPath(sqliteFile)}`);
};
