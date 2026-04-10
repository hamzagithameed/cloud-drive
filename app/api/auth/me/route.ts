import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return errorResponse("Unauthorized", 401);

    const decoded = verifyToken(token) as { userId: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return errorResponse("User not found", 404);

    return successResponse({ user });
  } catch (err) {
    console.error("[ME]", err);
    return errorResponse("Invalid or expired token", 401);
  }
}
