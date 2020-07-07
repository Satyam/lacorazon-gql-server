import { writeFile } from 'fs-extra';
import { join } from 'path';
import { exec } from 'child_process';

module.exports = () =>
  writeFile(
    'prisma/.env',
    `PRISMA_SOURCE=file:${join(process.cwd(), global.SQLITE_FILE)}`
  ).then(() => {
    const server = global.serverProcess;
    if (server) {
      server.on('exit', () =>
        exec('killall query-engine-de', (stdout, stderr) => {
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        })
      );
      server.kill();
    }
  });
