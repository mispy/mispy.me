// This optimized version of the little sunflower was made together with mcpower
// when we were exploring how webgl and shaders work. It's fairly low-level code
// for learning purposes-- if you want to make something similar, you might want
// to consider using a framework like pixijs!

import * as d3_chromatic from 'd3-scale-chromatic'
import {scaleSequential, ScaleSequential} from 'd3-scale'

const MAX_POINTS = 1000;
const CIRCLE_SIZE = 0.014;
const MAX_TIME = 24;
const SECONDS_PER_TIME = 1000;
// Assume 60fps.
const FRAMES_PER_SECOND = 60;
const FRAMES_PER_TIME = SECONDS_PER_TIME * FRAMES_PER_SECOND;
const INITIAL_TIME = 0.5;
const INITIAL_FRAME = INITIAL_TIME * SECONDS_PER_TIME * FRAMES_PER_SECOND;
const MAX_FRAME = MAX_TIME * FRAMES_PER_TIME;

// note that the "size" of the viewport we're working with
// [-1, 1] x [-1, 1]
// is 2
const DIST_MULTIPLIER = 0.030;
const ANGLE_MULTIPLIER = -2 * Math.PI / MAX_TIME;

const VERTEX_SHADER_INSTANCING = `
precision mediump float;

// Instanced
attribute vec2 coord;

attribute vec2 vertexPosition;
attribute vec3 color;
uniform vec2 scale; 

varying vec3 vertexColor;

void main() {
    gl_Position = vec4(scale * (coord + vertexPosition), 0.0, 1.0);
    vertexColor = color;
}
`;

const FRAGMENT_SHADER_INSTANCING = `
precision mediump float;

varying vec3 vertexColor;

void main() {
    gl_FragColor = vec4(vertexColor, 1.0);
}
`;

interface Point {
    x: number;
    y: number;
}

function distanceSq(a: Point, b: Point) {
    return (b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y)
}

interface RGBColor {
    r: number
    g: number
    b: number
}

function parseColor(input: string): RGBColor {
    if (input.substr(0,1)=="#") {
        var collen=(input.length-1)/3;
        var fact=[17,1,0.062272][collen-1];
        return {
            r: parseInt(input.substr(1,collen),16)*fact,
            g: parseInt(input.substr(1+collen,collen),16)*fact,
            b: parseInt(input.substr(1+2*collen,collen),16)*fact
        };
    } else {
        const [r, g, b] = input.split("(")[1].split(")")[0].split(",").map(x => parseInt(x));
        return {r, g, b}
    }
}

interface SpiralPoint {
    curPos: Point;
    deltaPos: Point;
    initPos: Point;
    color: RGBColor
    colorPriority: number
}

function isCanvas(canvas: HTMLElement): canvas is HTMLCanvasElement {
    return (<HTMLCanvasElement>canvas).getContext !== undefined;
}

interface Ripple {
    origin: Point
    colorScale: ScaleSequential<string>
    radius: number
    priority: number
}

class Sunflower {
    points: SpiralPoint[] = []
    frame: number = 0
    ripples: Ripple[] = []
    colorScales: ScaleSequential<string>[] = Object.keys(d3_chromatic).filter(k => k.indexOf('interpolate') !== -1).map(k => (d3_chromatic as any)[k])
    colorScalesIndex: number = 0
    ripplePriority: number = 0

