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

export class UnhandledInternalServerException extends AlimError {
  constructor() {
    super(
      "Internal unhandled server exception. You should report this, and describe what you were doing at aridlink@sthivaios.dev.",
      "99-9999",
      500
    );
    this.name = "UnhandledInternalServerException";
  }
}

export function alimErrorResponse(err: AlimError) {
  return NextResponse.json(
    { error_code: err.code, error_message: err.message },
    { status: err.http_code }
  );
}