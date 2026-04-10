import { NextRequest } from "next/server";
import { successResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  const envCheck = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  };

  return successResponse({
    message: "Environment variables check",
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}