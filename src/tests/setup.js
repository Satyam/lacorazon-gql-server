import dotenv from 'dotenv';
import { join } from 'path';
import { copy, writeFile } from 'fs-extra';
import { spawn } from 'child_process';

dotenv.config({ path: '.env.tests' });
const { parsed } = dotenv.config();

function relPath(path) {
  return join(process.cwd(), path);
}

module.exports = async () => {
  const jsonFile = process.env.JSON_FILE;
  const sqliteFile = process.env.SQLITE_FILE;
  if (!jsonFile) throw new Error('Missing JSON_FILE environment variable');
  if (!sqliteFile) throw new Error('Missing SQLITE_FILE environment variable');
  await copy(relPath('src/tests/data.orig.json'), relPath(jsonFile));
  await copy(relPath('src/tests/db.orig.sqlite'), relPath(sqliteFile));

  await writeFile('prisma/.env', `PRISMA_SOURCE=file:${relPath(sqliteFile)}`);
  console.log('Starting test server.');

  return new Promise((resolve, reject) => {
    const server = spawn('ts-node', ['--files', 'src/index.ts']);
    server.stdout.on('data', (data) => {
      console.log(data.toString());
      if (
        data
          .toString()
          .includes(
            `Apollo Server on ${process.env.HOST}:${
              process.env.SERVER_PORT || 8000
            }${process.env.GRAPHQL}`
          )
      ) {
        console.log('Server running.');
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    server.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
    });

    server.on('error', reject);

    global.serverProcess = server;
    global.SQLITE_FILE = parsed.SQLITE_FILE;
  });
};
