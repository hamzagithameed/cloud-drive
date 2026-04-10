import { NextRequest } from "next/server";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import s3, { BUCKET_NAME } from "@/lib/s3";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    console.log("[S3-TEST] Testing S3 connection...");
    console.log("[S3-TEST] Config:", {
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    // Try to list buckets to verify credentials
    const command = new ListBucketsCommand({});
    const response = await s3.send(command);
    
    console.log("[S3-TEST] S3 connection successful");
    console.log("[S3-TEST] Buckets found:", response.Buckets?.length);

    return successResponse({
      message: "S3 connection successful",
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      bucketsFound: response.Buckets?.length || 0
    });
  } catch (err: any) {
    console.error("[S3-TEST] Error:", {
      message: err.message,
      code: err.code,
      name: err.name
    });
    return errorResponse(`S3 connection failed: ${err.message}`, 500);
  }
}
