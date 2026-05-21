const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

export function bindFullscreenQuad(
  gl: WebGLRenderingContext,
  prog: WebGLProgram,
  attribName = "p",
): boolean {
  const buf = gl.createBuffer();
  if (!buf) return false;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, attribName);
  if (loc < 0) return false;
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return true;
}
