import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    return successResponse({ message: "Database connected successfully" });
  } catch (err: any) {
    console.error("[TEST]", err);
    return errorResponse(`Database connection failed: ${err.message}`, 500);
  }
}