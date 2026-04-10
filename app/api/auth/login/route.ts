import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return errorResponse("Invalid credentials", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse("Invalid credentials", 401);

    const token = signToken({ userId: user._id, email: user.email });

    return successResponse({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[LOGIN]", err);
    return errorResponse("Internal server error", 500);
  }
}
