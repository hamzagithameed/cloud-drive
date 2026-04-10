import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    console.log("[REGISTER] Starting registration process");
    
    // Check environment variables
    if (!process.env.MONGODB_URI) {
      console.error("[REGISTER] MONGODB_URI not found");
      return errorResponse("Database configuration error", 500);
    }
    
    if (!process.env.JWT_SECRET) {
      console.error("[REGISTER] JWT_SECRET not found");
      return errorResponse("Authentication configuration error", 500);
    }

    const { name, email, password } = await req.json();
    console.log("[REGISTER] Received data:", { name, email, passwordLength: password?.length });

    if (!name || !email || !password) {
      return errorResponse("All fields are required");
    }

    console.log("[REGISTER] Connecting to database...");
    await connectDB();
    console.log("[REGISTER] Database connected successfully");

    console.log("[REGISTER] Checking for existing user...");
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("[REGISTER] User already exists");
      return errorResponse("Email already in use", 409);
    }

    console.log("[REGISTER] Hashing password...");
    const hashed = await bcrypt.hash(password, 12);
    
    console.log("[REGISTER] Creating user...");
    const user = await User.create({ name, email, password: hashed });
    console.log("[REGISTER] User created with ID:", user._id);

    console.log("[REGISTER] Generating token...");
    const token = signToken({ userId: user._id, email: user.email });
    console.log("[REGISTER] Token generated successfully");

    return successResponse(
      { token, user: { id: user._id, name: user.name, email: user.email } },
      201
    );
  } catch (err: any) {
    console.error("[REGISTER] Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return errorResponse(`Registration failed: ${err.message}`, 500);
  }
}
