import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

const { syncVolunteerOrg } = await import("../lib/sync/volunteerOrg.ts");
const result = await syncVolunteerOrg();
console.log(JSON.stringify(result, null, 2));

const mongoose = (await import("mongoose")).default;
await mongoose.disconnect().catch(() => {});
process.exit(0);
