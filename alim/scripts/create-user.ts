import prisma from "@/lib/prismacilent";
import { auth } from "@/lib/auth";

await auth.api.signUpEmail({
  body: {
    email: "admin@alim.local",
    password: "yourpassword",
    name: "John Doe",
  },
});

console.log("Admin created");
process.exit(0);