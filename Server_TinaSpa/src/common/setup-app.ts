import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

export function setupApp(app: INestApplication): void {
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5057')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Security headers (nosniff, frameguard, HSTS, ...). This is a JSON API, so a strict CSP is safe.
  app.use(
    helmet({
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({
    origin: origins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
