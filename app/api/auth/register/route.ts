import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return errorResponse("All fields are required");
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return errorResponse("Email already in use", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const token = signToken({ userId: user._id, email: user.email });

    return successResponse(
      { token, user: { id: user._id, name: user.name, email: user.email } },
      201
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return errorResponse("Internal server error", 500);
  }
}
