import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import File from "@/models/File";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await connectDB();

    const file = await File.findOne({
      shareToken: token,
      isPublic: true,
    }).select("-owner -shareToken");

    if (!file) return errorResponse("File not found or link has been revoked", 404);
    return successResponse({ file });
  } catch (err) {
    console.error("[SHARED GET]", err);
    return errorResponse("Failed to fetch shared file", 500);
  }
}
