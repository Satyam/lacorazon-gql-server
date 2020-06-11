module.exports = () =>
  new Promise((resolve, reject) => {
    const server = global.serverProcess;
    if (server) {
      server.on('exit', resolve);
      server.kill();
    } else reject('no server to kill');
  });
