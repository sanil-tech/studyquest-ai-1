import { base44 } from "./api/base44Client.js";
(async () => {
  const result = await base44.functions.invoke("unapproveAllLessons", {});
  console.log(result);
})();
