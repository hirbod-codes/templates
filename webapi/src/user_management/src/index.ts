import { Hono } from 'hono'
import * as dotenv from 'dotenv'
dotenv.config()
import { authRoutes } from './routes/auth-routes.ts'
import { limiter } from './middlewares.ts'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { bodyLimit } from 'hono/body-limit'

export type envSchema = {
  HOST: string,
  PORT: string,
  DATABASE_URL: string,
  DATABASE_NAME: string,
  DATABASE_PASSWORD: string,
  JWT_SECRET: string,
  JWT_MAX_AGE_SECONDS: string,
  VERIFICATION_JWT_MAX_AGE_SECONDS: string,
  VERIFICATION_CODE_MAX_AGE_SECONDS: string,
  SALT_ROUNDS: string,
  GMAIL_USERNAME: string,
  GMAIL_PASSWORD: string,
  GOOGLE_CLOUD_CLIENT_ID: string,
  GOOGLE_CLOUD_CLIENT_SECRET: string,
  GOOGLE_CLOUD_REFRESH_TOKEN: string,
};

const app = new Hono({ strict: true })

app.use(limiter(15 * 60 * 1000))

app.use(bodyLimit({
  maxSize: 1024,
  onError: (c) => c.text('overflow :(', 413)
}))

app.use(
  '/*',
  cors({
    origin: ['*'],
    allowHeaders: ['*'],
    allowMethods: ['*'],
  })
)

app.use(trimTrailingSlash())

app.route('/api/auth', authRoutes())

// import { testRoutes } from './routes/test-routes.ts'
// app.route('/api/test', testRoutes())

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch
}
