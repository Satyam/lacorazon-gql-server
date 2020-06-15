import { writeFile } from 'fs-extra';
import { join } from 'path';

module.exports = () =>
  new Promise((resolve, reject) => {
    const server = global.serverProcess;
    if (server) {
      server.on('exit', resolve);
      server.kill();
    } else reject('no server to kill');
  }).then(() =>
    writeFile(
      'prisma/.env',
      `PRISMA_SOURCE=file:${join(process.cwd(), global.SQLITE_FILE)}`
    )
  );
