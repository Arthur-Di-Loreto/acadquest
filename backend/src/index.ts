import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

bootstrap().catch((err) => {
  console.error('[server] Fatal error during startup:', err);
  process.exit(1);
});
