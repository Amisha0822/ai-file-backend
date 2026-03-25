import app from "../src/app";
import connectDatabase from "../src/config/database";
import { initializeS3 } from "../src/config/s3";

// Helper to ensure database and S3 are initialized in serverless
const init = async () => {
  await connectDatabase();
  initializeS3();
};

// Vercel expects the express app to be exported
export default async (req: any, res: any) => {
  await init();
  return app(req, res);
};
