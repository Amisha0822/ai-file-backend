import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  frontendUrl: string;
  groqApiKey: string;
  aws: {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
    s3Bucket: string | undefined;
  };
  storage: {
    type: "auto" | "local" | "s3";
    maxFileSize: number;
  };
}

const config: EnvConfig = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/google-drive-clone",
  jwtSecret: process.env.JWT_SECRET || "Harsh@7877",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  groqApiKey: process.env.GROQ_API_KEY || "",
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    s3Bucket: process.env.AWS_S3_BUCKET,
  },
  storage: {
    type: (process.env.STORAGE_TYPE as "auto" | "local" | "s3") || "auto",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "104857600", 10),
  },
};

if (!config.jwtSecret || config.jwtSecret === "Harsh@7877") {
  console.warn(
    "⚠️  Warning: Using default JWT_SECRET. Please set a secure secret in production!"
  );
}

export default config;
