/**
 * Turn a decimated mask .obj (see optimize-mask-obj.py) into the compressed .glb the site loads.
 *
 *   node scripts/pack-mask-glb.mjs public/mask/skull.obj public/mask/skull.glb
 *
 * Positions stay float32 and the node transform stays identity: the loaders read the first mesh's
 * geometry directly, which quantization (KHR_mesh_quantization) would break.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression } from "@gltf-transform/extensions";
import { reorder, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/pack-mask-glb.mjs <in.obj> <out.glb>");
  process.exit(1);
}

const raw = join(mkdtempSync(join(tmpdir(), "mask-glb-")), "raw.glb");
execFileSync("npx", ["--yes", "obj2gltf", "-i", input, "-o", raw, "-b"], { stdio: "inherit" });

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

const doc = await io.read(raw);
await doc.transform(weld(), reorder({ encoder: MeshoptEncoder, target: "size" }));
doc
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await io.write(output, doc);
console.log(`Wrote ${output}`);
