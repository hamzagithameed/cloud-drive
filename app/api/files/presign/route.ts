import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import s3, { BUCKET_NAME } from "@/lib/s3";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType || !fileSize) {
      return errorResponse("fileName, fileType and fileSize are required");
    }

    // Max 100MB
    if (fileSize > 100 * 1024 * 1024) {
      return errorResponse("File size exceeds 100MB limit");
    }

    const ext = fileName.split(".").pop();
    const s3Key = `uploads/${req.userId}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    // Presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return successResponse({ presignedUrl, s3Key, s3Url });
  } catch (err) {
    console.error("[PRESIGN]", err);
    return errorResponse("Failed to generate presigned URL", 500);
  }
});
