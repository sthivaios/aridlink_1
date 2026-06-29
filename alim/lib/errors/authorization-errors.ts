import { AlimError } from "@/lib/errors/errors";

export class DeviceAuthorizationError extends AlimError {
  constructor() {
    super(
      "Authentication failed. Check the credentials again and ensure the device is registered and approved.",
      "01-000",
      401
    );
    this.name = "DeviceAuthorizationError";
  }
}

export class MalformedAuthorizationHeader extends AlimError {
  constructor() {
    super(
      "Authentication failed. The authorization header in this request is malformed.",
      "01-001",
      400
    );
    this.name = "MalformedAuthorizationHeader";
  }
}

export class DeviceUnregisteredOrInvalid extends AlimError {
  constructor() {
    super(
      "Authentication failed. The device is not registered to the ALIM server, or the IMEI is invalid.",
      "01-002",
      401
    );
    this.name = "DeviceUnregisteredOrInvalid";
  }
}

export class DeviceKeyIncorrect extends AlimError {
  constructor() {
    super("Authentication failed. The device key is incorrect.", "01-003", 401);
    this.name = "DeviceKeyIncorrect";
  }
}

export class DeviceUnapproved extends AlimError {
  constructor() {
    super(
      "Authentication failed. The device is not approved. Approve it manually from the ALIM admin panel.",
      "01-004",
      403
    );
    this.name = "DeviceUnapproved";
  }
}