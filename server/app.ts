import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { userRoute } from './routes/user';
import { authRoute } from './routes/auth';

const app = new Hono();
app.use('*', logger());

const allowedOrigins = process.env.APP_ALLOWED_ORIGINS
  ? process.env.APP_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(
  '/api/*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

const apiRoutes = app
  .basePath('/api')
  .route('/user', userRoute)
  .route('/', authRoute);

// Serve frontend for all other routes
app.get('*', serveStatic({ root: './frontend/dist' }));
app.get('*', serveStatic({ path: './frontend/dist/index.html' }));

export default app;
