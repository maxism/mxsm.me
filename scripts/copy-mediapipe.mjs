import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The FaceLandmarker runtime is copied out of node_modules, so the two 11 MB files never enter git.
// SIMD only: browsers without it (Safari before 16.4) get the scanner's "camera error" state.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const to = join(root, "public/mediapipe");

mkdirSync(to, { recursive: true });
for (const file of ["vision_wasm_internal.js", "vision_wasm_internal.wasm"]) {
  copyFileSync(join(from, file), join(to, file));
}
console.log("Copied FaceLandmarker runtime to public/mediapipe");
