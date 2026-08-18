"use server";

import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";

export async function userSignup(user: {
  email: string;
  password: string;
  fullName: string;
}) {
    return await tryCatch(
      auth.api.signUpEmail({
        body: {
          email: user.email,
          password: user.password,
          name: user.fullName,
        },
      })
    );
}