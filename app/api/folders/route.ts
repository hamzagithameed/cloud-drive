import { connectDB } from "@/lib/db";
import Folder from "@/models/Folder";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

// GET /api/folders?parentId=  — list folders in a directory
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId") || null;

    const folders = await Folder.find({
      owner: req.userId,
      parentId,
    }).sort({ name: 1 });

    return successResponse({ folders });
  } catch (err) {
    console.error("[FOLDERS GET]", err);
    return errorResponse("Failed to fetch folders", 500);
  }
});

// POST /api/folders — create a folder
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, parentId } = await req.json();
    if (!name?.trim()) return errorResponse("Folder name is required");

    await connectDB();

    // Prevent duplicate names in the same directory
    const existing = await Folder.findOne({
      name: name.trim(),
      owner: req.userId,
      parentId: parentId || null,
    });
    if (existing) return errorResponse("A folder with that name already exists", 409);

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.userId,
      parentId: parentId || null,
    });

    return successResponse({ folder }, 201);
  } catch (err) {
    console.error("[FOLDERS POST]", err);
    return errorResponse("Failed to create folder", 500);
  }
});
