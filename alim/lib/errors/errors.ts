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