import { Cache } from "file-system-cache";
import path from "path";

export const cache = new Cache({
  basePath: path.join(process.cwd(), ".cache"),
  ns: "lookups",
  hash: "sha1",
  ttl: 60 * 60 * 24 * 30,
});
