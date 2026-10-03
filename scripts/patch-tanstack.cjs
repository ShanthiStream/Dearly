const fs = require("node:fs");
const path = require("node:path");

try {
  const pkgPath = path.resolve(__dirname, "../node_modules/@tanstack/start-server-core/package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.imports = pkg.imports || {};
    let changed = false;

    if (!pkg.imports["#tanstack-router-entry"]) {
      pkg.imports["#tanstack-router-entry"] = {
        default: "./dist/esm/empty-plugin-adapters.js"
      };
      changed = true;
    }

    if (!pkg.imports["#tanstack-start-entry"]) {
      pkg.imports["#tanstack-start-entry"] = {
        default: "./dist/esm/empty-plugin-adapters.js"
      };
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
      console.log("[patch-tanstack] Successfully patched @tanstack/start-server-core package.json imports");
    }
  }
} catch (err) {
  console.warn("[patch-tanstack] Warning: could not patch @tanstack/start-server-core:", err.message);
}
