import prisma from "@/lib/prismacilent";
import { tryCatch } from "@/lib/try-catch";

// returns true if there ARE existing users
export async function checkForExistingUsers() {
  const { data, error } = await tryCatch(prisma.user.findMany());
  if (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unhandled exception occurred while checking for existing users.");
    }
  }
  return data.length > 0;
}