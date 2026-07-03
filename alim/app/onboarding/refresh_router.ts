"use server";

import { refresh } from "next/cache";

export async function refreshRouter() {
  "use server";
  refresh();
}