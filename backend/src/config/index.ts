import dotenv from 'dotenv';

dotenv.config();

const requiredEnvs = ['PORT', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'DATABASE_URL', 'NODE_ENV'];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT as string, 10),
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
  databaseUrl: process.env.DATABASE_URL as string,
  nodeEnv: process.env.NODE_ENV as string,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
