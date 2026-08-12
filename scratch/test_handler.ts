import { createClientFromRequest, createClient } from "@base44/sdk";
import handler from "../base44/functions/generateModularLessonContent/entry.ts";

async function run() {
  const base44 = createClient({
    appId: "6a3f271e41dc4ee0d0d5abdf",
    serverUrl: "http://localhost:4400",
    requiresAuth: false
  });
  
  const res = await base44.functions.invoke("generateModularLessonContent", {
    subject: "Sains",
    year_level: "3",
    topic: "Test Topic",
    sp_code: "1.1.1"
  });
  
  console.log(res.status);
  console.log(res.data);
}

run().catch(console.error);
