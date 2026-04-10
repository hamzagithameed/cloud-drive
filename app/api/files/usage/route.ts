import { connectDB } from "@/lib/db";
import File from "@/models/File";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();

    const result = await File.aggregate([
      { $match: { owner: req.userId } },
      { $group: { _id: null, total: { $sum: "$size" }, count: { $sum: 1 } } },
    ]);

    const used = result[0]?.total ?? 0;
    const count = result[0]?.count ?? 0;

    return successResponse({
      used,
      count,
      limit: STORAGE_LIMIT,
      percent: Math.min((used / STORAGE_LIMIT) * 100, 100),
    });
  } catch (err) {
    console.error("[USAGE]", err);
    return errorResponse("Failed to fetch storage usage", 500);
  }
});
