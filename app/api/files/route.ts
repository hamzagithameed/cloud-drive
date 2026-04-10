import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { connectDB } from "@/lib/db";
import File from "@/models/File";
import { successResponse, errorResponse } from "@/utils/apiResponse";

// GET /api/files — list all files for the authenticated user
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId") || null;

    const files = await File.find({
      owner: req.userId,
      folderId,
    }).sort({ createdAt: -1 });

    return successResponse({ files });
  } catch (err) {
    console.error("[FILES GET]", err);
    return errorResponse("Failed to fetch files", 500);
  }
});
