import serverless from 'serverless-http';
import { startServer } from '../../server';

let appHandler: any;

export const handler = async (event: any, context: any) => {
  process.env.NETLIFY = "true";
  if (!appHandler) {
    const app = await startServer();
    appHandler = serverless(app, { basePath: '/.netlify/functions/api' });
  }
  return appHandler(event, context);
};
