import { getPigmentViscosity } from '../data/ebruData';
import type { DropSize, ToolType } from '../types/ebru';

interface FboTarget {
  t: WebGLTexture;
  f: WebGLFramebuffer;
  w: number;
  h: number;
}

interface DoubleFbo {
  a: FboTarget;
  b: FboTarget;
  swap: () => void;
}

interface ShaderProgram {
  p: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
}

const DROP_RADII: Record<DropSize, number> = {
  small: 0.032,
  medium: 0.055,
  large: 0.088,
};

export class EbruEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private mobile: boolean;
  private velRes: number;
  private dyeRes: number;
  private iter: number;

  private vs!: WebGLShader;
  private progSplat!: ShaderProgram;
  private progDropDisplace!: ShaderProgram;
  private progRadialVel!: ShaderProgram;
  private progAdvect!: ShaderProgram;
  private progAdvectDye!: ShaderProgram;
  private progDivergence!: ShaderProgram;
  private progPressure!: ShaderProgram;
  private progGradient!: ShaderProgram;
  private progScale!: ShaderProgram;
  private progCopy!: ShaderProgram;
  private progWind!: ShaderProgram;
  private progDisplay!: ShaderProgram;

  private vel!: DoubleFbo;
  private pres!: DoubleFbo;
  private divT!: FboTarget;
  private dye!: DoubleFbo;

  private undoStack: FboTarget[] = [];
  private maxUndo = 10;

  private vt: [number, number] = [1 / 128, 1 / 128];
  private dtTexel: [number, number] = [1 / 512, 1 / 512];
  private waterRgb: [number, number, number] = [0.843, 0.875, 0.863];
  private ar = 1;

  private rafId: number | null = null;
  private lastTime = 0;
  private elapsedTime = 0;
  private isDestroyed = false;

  private windClock = 4.5;
  private windCycleDuration = 11.5;
  private windGustDuration = 3.8;
  private windAngle = 0.42;
  private windIntensity = 1.0;

  constructor(canvas: HTMLCanvasElement, initialWaterHex: string) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });

    if (
      !gl ||
      !(
        gl.getExtension('EXT_color_buffer_float') ||
        gl.getExtension('EXT_color_buffer_half_float')
      )
    ) {
      throw new Error('WEBGL2_FLOAT_UNSUPPORTED');
    }

    this.gl = gl;
    this.mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.velRes = this.mobile ? 112 : 160;
    this.dyeRes = this.mobile ? 512 : 768;
    this.iter = this.mobile ? 16 : 22;
    this.waterRgb = this.hexToRgb(initialWaterHex);

    this.compilePrograms();
    this.initBuffers();
    this.seedInitial();
  }

  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const n = parseInt(clean, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader creation failed');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  private createProgram(fragmentBody: string): ShaderProgram {
    const gl = this.gl;
    const header =
      '#version 300 es\nprecision highp float;\nprecision highp sampler2D;\nin vec2 uv;\nout vec4 o;\nuniform vec2 t;\n';
    const fs = this.compileShader(gl.FRAGMENT_SHADER, header + fragmentBody);
    const p = gl.createProgram();
    if (!p) throw new Error('Program creation failed');
    gl.attachShader(p, this.vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(fs);

    const u: Record<string, WebGLUniformLocation | null> = {};
    const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const active = gl.getActiveUniform(p, i);
      if (active) {
        u[active.name] = gl.getUniformLocation(p, active.name);
      }
    }
    return { p, u };
  }

  private compilePrograms() {
    this.vs = this.compileShader(
      this.gl.VERTEX_SHADER,
      '#version 300 es\nout vec2 uv;\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.-1.,0,1);}'
    );

    // Gaussian velocity splat
    this.progSplat = this.createProgram(
      `uniform sampler2D s;uniform vec2 p;uniform vec3 c;uniform float r,ar;
       void main(){
         vec2 d=uv-p;d.x*=ar;
         vec4 b=texture(s,uv);
         float k=exp(-dot(d,d)/r);
         o=vec4(b.rgb+c*k,1.0);
       }`
    );

    // Authentic Ebru area-preserving radial displacement drop shader with per-pigment viscosity
    this.progDropDisplace = this.createProgram(
      `uniform sampler2D s;uniform vec2 p;uniform vec3 c;uniform float r,ar,uViscosity;
       void main(){
         vec2 d=uv-p;
         vec2 da=vec2(d.x*ar,d.y);
         float dist=length(da);
         // Fluid pigments (low viscosity) expand slightly wider than dense mineral pigments
         float effR=r*(1.15-0.30*uViscosity);
         if(dist<effR){
           float rimStart=effR*mix(0.82,0.95,uViscosity);
           float edge=1.0-smoothstep(rimStart,effR,dist);
           vec4 prev=texture(s,uv);
           o=vec4(mix(prev.rgb,c,edge),mix(prev.a,uViscosity,edge));
         } else {
           float pushR=effR*0.95;
           float srcDist=sqrt(max(0.0,dist*dist-pushR*pushR));
           vec2 srcDa=da*(srcDist/max(dist,1e-5));
           vec2 srcUv=p+vec2(srcDa.x/ar,srcDa.y);
           vec4 pushed=texture(s,clamp(srcUv,vec2(0.001),vec2(0.999)));
           o=pushed;
         }
       }`
    );

    // Gentle outward radial impulse in velocity field when a drop lands
    this.progRadialVel = this.createProgram(
      `uniform sampler2D s;uniform vec2 p;uniform float r,ar,strength;
       void main(){
         vec2 d=uv-p;
         vec2 da=vec2(d.x*ar,d.y);
         float dist=length(da);
         vec2 dir=dist>1e-5?da/dist:vec2(0.0);
         float band=exp(-pow((dist-r*0.9)/max(r*0.55,0.01),2.0));
         vec2 impulse=vec2(dir.x/ar,dir.y)*band*strength;
         vec2 base=texture(s,uv).xy;
         o=vec4(base+impulse,0.0,1.0);
       }`
    );

    // Velocity advection with subtle pigment-viscosity damping
    this.progAdvect = this.createProgram(
      `uniform sampler2D v,s,dyeMap;uniform float dt,df;
       void main(){
         vec2 c=uv-dt*texture(v,uv).xy*t;
         float localVis=texture(dyeMap,uv).a;
         o=texture(s,c)/(1.0+(df+localVis*2.1)*dt);
       }`
    );

    // Dye advection with viscosity-weighted shear and dynamic boundary diffusion
    this.progAdvectDye = this.createProgram(
      `uniform sampler2D v,s;uniform vec2 vt;uniform float dt;
       void main(){
         vec2 vel=texture(v,uv).xy;
         vec4 raw=texture(s,uv);
         float vis=raw.a;
         // Higher viscosity pigments resist fluid drag slightly more, creating organic shear
         float advScale=mix(1.08,0.74,vis);
         vec2 c=uv-dt*vel*vt*advScale;
         vec4 center=texture(s,c);
         float cVis=center.a;
         if(cVis>0.01){
           vec4 L=texture(s,c-vec2(t.x,0));
           vec4 R=texture(s,c+vec2(t.x,0));
           vec4 T=texture(s,c+vec2(0,t.y));
           vec4 B=texture(s,c-vec2(0,t.y));
           vec4 avg=(L+R+T+B)*0.25;
           float speed=length(vel);
           // Fluid pigments feather slightly along active flow & drop impulses while staying crisp when still
           float activeFlow=smoothstep(0.02,2.5,speed);
           float mobility=pow(max(0.0,1.0-cVis),1.5);
           float rate=clamp(activeFlow*0.055*mobility*dt*60.0,0.0,0.075);
           o=mix(center,avg,rate);
         } else {
           o=center;
         }
       }`
    );

    this.progDivergence = this.createProgram(
      `uniform sampler2D v;
       void main(){
         vec2 c=texture(v,uv).xy;
         float L=texture(v,uv-vec2(t.x,0)).x;
         float R=texture(v,uv+vec2(t.x,0)).x;
         float T=texture(v,uv+vec2(0,t.y)).y;
         float B=texture(v,uv-vec2(0,t.y)).y;
         if(uv.x-t.x<0.0)L=-c.x;
         if(uv.x+t.x>1.0)R=-c.x;
         if(uv.y+t.y>1.0)T=-c.y;
         if(uv.y-t.y<0.0)B=-c.y;
         o=vec4(0.5*(R-L+T-B),0,0,1);
       }`
    );

    this.progPressure = this.createProgram(
      `uniform sampler2D p,d;
       void main(){
         float L=texture(p,uv-vec2(t.x,0)).x;
         float R=texture(p,uv+vec2(t.x,0)).x;
         float T=texture(p,uv+vec2(0,t.y)).x;
         float B=texture(p,uv-vec2(0,t.y)).x;
         o=vec4((L+R+B+T-texture(d,uv).x)*0.25,0,0,1);
       }`
    );

    this.progGradient = this.createProgram(
      `uniform sampler2D p,v;
       void main(){
         float L=texture(p,uv-vec2(t.x,0)).x;
         float R=texture(p,uv+vec2(t.x,0)).x;
         float T=texture(p,uv+vec2(0,t.y)).x;
         float B=texture(p,uv-vec2(0,t.y)).x;
         o=vec4(texture(v,uv).xy-vec2(R-L,T-B),0,1);
       }`
    );

    this.progScale = this.createProgram(
      `uniform sampler2D s;uniform float k;
       void main(){o=texture(s,uv)*k;}`
    );

    this.progCopy = this.createProgram(
      `uniform sampler2D s;
       void main(){o=texture(s,uv);}`
    );

    // Subtle periodic workshop air currents across floating pigment drops
    this.progWind = this.createProgram(
      `uniform sampler2D s,dyeMap;uniform vec2 uWind;uniform float uTime,uGust;
       void main(){
         vec2 vel=texture(s,uv).xy;
         float localVis=texture(dyeMap,uv).a;
         float hasPigment=smoothstep(0.01,0.14,localVis);
         if(hasPigment>0.001){
           float swirl=sin(uv.y*5.2+uTime*0.65)*0.32+cos(uv.x*4.4-uTime*0.48)*0.24;
           vec2 perp=vec2(-uWind.y,uWind.x);
           vec2 gustVec=(uWind+perp*swirl)*uGust;
           float mobility=mix(1.0,0.45,localVis);
           o=vec4(vel+gustVec*hasPigment*mobility,0.0,1.0);
         } else {
           o=vec4(vel,0.0,1.0);
         }
       }`
    );

    this.progDisplay = this.createProgram(
      `uniform sampler2D s;uniform float uTime,uCaustics;
       float lum(vec2 q){return dot(texture(s,q).rgb,vec3(0.3,0.59,0.11));}
       void main(){
         vec3 c=texture(s,uv).rgb;
         float lx=lum(uv+vec2(t.x,0))-lum(uv-vec2(t.x,0));
         float ly=lum(uv+vec2(0,t.y))-lum(uv-vec2(0,t.y));
         c+=(lx-ly)*0.24;
         if(uCaustics>0.5){
           float w1=sin(uv.x*16.0+uTime*0.38+sin(uv.y*11.0-uTime*0.27));
           float w2=cos(uv.y*14.0-uTime*0.33+cos(uv.x*13.0+uTime*0.24));
           float caustic=pow(max(0.0,0.5+0.5*w1*w2),3.2);
           float pulse=0.55+0.45*sin(uTime*0.42);
           c+=vec3(0.022,0.024,0.02)*caustic*pulse;
         }
         c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)*0.015;
         o=vec4(c,1.0);
       }`
    );
  }

  private run(
    prog: ShaderProgram,
    args: Record<string, FboTarget | number | [number, number] | [number, number, number]>,
    target: FboTarget | null
  ) {
    const gl = this.gl;
    gl.useProgram(prog.p);
    let texUnit = 0;
    for (const key in args) {
      const val = args[key];
      const loc = prog.u[key];
      if (!loc) continue;
      if (typeof val === 'object' && 't' in val) {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(gl.TEXTURE_2D, val.t);
        gl.uniform1i(loc, texUnit++);
      } else if (typeof val === 'number') {
        gl.uniform1f(loc, val);
      } else if (val.length === 2) {
        gl.uniform2fv(loc, val);
      } else {
        gl.uniform3fv(loc, val);
      }
    }

    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.f);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private makeFbo(w: number, h: number): FboTarget {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f, w, h };
  }

  private deleteFbo(fbo?: FboTarget) {
    if (!fbo) return;
    this.gl.deleteFramebuffer(fbo.f);
    this.gl.deleteTexture(fbo.t);
  }

  private makeDoubleFbo(w: number, h: number): DoubleFbo {
    const d: DoubleFbo = {
      a: this.makeFbo(w, h),
      b: this.makeFbo(w, h),
      swap() {
        const tmp = d.a;
        d.a = d.b;
        d.b = tmp;
      },
    };
    return d;
  }

  private getResolution(base: number): [number, number] {
    return this.ar > 1 ? [Math.round(base * this.ar), base] : [base, Math.round(base / this.ar)];
  }

  public fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    this.canvas.width = w;
    this.canvas.height = h;
  }

  private clearUndoStack() {
    for (const snap of this.undoStack) {
      this.deleteFbo(snap);
    }
    this.undoStack = [];
  }

  public initBuffers() {
    this.fitCanvas();
    this.ar = this.canvas.width / Math.max(1, this.canvas.height);

    // Clean old buffers if re-initializing
    if (this.vel) {
      this.deleteFbo(this.vel.a);
      this.deleteFbo(this.vel.b);
      this.deleteFbo(this.pres.a);
      this.deleteFbo(this.pres.b);
      this.deleteFbo(this.divT);
      this.deleteFbo(this.dye.a);
      this.deleteFbo(this.dye.b);
      this.clearUndoStack();
    }

    const [vw, vh] = this.getResolution(this.velRes);
    const [dw, dh] = this.getResolution(this.dyeRes);
    this.vel = this.makeDoubleFbo(vw, vh);
    this.pres = this.makeDoubleFbo(vw, vh);
    this.divT = this.makeFbo(vw, vh);
    this.dye = this.makeDoubleFbo(dw, dh);
    this.vt = [1 / vw, 1 / vh];
    this.dtTexel = [1 / dw, 1 / dh];
    this.clearTray(false);
  }

  public handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nextAr = rect.width / rect.height;
    if (Math.abs(nextAr / this.ar - 1) > 0.25) {
      // Preserve current artwork by scaling into resized FBO
      const prevDye = this.dye.a;
      this.fitCanvas();
      this.ar = this.canvas.width / Math.max(1, this.canvas.height);
      const [vw, vh] = this.getResolution(this.velRes);
      const [dw, dh] = this.getResolution(this.dyeRes);

      this.deleteFbo(this.vel.a);
      this.deleteFbo(this.vel.b);
      this.deleteFbo(this.pres.a);
      this.deleteFbo(this.pres.b);
      this.deleteFbo(this.divT);
      this.deleteFbo(this.dye.b);

      this.vel = this.makeDoubleFbo(vw, vh);
      this.pres = this.makeDoubleFbo(vw, vh);
      this.divT = this.makeFbo(vw, vh);
      const newDye = this.makeDoubleFbo(dw, dh);
      this.run(this.progCopy, { s: prevDye }, newDye.a);
      this.deleteFbo(prevDye);
      this.dye = newDye;
      this.vt = [1 / vw, 1 / vh];
      this.dtTexel = [1 / dw, 1 / dh];
      this.clearUndoStack();
    } else {
      this.fitCanvas();
    }
  }

  public setWaterColor(hex: string) {
    this.waterRgb = this.hexToRgb(hex);
  }

  public setWindIntensity(scale: number) {
    this.windIntensity = Math.max(0, Math.min(2, scale));
  }

  public clearTray(resetUndo = true) {
    const gl = this.gl;
    for (const fbo of [this.vel.a, this.vel.b, this.pres.a, this.pres.b, this.divT]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.f);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    for (const fbo of [this.dye.a, this.dye.b]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.f);
      // Alpha = 0.0 represents clean water bath (zero pigment viscosity)
      gl.clearColor(this.waterRgb[0], this.waterRgb[1], this.waterRgb[2], 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (resetUndo) {
      this.clearUndoStack();
    }
  }

  public seedInitial() {
    const seeds: Array<[number, number, string, number]> = [
      [0.34, 0.62, '#d4a017', 0.08],
      [0.62, 0.5, '#b3262e', 0.082],
      [0.46, 0.34, '#1f7a5c', 0.075],
      [0.48, 0.52, '#17306b', 0.055],
    ];
    for (const [x, y, hex, r] of seeds) {
      this.dropAt(x, y, hex, r * Math.min(1, this.ar), false);
    }
  }

  /**
   * Chapter 2 (Yaz: Gelgit): Seeds a rhythmic base and pulls a slightly crooked,
   * trembling stroke representing Usta Emin Efendi's fading sight.
   */
  public seedUstaBlindStroke() {
    this.clearTray(true);
    const baseDrops: Array<[number, number, string, number]> = [
      [0.24, 0.55, '#17306b', 0.09],
      [0.42, 0.45, '#1fa3b0', 0.088],
      [0.6, 0.54, '#efe7d6', 0.082],
      [0.75, 0.44, '#b3262e', 0.076],
      [0.32, 0.35, '#1fa3b0', 0.068],
      [0.66, 0.66, '#17306b', 0.068],
    ];
    for (const [x, y, hex, r] of baseDrops) {
      this.dropAt(x, y, hex, r * Math.min(1, this.ar), false);
    }

    // One wavering, slightly off-center gelgit stroke simulated across a few frames
    const pts: Array<[number, number]> = [
      [0.16, 0.48],
      [0.3, 0.51],
      [0.46, 0.43],
      [0.62, 0.57],
      [0.78, 0.49],
      [0.86, 0.39],
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      this.dragTool('gelgit', pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      this.step(0.016);
      this.step(0.016);
    }
    // Settle residual velocity cleanly
    for (let s = 0; s < 10; s++) {
      this.step(0.016);
    }
  }

  public pushUndoSnapshot() {
    if (this.undoStack.length >= this.maxUndo) {
      const oldest = this.undoStack.shift();
      this.deleteFbo(oldest);
    }
    const snap = this.makeFbo(this.dye.a.w, this.dye.a.h);
    this.run(this.progCopy, { s: this.dye.a }, snap);
    this.undoStack.push(snap);
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public undo(): boolean {
    const snap = this.undoStack.pop();
    if (!snap) return false;
    this.run(this.progCopy, { s: snap }, this.dye.a);
    this.deleteFbo(snap);
    // Calm residual velocity on undo so strokes don't keep drifting
    const gl = this.gl;
    for (const fbo of [this.vel.a, this.vel.b, this.pres.a, this.pres.b]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.f);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    return true;
  }

  public drop(x: number, y: number, hex: string, size: DropSize) {
    const baseR = DROP_RADII[size] * Math.min(1, this.ar);
    const r = baseR * (0.9 + Math.random() * 0.2);
    this.dropAt(x, y, hex, r, true);
  }

  private dropAt(x: number, y: number, hex: string, radius: number, withVelImpulse: boolean) {
    const rgb = this.hexToRgb(hex);
    const viscosity = getPigmentViscosity(hex);
    this.run(
      this.progDropDisplace,
      { s: this.dye.a, p: [x, y], c: rgb, r: radius, ar: this.ar, uViscosity: viscosity },
      this.dye.b
    );
    this.dye.swap();

    if (withVelImpulse) {
      const waveStrength = 1.45 * (1.2 - 0.4 * viscosity);
      this.run(
        this.progRadialVel,
        { s: this.vel.a, p: [x, y], r: radius, ar: this.ar, strength: waveStrength },
        this.vel.b
      );
      this.vel.swap();
    }
  }

  public speckle(x: number, y: number, hex: string, size: DropSize): number {
    const count = 6;
    const spread = size === 'large' ? 0.14 : size === 'medium' ? 0.095 : 0.06;
    const baseR = size === 'large' ? 0.022 : size === 'medium' ? 0.015 : 0.01;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * spread;
      const sx = Math.min(0.98, Math.max(0.02, x + (Math.cos(angle) * dist) / this.ar));
      const sy = Math.min(0.98, Math.max(0.02, y + Math.sin(angle) * dist));
      const r = baseR * (0.65 + Math.random() * 0.7) * Math.min(1, this.ar);
      this.dropAt(sx, sy, hex, r, false);
    }
    return count;
  }

  private addVel(x: number, y: number, fx: number, fy: number, radius: number) {
    this.run(
      this.progSplat,
      { s: this.vel.a, p: [x, y], c: [fx, fy, 0], r: radius, ar: this.ar },
      this.vel.b
    );
    this.vel.swap();
  }

  public dragTool(tool: ToolType, x0: number, y0: number, x1: number, y1: number) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx * this.ar, dy);
    if (dist < 1e-4) return;

    const steps = Math.min(16, Math.ceil(dist / 0.009));
    const force = tool === 'tarak' ? 4600 : tool === 'gelgit' ? 5200 : 4900;
    const fx = (dx / steps) * force;
    const fy = (dy / steps) * force;

    // Perpendicular unit vector in UV space
    const nx = -dy;
    const ny = dx * this.ar;
    const nl = Math.hypot(nx, ny) || 1;
    const px = nx / nl / this.ar;
    const py = ny / nl;

    for (let i = 1; i <= steps; i++) {
      const x = x0 + (dx * i) / steps;
      const y = y0 + (dy * i) / steps;

      if (tool === 'biz') {
        this.addVel(x, y, fx, fy, 0.00016);
      } else if (tool === 'gelgit') {
        for (let k = -4; k <= 4; k++) {
          this.addVel(x + px * k * 0.048, y + py * k * 0.048, fx, fy, 0.0001);
        }
      } else if (tool === 'tarak') {
        for (let k = -10; k <= 10; k++) {
          this.addVel(x + px * k * 0.022, y + py * k * 0.022, fx, fy, 0.000045);
        }
      }
    }
  }

  public step(dt: number) {
    const clampedDt = Math.min(dt, 0.033);
    this.elapsedTime += clampedDt;
    this.run(
      this.progAdvect,
      { v: this.vel.a, s: this.vel.a, dyeMap: this.dye.a, t: this.vt, dt: clampedDt, df: 2.3 },
      this.vel.b
    );
    this.vel.swap();

    // Periodic workshop breeze gently shifting active floating pigment drops
    this.windClock += clampedDt;
    if (this.windClock >= this.windCycleDuration) {
      this.windClock -= this.windCycleDuration;
      this.windAngle += 0.68 + (Math.random() - 0.5) * 0.95;
      this.windCycleDuration = 10.2 + Math.random() * 4.2;
      this.windGustDuration = 3.2 + Math.random() * 1.1;
    }
    const calmDuration = Math.max(2, this.windCycleDuration - this.windGustDuration);
    if (this.windIntensity > 0.01 && this.windClock > calmDuration) {
      const phase = (this.windClock - calmDuration) / this.windGustDuration;
      const bell = Math.pow(Math.sin(Math.PI * phase), 2);
      const gust = bell * 1.65 * this.windIntensity * clampedDt;
      if (gust > 0.0002) {
        const wx = Math.cos(this.windAngle) / Math.max(0.5, this.ar);
        const wy = Math.sin(this.windAngle);
        this.run(
          this.progWind,
          {
            s: this.vel.a,
            dyeMap: this.dye.a,
            uWind: [wx, wy],
            uTime: this.elapsedTime,
            uGust: gust,
          },
          this.vel.b
        );
        this.vel.swap();
      }
    }

    this.run(this.progDivergence, { v: this.vel.a, t: this.vt }, this.divT);
    this.run(this.progScale, { s: this.pres.a, k: 0.8 }, this.pres.b);
    this.pres.swap();

    for (let i = 0; i < this.iter; i++) {
      this.run(this.progPressure, { p: this.pres.a, d: this.divT, t: this.vt }, this.pres.b);
      this.pres.swap();
    }

    this.run(this.progGradient, { p: this.pres.a, v: this.vel.a, t: this.vt }, this.vel.b);
    this.vel.swap();

    this.run(
      this.progAdvectDye,
      { v: this.vel.a, s: this.dye.a, t: this.dtTexel, vt: this.vt, dt: clampedDt },
      this.dye.b
    );
    this.dye.swap();

    this.run(
      this.progDisplay,
      { s: this.dye.a, t: this.dtTexel, uTime: this.elapsedTime, uCaustics: 1 },
      null
    );
  }

  public start() {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (this.isDestroyed) return;
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      this.step(dt);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Captures the current marbled tray surface mirrored horizontally
   * (matching real Ebru paper lifting) as a PNG data URL.
   */
  public captureMirroredPrint(): string {
    // Render crisp pigment surface without live water glare for paper export
    this.run(
      this.progDisplay,
      { s: this.dye.a, t: this.dtTexel, uTime: this.elapsedTime, uCaustics: 0 },
      null
    );
    this.gl.finish();

    const maxW = 1280;
    const scale = Math.min(1, maxW / Math.max(1, this.canvas.width));
    const outW = Math.max(1, Math.round(this.canvas.width * scale));
    const outH = Math.max(1, Math.round(this.canvas.height * scale));

    const off = document.createElement('canvas');
    off.width = outW;
    off.height = outH;
    const ctx = off.getContext('2d');
    if (!ctx) return this.canvas.toDataURL('image/png');

    // Horizontal mirror flip like lifting paper off an Ebru tekne
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.canvas, 0, 0, outW, outH);
    return off.toDataURL('image/png');
  }

  public destroy() {
    this.isDestroyed = true;
    this.stop();
    this.clearUndoStack();
    if (this.vel) {
      this.deleteFbo(this.vel.a);
      this.deleteFbo(this.vel.b);
      this.deleteFbo(this.pres.a);
      this.deleteFbo(this.pres.b);
      this.deleteFbo(this.divT);
      this.deleteFbo(this.dye.a);
      this.deleteFbo(this.dye.b);
    }
  }
}