    constructor(points: number) {
        for (let i = 0; i < points; i++) {
            const dist = DIST_MULTIPLIER * Math.sqrt(i);
            // Avoid rendering points out of the viewport.
            if (dist > Math.SQRT2 + CIRCLE_SIZE) break;
            // This is the setup, so we can do some expensive math here.
            // (read: I'm too lazy to figure out)
            const pointAngleMultiplier = ANGLE_MULTIPLIER * i;

            const angle = pointAngleMultiplier * INITIAL_TIME;
            const initPos: Point = {
                x: dist * Math.cos(angle),
                y: dist * Math.sin(angle)
            };
            // How much does the angle change per frame?
            const deltaAngle = pointAngleMultiplier / FRAMES_PER_TIME;
            const deltaPos: Point = {
                x: Math.cos(deltaAngle),
                y: Math.sin(deltaAngle)
            };

            this.points.push({
                curPos: {...initPos},
                deltaPos,
                initPos,
                color: parseColor("#f5a44a") as RGBColor,
                colorPriority: 0
            });
        }

        this.ripples.push({
            origin: { x: 0, y: 0 },
            colorScale: scaleSequential(d3_chromatic.interpolateYlOrBr).domain([0, 1.7]),
            radius: 2,
            priority: 0
        })

        this.expandRipples()
    }

    ripple(mouse: Point) {
        this.colorScalesIndex = this.colorScalesIndex >= this.colorScales.length-1 ? 0 : this.colorScalesIndex+1

        const {colorScales, colorScalesIndex, points} = this

        const closestPointToMouse = [...points].sort((a, b) => distanceSq(a.curPos, mouse) - distanceSq(b.curPos, mouse))[0]
        if (this.ripples.length >= 50)
            this.ripples = this.ripples.slice(1)
        
        this.ripples.push({
            origin: closestPointToMouse.curPos,
            colorScale: scaleSequential(colorScales[colorScalesIndex]).domain([0, 1.7]),
            radius: 0,
            priority: this.ripplePriority++
        })
    }

    expandRipples() {
        const {points, ripples} = this

        for (const ripple of ripples) {
            if (ripple.radius >= 3) continue

            ripple.radius += 1/50

            for (const point of points) {
                if (point.colorPriority && point.colorPriority > ripple.priority)
                    continue

                const dist = distanceSq(point.curPos, ripple.origin)
                if (dist < ripple.radius**2) {
                    point.color = parseColor(ripple.colorScale(dist)) as RGBColor
                    point.colorPriority = ripple.priority
                }                                    

            }
        }
    }

    nextFrame() {
        this.frame++;

        this.expandRipples()
        if (this.frame === MAX_FRAME) {
            console.log("Resetting frame!");
            this.frame = 0;
            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i];
                point.curPos.x = point.initPos.x;
                point.curPos.y = point.initPos.y;
            }
            return;
        }
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const {x: oldX, y: oldY} = point.curPos;
            const {x: dX, y: dY} = point.deltaPos;

            // cos(a + b) = cos(a)cos(b) - sin(a)sin(b)
            point.curPos.x = oldX * dX - oldY * dY;
            // sin(a + b) = sin(a)cos(b) + cos(a)sin(b)
            point.curPos.y = oldY * dX + oldX * dY;
        }
    }
}

class Sunflower3DRenderer {
    canvas: HTMLCanvasElement;
    sunflower: Sunflower;
    gl: WebGLRenderingContext;
    
    width: number;
    height: number;
    size: number;

    scaleLocation: WebGLUniformLocation;
    

    vertexPositionLocation: GLuint;

    indexCount: number;
    
    // Stores data based on whether the renderer is based on instancing,
    // or uniforms.
    variantData!: {
        type: "instancing";
        coordLocation: GLuint;
        colorLocation: GLuint;

        coordArray: Float32Array;
        colorArray: Float32Array;

        coordBuffer: WebGLBuffer;
        colorBuffer: WebGLBuffer;

        ext: ANGLE_instanced_arrays;
    }

