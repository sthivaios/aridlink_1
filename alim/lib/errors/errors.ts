import { NextResponse } from "next/server";

export class AlimError extends Error {
  code: string;
  http_code: number;

  constructor(message: string, code: string, http_code: number) {
    super(message);
    this.name = "AlimError";
    this.code = `ALE-${code}`;
    this.http_code = http_code;
  }
}

export const internal_server_error_response = NextResponse.json(
  {
    error_code: "ALE-99-9999",
    error_message:
      "Internal unhandled server exception. You should report this, and describe what you were doing at aridlink@sthivaios.dev.",
  },
  { status: 500 }
);