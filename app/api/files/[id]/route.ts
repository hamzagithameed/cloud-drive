import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { connectDB } from "@/lib/db";
import File from "@/models/File";
import s3, { BUCKET_NAME } from "@/lib/s3";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export const DELETE = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await connectDB();

      const file = await File.findOne({ _id: id, owner: req.userId });
      if (!file) return errorResponse("File not found", 404);

      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: file.s3Key }));
      await file.deleteOne();

      return successResponse({ message: "File deleted successfully" });
    } catch (err) {
      console.error("[FILE DELETE]", err);
      return errorResponse("Failed to delete file", 500);
    }
  }
);
