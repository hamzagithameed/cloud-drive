import { connectDB } from "@/lib/db";
import File from "@/models/File";
import Folder from "@/models/Folder";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export const PATCH = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { folderId } = await req.json();

      await connectDB();

      if (folderId) {
        const folder = await Folder.findOne({ _id: folderId, owner: req.userId });
        if (!folder) return errorResponse("Target folder not found", 404);
      }

      const file = await File.findOneAndUpdate(
        { _id: id, owner: req.userId },
        { folderId: folderId || null },
        { new: true }
      );

      if (!file) return errorResponse("File not found", 404);
      return successResponse({ file });
    } catch (err) {
      console.error("[FILE MOVE]", err);
      return errorResponse("Failed to move file", 500);
    }
  }
);
