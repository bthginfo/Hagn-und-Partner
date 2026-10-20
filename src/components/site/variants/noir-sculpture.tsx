"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Pause, Play } from "lucide-react";

const vertexShader = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// A dark, extruded section sign. Rendering is requested only while the shared
// hero pointer settles, on resize, or when visibility changes.
const fragmentShader = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform sampler2D u_glyph;

  mat2 turn(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
  float volume(vec3 p) {
    p.xz = turn(0.18 + u_pointer.x * 0.12) * p.xz;
    p.yz = turn(-0.06 + u_pointer.y * 0.07) * p.yz;
    p.xy = turn(-0.055) * p.xy;
    vec2 uv = p.xy * 0.5 + 0.5;
    uv.y = 1.0 - uv.y;
    vec4 sampleValue = texture2D(u_glyph, clamp(uv, 0.0, 1.0));
    float glyph = ((sampleValue.r * 256.0 + sampleValue.g) / 257.0 - 0.5) / 0.38;
    glyph = max(glyph, max(abs(p.x) - 0.98, abs(p.y) - 0.98));
    vec2 d = vec2(glyph, abs(p.z) - 0.13);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - 0.024;
  }
  vec3 normalAt(vec3 p) {
    vec2 e = vec2(0.005, 0.0);
    return normalize(vec3(volume(p + e.xyy) - volume(p - e.xyy), volume(p + e.yxy) - volume(p - e.yxy), volume(p + e.yyx) - volume(p - e.yyx)));
  }
  void main() {
    vec2 q = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    vec3 eye = vec3(0.0, 0.0, 3.2);
    vec3 ray = normalize(vec3(q * 1.04, -2.8));
    float distance = 1.6;
    bool hit = false;
    for (int i = 0; i < 48; i++) {
      float stepSize = volume(eye + ray * distance);
      if (stepSize < 0.0026) { hit = true; break; }
      distance += max(stepSize * 0.77, 0.002);
      if (distance > 5.2) break;
    }
    if (!hit) { gl_FragColor = vec4(0.0); return; }
    vec3 p = eye + ray * distance;
    vec3 n = normalAt(p);
    float edge = pow(1.0 - max(0.0, dot(n, -ray)), 3.0);
    float diffuse = max(0.0, dot(n, normalize(vec3(-0.6, 0.9, 1.5))));
    float rim = pow(max(0.0, dot(n, normalize(vec3(0.8, 0.3, 0.2)))), 6.0);
    vec3 color = vec3(0.022, 0.027, 0.030) + vec3(0.040, 0.046, 0.050) * diffuse;
    color += vec3(0.046, 0.052, 0.056) * edge + vec3(0.020) * rim;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function distanceTransform(binary: Uint8Array, size: number, inside: boolean) {
  const distance = new Float32Array(size * size);
  const diagonal = Math.SQRT2;
  for (let i = 0; i < distance.length; i++) distance[i] = Boolean(binary[i]) === inside ? 0 : size * 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      if (x) distance[i] = Math.min(distance[i], distance[i - 1] + 1);
      if (y) distance[i] = Math.min(distance[i], distance[i - size] + 1);
      if (x && y) distance[i] = Math.min(distance[i], distance[i - size - 1] + diagonal);
      if (x + 1 < size && y) distance[i] = Math.min(distance[i], distance[i - size + 1] + diagonal);
    }
  }
  for (let y = size - 1; y >= 0; y--) {
    for (let x = size - 1; x >= 0; x--) {
      const i = y * size + x;
      if (x + 1 < size) distance[i] = Math.min(distance[i], distance[i + 1] + 1);
      if (y + 1 < size) distance[i] = Math.min(distance[i], distance[i + size] + 1);
      if (x + 1 < size && y + 1 < size) distance[i] = Math.min(distance[i], distance[i + size + 1] + diagonal);
      if (x && y + 1 < size) distance[i] = Math.min(distance[i], distance[i + size - 1] + diagonal);
    }
  }
  return distance;
}

function glyphTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.font = `800 ${size * 0.96}px "Manrope Variable", Manrope, sans-serif`;
  ctx.fillStyle = "white";
  const metrics = ctx.measureText("§");
  const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  ctx.fillText("§", (size - width) / 2 + metrics.actualBoundingBoxLeft, (size - height) / 2 + metrics.actualBoundingBoxAscent);
  const pixels = ctx.getImageData(0, 0, size, size).data;
  const binary = new Uint8Array(size * size);
  for (let i = 0; i < binary.length; i++) binary[i] = pixels[i * 4 + 3] > 127 ? 1 : 0;
  const outside = distanceTransform(binary, size, true);
  const inside = distanceTransform(binary, size, false);
  const texture = new Uint8Array(size * size * 4);
  for (let i = 0; i < binary.length; i++) {
    // Two channels preserve a smooth 16-bit distance field at grazing angles.
    const value = Math.max(0, Math.min(65535, Math.round((0.5 + ((outside[i] - inside[i]) * 2 / size) * 0.38) * 65535)));
    texture[i * 4] = value >>> 8;
    texture[i * 4 + 1] = value & 255;
    texture[i * 4 + 3] = 255;
  }
  return { pixels: texture, size };
}

function compile(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}

