#!/usr/bin/env python3
"""Decimate a mask OBJ for web use. Requires: pip install trimesh fast_simplification

Typical outputs:
  homepage (/mask plate): -f 80000  -o public/mask/plague-doctor-skull-lite.obj
  /mask page:             -f 150000 -o public/mask/plague-doctor-skull.obj
"""

from __future__ import annotations

import argparse
import os
import sys

def main() -> int:
    parser = argparse.ArgumentParser(description="Simplify mask OBJ for mxsm.me")
    parser.add_argument("input", help="Source .obj path")
    parser.add_argument(
        "-o",
        "--output",
        default="public/mask/plague-doctor-skull-lite.obj",
        help="Output .obj path (default: public/mask/plague-doctor-skull-lite.obj)",
    )
    parser.add_argument(
        "-f",
        "--faces",
        type=int,
        default=80000,
        help="Target face count — lite 80k, full page 150k (default: 80000)",
    )
    args = parser.parse_args()

    try:
        import trimesh
    except ImportError:
        print("Install deps: pip install trimesh fast_simplification", file=sys.stderr)
        return 1

    mesh = trimesh.load(args.input, process=False)
    simplified = mesh.simplify_quadric_decimation(face_count=args.faces)
    simplified.remove_unreferenced_vertices()

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    simplified.export(args.output)

    size_kb = os.path.getsize(args.output) // 1024
    print(
        f"OK {len(mesh.vertices)}v/{len(mesh.faces)}f "
        f"-> {len(simplified.vertices)}v/{len(simplified.faces)}f ({size_kb} KB)"
    )
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
