import { writeFile } from 'fs-extra';
import { join } from 'path';
import { exec } from 'child_process';

module.exports = () =>
  new Promise((resolve, reject) => {
    const server = global.serverProcess;
    if (server) {
      server.on('exit', () =>
        exec('killall query-engine-de', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            reject(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          resolve();
        })
      );
      server.kill();
    } else reject('no server to kill');
  }).then(() =>
    writeFile(
      'prisma/.env',
      `PRISMA_SOURCE=file:${join(process.cwd(), global.SQLITE_FILE)}`
    )
  );
