import { start, stop } from './server';

async function startup() {
  try {
    await start();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startup();

const shutdown = async () => {
  await stop();
  process.exit();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});
