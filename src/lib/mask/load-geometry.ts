import type { BufferGeometry, Mesh } from "three";

/** The shipped masks are meshopt-compressed GLBs with plain float positions and no node transform,
 *  so the first mesh's geometry is the model as authored. Resolves null when the file has no mesh. */
export async function loadMaskGeometry(
  url: string,
  onProgress?: (fraction: number | null) => void,
): Promise<BufferGeometry | null> {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url, (e) =>
    onProgress?.(e.total > 0 ? e.loaded / e.total : null),
  );
  let mesh: Mesh | null = null;
  gltf.scene.traverse((child) => {
    if (!mesh && (child as Mesh).isMesh) mesh = child as Mesh;
  });
  return mesh ? (mesh as Mesh).geometry.clone() : null;
}
