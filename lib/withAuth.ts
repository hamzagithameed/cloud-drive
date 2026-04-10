import { NextRequest } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { errorResponse } from "@/utils/apiResponse";

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  email: string;
}

type RouteHandler = (req: AuthenticatedRequest, ctx?: any) => Promise<Response>;

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, ctx?: any) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) return errorResponse("Unauthorized", 401);

      const decoded = verifyToken(token) as { userId: string; email: string };

      // Attach user info to request
      (req as AuthenticatedRequest).userId = decoded.userId;
      (req as AuthenticatedRequest).email = decoded.email;

      return handler(req as AuthenticatedRequest, ctx);
    } catch {
      return errorResponse("Invalid or expired token", 401);
    }
  };
}
