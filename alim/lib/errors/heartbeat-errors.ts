import { AlimError } from "@/lib/errors/errors";

export class DeviceAuthorizationError extends AlimError {
  constructor() {
    super("Heartbeat creation failed. Check the ", "01-000", 400);
    this.name = "DeviceAuthorizationError";
  }
}

export class HeartbeatLoggingError extends AlimError {
  constructor() {
    super(
      "Heartbeat logging failed. Refer to the documentation with this error code.",
      "02-000",
      510
    );
    this.name = "HeartbeatLoggingError";
  }
}

export class HeartbeatDeviceUnregisteredOrInvalid extends AlimError {
  constructor() {
    super(
      "Heartbeat logging failed. The device is not registered to the ALIM server, or the IMEI is invalid.",
      "02-001",
      422
    );
    this.name = "HeartbeatDeviceUnregisteredOrInvalid";
  }
}