import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { connectDB } from "@/lib/db";
import File from "@/models/File";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, originalName, s3Key, s3Url, mimeType, size, folderId } =
      await req.json();

    if (!name || !s3Key || !s3Url || !mimeType || !size) {
      return errorResponse("Missing required file metadata");
    }

    await connectDB();

    const file = await File.create({
      name,
      originalName,
      s3Key,
      s3Url,
      mimeType,
      size,
      owner: req.userId,
      folderId: folderId || null,
    });

    return successResponse({ file }, 201);
  } catch (err) {
    console.error("[CONFIRM]", err);
    return errorResponse("Failed to save file metadata", 500);
  }
});