    constructor(canvas: HTMLCanvasElement, sunflower: Sunflower, circleSlices: number = 16) {
        this.canvas = canvas;
        const gl = canvas.getContext("webgl");
        if (gl === null) {
            throw new Error("Cannot get WebGL context.");
        }
        this.gl = gl;
        this.sunflower = sunflower;
        this.width = canvas.width;
        this.height = canvas.height;
        this.size = Math.max(this.width, this.height);

        const instanceExt = gl.getExtension("ANGLE_instanced_arrays");
        if (!instanceExt)
            throw new Error("WebGL instancing not supported")

        // Time for some fun boilerplate!
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(1, 1, 1, 1);
        // We don't need to enable depth test / back face culling.
        
        // Compiling shaders
        // As we're not using multiple programs, there's no need to store this
        // around for rendering.
        const program = (() => {
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            if (vertexShader === null) {
                throw new Error("Cannot create vertex shader?");
            }
            gl.shaderSource(vertexShader,
                VERTEX_SHADER_INSTANCING
            );
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                throw new Error(
                    "Vertex shader compilation failed.\n" +
                    "The error log is:\n" +
                    (gl.getShaderInfoLog(vertexShader) || "null???")
                );
            }

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            if (fragmentShader === null) {
                throw new Error("Cannot create fragment shader?");
            }
            gl.shaderSource(fragmentShader,
                FRAGMENT_SHADER_INSTANCING
            );
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                throw new Error(
                    "Fragment shader compilation failed.\n" +
                    "The error log is:\n" +
                    (gl.getShaderInfoLog(fragmentShader) || "null???")
                );
            }

            const program = gl.createProgram();
            if (program === null) {
                throw new Error("Cannot create GL program?");
            }
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(
                    "Shader linking failed.\n" +
                    "The error log is:\n" +
                    (gl.getProgramInfoLog(program) || "null???")
                );
            }

            return program;
        })();
        gl.useProgram(program);

        // Getting uniforms
        {
            const uniformLocation = (name: string) => {
                const location = gl.getUniformLocation(program, name);
                if (location === null) {
                    throw new Error(`Cannot get uniform location for ${name}.`);
                }
                return location;
            }
            this.scaleLocation = uniformLocation("scale");
            // Set scaleLocation.
            gl.uniform2f(this.scaleLocation, this.size / this.width, this.size / this.height);
        }

        // Setting vertex buffers and index buffers
        {
            const createBuffer = () => {
                const buf = gl.createBuffer();
                if (buf === null) {
                    throw new Error("Error when creating GL buffer??");
                }
                return buf;
            };
            const vertexPoints: number[] = [];
            // Push the center on.
            vertexPoints.push(0, 0);
            for (let i = 0; i < circleSlices; i++) {
                // Push the outside point on.
                const theta = 2 * Math.PI * i / circleSlices;
                vertexPoints.push(CIRCLE_SIZE * Math.cos(theta), CIRCLE_SIZE * Math.sin(theta));
            }
            // OK, let's turn it into an array buffer!
            const vertexPointsBuffer = createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPointsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPoints), gl.STATIC_DRAW);
            // and assign it to the vertex attrib.
            // Be sure to get the attrib first!
            this.vertexPositionLocation = gl.getAttribLocation(program, "vertexPosition");
            gl.vertexAttribPointer(this.vertexPositionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.vertexPositionLocation);


            // We want our circle to have a point in the center, with other
            // points scattered on the outside. We'll draw it with gl.TRIANGLE_FAN.
            // Because we only have one single vertex buffer (the location),
            // we can use the "first" vertex as the last one too.
            // If we had texture coordinates or something, this wouldn't work!
            const indices = [0];
            for (let i = 1; i <= circleSlices; i++) {
                indices.push(i);
            }
            indices.push(1);

            // OK, let's turn it into an index buffer and bind it!
            const indexBuffer = createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

            // We also need the count of indices for drawing.
            this.indexCount = indices.length;


            // Now... for the instancing.
            // How many points do we have?
            const n = sunflower.points.length;

            // Let's initialise EVERYTHING.
            this.variantData = {
                type: "instancing",
                coordArray: new Float32Array(n * 2),
                colorArray: new Float32Array(n * 3),
                coordBuffer: createBuffer(),
                coordLocation: gl.getAttribLocation(program, "coord"),
                colorBuffer: createBuffer(),
                colorLocation: gl.getAttribLocation(program, "color"),
                ext: instanceExt,
            }

            instanceExt.vertexAttribDivisorANGLE(this.vertexPositionLocation, 0);

            // Okay, let's set up the buffers.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.variantData.coordBuffer);
            // We'll fill in the buffer on draw.
            gl.vertexAttribPointer(this.variantData.coordLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.variantData.coordLocation);
            instanceExt.vertexAttribDivisorANGLE(this.variantData.coordLocation, 1);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.variantData.colorBuffer);
            // We'll fill in the buffer on draw.
            gl.vertexAttribPointer(this.variantData.colorLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.variantData.colorLocation);
            instanceExt.vertexAttribDivisorANGLE(this.variantData.colorLocation, 1);
        }
        

        requestAnimationFrame(this.render);
    }

    handleResize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.size = Math.max(this.width, this.height);
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.uniform2f(this.scaleLocation, this.size / this.width, this.size / this.height);
    }

    render = (_time: number) => {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT); // We aren't doing depth tests.
        const n = this.sunflower.points.length;
        for (let i = 0; i < n; i++) {
            const point = this.sunflower.points[i];
            this.variantData.coordArray[2*i + 0] = point.curPos.x;
            this.variantData.coordArray[2*i + 1] = point.curPos.y;
            this.variantData.colorArray[3*i + 0] = point.color.r/255;
            this.variantData.colorArray[3*i + 1] = point.color.g/255;
            this.variantData.colorArray[3*i + 2] = point.color.b/255;
            //this.variantData.rippleDArray[i] = point.rippleD;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.variantData.coordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.variantData.coordArray, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.variantData.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.variantData.colorArray, gl.DYNAMIC_DRAW);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.variantData.rippleDBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.variantData.rippleDArray, gl.DYNAMIC_DRAW);
        this.variantData.ext.drawElementsInstancedANGLE(gl.TRIANGLE_FAN, this.indexCount, gl.UNSIGNED_SHORT, 0, n);

        this.sunflower.nextFrame();
        requestAnimationFrame(this.render);
    }
}

