import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prismacilent";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, autoSignIn: false },
  trustedOrigins: [
    "http://localhost:3000",
    "https://alim_development_server.twinknet.uk",
    /* yes i actually do own this domain it was an inside joke,
     * and yes this is an actual fqdn that im using for testing the firmware,
     * i cant be arsed to setup environment variables right now and do this properly,
     * so whoever is reading this in the commit history will have to cope lmao,
     * yes im hardcoding it for now
     */
  ],
});
