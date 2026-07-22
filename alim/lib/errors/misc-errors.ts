// noinspection JSUnusedGlobalSymbols

import { AlimError } from "@/lib/errors/errors";

export class DeviceNoAssignedCSP extends AlimError {
  constructor() {
    super(
      "This device does not have a CSP assigned. Assign a Common Schedule Profile from the ALIM Dashboard.",
      "02-001",
      404
    );
    this.name = "DeviceNoAssignedCSP";
  }
}
