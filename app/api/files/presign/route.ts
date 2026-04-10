import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import s3, { BUCKET_NAME } from "@/lib/s3";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log("[PRESIGN] Starting presign request");
    
    const { fileName, fileType, fileSize } = await req.json();
    console.log("[PRESIGN] File details:", { fileName, fileType, fileSize });

    if (!fileName || !fileType || !fileSize) {
      return errorResponse("fileName, fileType and fileSize are required");
    }

    // Max 100MB
    if (fileSize > 100 * 1024 * 1024) {
      return errorResponse("File size exceeds 100MB limit");
    }

    const ext = fileName.split(".").pop();
    const s3Key = `uploads/${req.userId}/${uuidv4()}.${ext}`;
    console.log("[PRESIGN] Generated S3 key:", s3Key);

    console.log("[PRESIGN] S3 Config:", {
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    console.log("[PRESIGN] Generating presigned URL...");
    // Presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log("[PRESIGN] Presigned URL generated successfully");

    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log("[PRESIGN] S3 URL:", s3Url);

    return successResponse({ presignedUrl, s3Key, s3Url });
  } catch (err: any) {
    console.error("[PRESIGN] Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    return errorResponse(`Failed to generate presigned URL: ${err.message}`, 500);
  }
});