export class SunflowerView {
    constructor(div: HTMLDivElement) {
        const canvas = document.createElement("canvas")
        div.appendChild(canvas)
    
        const sunflower = new Sunflower(MAX_POINTS);
        const renderer = new Sunflower3DRenderer(canvas, sunflower);
    
        let isMouseDown = false
        function onMouseMove(e: MouseEvent|TouchEvent) {
            e.preventDefault()

            const rect = (e.target as Element).getBoundingClientRect()
            const offsetX = (e as MouseEvent).offsetX || (e as any).targetTouches[0].pageX - rect.left
            const offsetY = (e as MouseEvent).offsetY || (e as any).targetTouches[0].pageY - rect.top
    
            const newMouse = { x: offsetX/rect.width*2 - 1, y: -(offsetY/rect.height*2 - 1)}
    
            const lastRipple = sunflower.ripples[sunflower.ripples.length-1]
            if (isMouseDown && (!lastRipple || lastRipple.radius > 1/8))
                sunflower.ripple(newMouse)
        }

        function onMouseDown(e: MouseEvent|TouchEvent) {
            isMouseDown = true
            onMouseMove(e)
        }

        function onMouseUp() {
            isMouseDown = false
        }
    
        canvas.onmousemove = onMouseMove
        canvas.onmousedown = onMouseDown
        canvas.onmouseup = onMouseUp
        canvas.onmouseleave = onMouseUp
        canvas.onmousemove = onMouseMove
        canvas.ontouchstart = onMouseDown
        canvas.ontouchend = onMouseUp
        canvas.ontouchmove = onMouseMove

        function onResize() {
            const rect = div.getBoundingClientRect()
            const size = Math.min(rect.width, rect.height)
            canvas.width = size
            canvas.height = size
            renderer.handleResize()
        }
        window.addEventListener("resize", onResize)
        onResize()
    }
}
