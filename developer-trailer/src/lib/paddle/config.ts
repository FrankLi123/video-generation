import { Environment, Paddle } from '@paddle/paddle-node-sdk'

// Validate required environment variables
const requiredEnvVars = {
  PADDLE_API_KEY: process.env.PADDLE_API_KEY,
  PADDLE_ENVIRONMENT: process.env.PADDLE_ENVIRONMENT,
  PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET,
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
}

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`${key} environment variable is required`)
  }
}

export const paddle = new Paddle(
  process.env.PADDLE_API_KEY!,
  {
    environment: process.env.PADDLE_ENVIRONMENT as Environment,
  }
)

export const paddleConfig = {
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
  environment: process.env.PADDLE_ENVIRONMENT as Environment,
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET!,
}