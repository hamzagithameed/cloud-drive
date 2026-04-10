import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse } from "@/utils/apiResponse";

// Example of a protected route using withAuth middleware
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  return successResponse({
    message: "Protected route accessed successfully",
    userId: req.userId,
    email: req.email,
  });
});
