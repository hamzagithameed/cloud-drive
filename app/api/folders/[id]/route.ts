import { connectDB } from "@/lib/db";
import Folder from "@/models/Folder";
import File from "@/models/File";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export const PATCH = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { name } = await req.json();
      if (!name?.trim()) return errorResponse("Folder name is required");

      await connectDB();

      const folder = await Folder.findOneAndUpdate(
        { _id: id, owner: req.userId },
        { name: name.trim() },
        { new: true }
      );

      if (!folder) return errorResponse("Folder not found", 404);
      return successResponse({ folder });
    } catch (err) {
      console.error("[FOLDER PATCH]", err);
      return errorResponse("Failed to rename folder", 500);
    }
  }
);

export const DELETE = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await connectDB();

      const folder = await Folder.findOne({ _id: id, owner: req.userId });
      if (!folder) return errorResponse("Folder not found", 404);

      await deleteFolderRecursive(id, req.userId);
      return successResponse({ message: "Folder deleted" });
    } catch (err) {
      console.error("[FOLDER DELETE]", err);
      return errorResponse("Failed to delete folder", 500);
    }
  }
);

async function deleteFolderRecursive(folderId: string, userId: string) {
  await File.deleteMany({ folderId, owner: userId });
  const subFolders = await Folder.find({ parentId: folderId, owner: userId });
  for (const sub of subFolders) {
    await deleteFolderRecursive(String(sub._id), userId);
  }
  await Folder.deleteOne({ _id: folderId });
}
