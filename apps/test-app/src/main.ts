import { ErrorCallback, getKoaServer } from '@local/server-essentials';
import { config, upTime } from './config';

const errorCallback: ErrorCallback = (error, ctx) => {
  console.error('Error:', error);
  ctx.status = 500;
  ctx.body = 'Internal server error';
};

async function main() {
  const koaApp = await getKoaServer({
    logger: console,
    errorCallback,
    serviceName: config.service.name,
    serviceVersion: config.service.version,
  });

  koaApp.use(async ctx => {
    const getUpTime = upTime();
    ctx.body = {
      config,
      getUpTime,
    };
  });

  koaApp.listen(config.server.port, () => {
    console.log(`Server listening on ${config.server.url}`);
  });
}

main().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
