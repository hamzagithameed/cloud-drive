import { connectDB } from "@/lib/db";
import File from "@/models/File";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import crypto from "crypto";

export const POST = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await connectDB();

      const file = await File.findOne({ _id: id, owner: req.userId });
      if (!file) return errorResponse("File not found", 404);

      const shareToken = file.shareToken ?? crypto.randomBytes(24).toString("hex");
      file.shareToken = shareToken;
      file.isPublic = true;
      await file.save();

      const shareUrl = `${process.env.NEXTAUTH_URL}/shared/${shareToken}`;
      return successResponse({ shareUrl, shareToken });
    } catch (err) {
      console.error("[SHARE POST]", err);
      return errorResponse("Failed to generate share link", 500);
    }
  }
);

export const DELETE = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await connectDB();

      const file = await File.findOneAndUpdate(
        { _id: id, owner: req.userId },
        { shareToken: null, isPublic: false },
        { new: true }
      );

      if (!file) return errorResponse("File not found", 404);
      return successResponse({ message: "Share link revoked" });
    } catch (err) {
      console.error("[SHARE DELETE]", err);
      return errorResponse("Failed to revoke share link", 500);
    }
  }
);