export interface SpatialMotion { x: number; y: number; render?: () => void }

/** Static on touch devices; desktop updates only while the shared pointer moves. */
export function NoirSculpture({ staticMode = false, motionRef }: { staticMode?: boolean; motionRef?: RefObject<SpatialMotion> }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const element = host.current, surface = canvas.current;
    if (!element || !surface) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowPower = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
    let destroyed = false, inView = true, frame = 0, width = 1, height = 1;
    let render: (x: number, y: number) => void = () => {};
    let dispose = () => {};
    let animatedRenderer = false;
    const movement = () => !staticMode && !paused && !lowPower && !reduced.matches;

    function draw() {
      frame = 0;
      if (destroyed || !inView || document.hidden) return;
      const point = movement() ? motionRef?.current : undefined;
      render(point?.x || 0, point?.y || 0);
    }
    function request() { if (!frame && !destroyed && inView && !document.hidden) frame = requestAnimationFrame(draw); }
    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, lowPower ? 2 : 1.25);
      const rect = element!.getBoundingClientRect();
      width = Math.max(1, Math.round(Math.min(rect.width, 640) * ratio));
      height = Math.max(1, Math.round(Math.min(rect.height, 760) * ratio));
      if (surface!.width !== width || surface!.height !== height) { surface!.width = width; surface!.height = height; }
      request();
    }
    function motionChanged() { setCanAnimate(animatedRenderer && !staticMode && !lowPower && !reduced.matches); request(); }
    async function initialize() {
      await document.fonts.ready;
      if (destroyed) return;
      const gl = lowPower ? null : surface!.getContext("webgl", {alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power"});
      if (gl) {
        const vertex = compile(gl, vertexShader, gl.VERTEX_SHADER), fragment = compile(gl, fragmentShader, gl.FRAGMENT_SHADER);
        const program = gl.createProgram(), texture = glyphTexture();
        if (!vertex || !fragment || !program || !texture) { if (vertex) gl.deleteShader(vertex); if (fragment) gl.deleteShader(fragment); if (program) gl.deleteProgram(program); return; }
        gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteShader(vertex); gl.deleteShader(fragment); gl.deleteProgram(program); return; }
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        const mask = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, mask);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,texture.size,texture.size,0,gl.RGBA,gl.UNSIGNED_BYTE,texture.pixels);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        const resolution = gl.getUniformLocation(program,"u_resolution"), pointer = gl.getUniformLocation(program,"u_pointer");
        gl.uniform1i(gl.getUniformLocation(program,"u_glyph"),0);
        render = (x,y) => {
          gl.viewport(0,0,width,height); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform2f(resolution,width,height); gl.uniform2f(pointer,x,-y); gl.drawArrays(gl.TRIANGLES,0,6);
        };
        animatedRenderer = true;
        dispose = () => { gl.deleteTexture(mask); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); };
      } else {
        const ctx = surface!.getContext("2d");
        if (!ctx) return;
        render = () => {
          ctx.clearRect(0,0,width,height); ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          ctx.translate(width/2,height/2); ctx.rotate(-.055);
          ctx.font = `800 ${Math.min(width,height)*.9}px "Manrope Variable",Manrope,sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          for (let depth=9;depth>0;depth--) { ctx.fillStyle="#080b0d"; ctx.fillText("§",depth*.75,depth*.55); }
          const material = ctx.createLinearGradient(-width*.3,-height*.2,width*.25,height*.3);
          material.addColorStop(0,"#13191c"); material.addColorStop(.45,"#0b0f12"); material.addColorStop(1,"#252c30");
          ctx.fillStyle=material; ctx.fillText("§",0,0); ctx.restore();
        };
      }
      if (destroyed) { dispose(); return; }
      setReady(true); motionChanged(); resize();
    }
    const shared = motionRef?.current;
    if (shared) shared.render = request;
    const observer = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? false; if (!inView && frame) { cancelAnimationFrame(frame); frame=0; } else request(); }, {rootMargin:"60px"});
    observer.observe(element);
    const resizer = new ResizeObserver(resize); resizer.observe(element);
    const lost = (event:Event) => { event.preventDefault(); animatedRenderer=false; if (frame) cancelAnimationFrame(frame); frame=0; setReady(false); setCanAnimate(false); };
    surface.addEventListener("webglcontextlost",lost);
    document.addEventListener("visibilitychange",request); reduced.addEventListener("change",motionChanged);
    void initialize();
    return () => {
      destroyed=true; if(frame)cancelAnimationFrame(frame); observer.disconnect(); resizer.disconnect();
      if(shared?.render===request)delete shared.render;
      surface.removeEventListener("webglcontextlost",lost); document.removeEventListener("visibilitychange",request); reduced.removeEventListener("change",motionChanged); dispose();
    };
  },[paused,staticMode,motionRef]);

  return <div className={`nr-alloy${ready?" nr-alloy--ready":""}`} ref={host}>
    <span className="nr-alloy-fallback" aria-hidden="true">§</span>
    <canvas ref={canvas} className="nr-alloy-canvas" aria-hidden="true" />
    {canAnimate && <button type="button" className="nr-motion-toggle" aria-label={paused?"Bewegung des Zeichens einschalten":"Bewegung des Zeichens anhalten"} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>}
  </div>;
}
