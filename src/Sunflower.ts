import * as _ from 'lodash'
import * as React from 'react'
import * as d3 from 'd3'
import * as d3_chromatic from 'd3-scale-chromatic'
import {observer} from 'mobx-react'
import {computed, observable, action} from 'mobx'
import * as THREE from 'three'

declare var require: any
const styles = require('./Homepage.scss')

interface Vector2 {
    x: number,
    y: number
}

function getDistance(a: Vector2, b: Vector2) {
    return Math.sqrt((b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y))
}

class Ripple {
    @observable radius: number
    origin: Vector2
    colorScale: d3.ScaleSequential<string>
    priority: number

    constructor({origin, colorScale, radius, priority}: { origin: Vector2, colorScale: d3.ScaleSequential<string>, radius: number, priority: number}) {
        this.origin = origin
        this.colorScale = colorScale
        this.radius = radius
        this.priority = priority
    }
}

let frag1 = String.raw`
#define TWO_PI 6.2832
#define CIRCLE_SIZE 0.08
#define MAX_ITERATIONS 100

uniform float iGlobalTime;
uniform vec2 iResolution;
varying vec2 fragCoord;

void main()
{
	vec2 uv = fragCoord.xy;
    float width = iResolution.x;
    float height = iResolution.y;
    float size = max(width, height);
    float rotation = 0.1 + iGlobalTime/1000.;

	gl_FragColor = vec4(1.0);
    
    
    // max_i is when dist*dist == (width * width + height * height) / 4.0 + 0.008
    // 0.020 * size * 0.020 * size * i == (width * width + height * height) / 4.0 + 0.008
    // i == ((width * width + height * height) / 4.0 + 0.008) / (0.020 * size * 0.020 * size)
    // float max_i = ((width * width + height * height) / 4.0 + CIRCLE_SIZE) / (0.020 * size * 0.020 * size);
    
    
    vec2 pointCenter = vec2(width, height) / 2.0;
    
    float uvDist = length(uv - pointCenter);
    // we need to check all points with distances from uvDist - CIRCLE_SIZE to uvDist + CIRCLE_SIZE
    // it turns out that CIRCLE_SIZE is a proportion of size
    // if dist == uvDist - CIRCLE_SIZE * size
    // 0.020 * size * sqrt(i) == uvDist - CIRCLE_SIZE * size
    // 0.020 * sqrt(i) == uvDist / size - CIRCLE_SIZE
    // sqrt(i) == (uvDist / size - CIRCLE_SIZE) / 0.020
    float firstSqrtI = (uvDist / size - CIRCLE_SIZE) / 0.020;
    // if dist == uvDist + CIRCLE_SIZE * size
    // 0.020 * size * sqrt(i) == uvDist + CIRCLE_SIZE * size
    // 0.020 * sqrt(i) == uvDist / size + CIRCLE_SIZE
    // sqrt(i) == (uvDist / size + CIRCLE_SIZE) / 0.020
    float lastSqrtI = (uvDist / size + CIRCLE_SIZE) / 0.020;
    float lastI = ceil(lastSqrtI * lastSqrtI);
    float firstI = floor(firstSqrtI*firstSqrtI);
    float range = lastI-firstI;

    for (int j = 0; j < MAX_ITERATIONS; j++) {
        if (float(j) >= range) {
            break;
        }

        float i = firstI+float(j);

        float dist = 0.020 * size * sqrt(i);
        // if (dist > uvDist + CIRCLE_SIZE * size) break;
        // if (dist < uvDist - CIRCLE_SIZE * size) continue;
        float angle = TWO_PI/4. * i * rotation;

        vec2 xy = pointCenter + dist * vec2(cos(angle), sin(angle));
        float d = length(xy - uv) / size;        
        if (d < CIRCLE_SIZE) {
            float rangle = TWO_PI * i * rotation*10.;
            vec2 rippleCenter = vec2(size, size) / 2.;
			vec2 r = rippleCenter + size / 2. * vec2(cos(rangle), sin(rangle));
            float rippleD = length(xy - r)/ size*2.;
       
        
            gl_FragColor = vec4(245./255., 164./255., 74./255., 0) / rippleD;
            break;
        }
    }
}
`

let general = String.raw`
attribute vec3 in_Position;
varying vec2 fragCoord;
varying vec2 vUv; 
void main()
{
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    fragCoord = position.xy;
}
`

class GameObject {
    name: string
    geometry: THREE.BoxGeometry
    obj: any
    material: THREE.ShaderMaterial
    rx: number
    ry: number
    vel: [number, number, number]

    constructor(scene: THREE.Scene, name: string, x: number, y: number, z: number, col: number, rx: number, ry: number) {
        this.name = name
        this.geometry = new THREE.BoxGeometry(3, 3, 3);

        const uniforms = {
            iGlobalTime: {
              type: "f",
              value: 1.0
            },
            iResolution: {
              type: "v2",
              value: new THREE.Vector2()
            },
          };
          uniforms.iResolution.value.x = 1; // window.innerWidth;
          uniforms.iResolution.value.y = 1; // window.innerHeight;
          this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: general,
            fragmentShader: frag1
          });
          this.obj = new THREE.Mesh(this.geometry, this.material);
          this.obj.startTime = Date.now();
          this.obj.uniforms = uniforms;
          this.rx = rx
          this.ry = ry
          this.obj.name = name
          scene.add(this.obj);
          this.obj.position.x = x;
          this.obj.position.y = y;
          this.obj.position.z = z;
          this.vel = [0, 0, 0]    
    }

    update() {
        this.obj.rotation.x += this.rx
        this.obj.rotation.y += this.ry
        this.obj.position.x += this.vel[0]
        this.obj.position.y += this.vel[1]
        this.obj.position.z += this.vel[2]
        var elapsedMilliseconds = Date.now() - this.obj.startTime;
        var elapsedSeconds = elapsedMilliseconds / 1000.;
        this.obj.uniforms.iGlobalTime.value = elapsedSeconds;
    }
}

export class Sunflower {
    static replaceImg(img: Element) {
        const node = document.createElement("div")
        node.className = "sunflower"
        img.replaceWith(node)

        requestAnimationFrame(() => {
            const sunflower = new Sunflower(node)
            sunflower.play()    
        })
    }

    base: HTMLDivElement
    theta: number = Math.PI * (3 - Math.sqrt(5))
    colorScales: d3.ScaleSequential<string>[] = _(d3_chromatic).keys().filter(k => k.indexOf('interpolate') !== -1).map(k => (d3_chromatic as any)[k]).value()
    colorScalesIndex = 0
    rotation = +(new Date())/1000000000//0.1952444
    mouse = { x: 0, y: 0 }
    ripples: Ripple[] = []
    ripplePriority = 0
    finalCtx!: CanvasRenderingContext2D
    isMouseDown: boolean = false
    size!: number


    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    gameObjects: GameObject[] = []

    constructor(base: HTMLDivElement) {
        this.base = base 
        this.size = Math.floor(Math.min(this.base.clientWidth, this.base.clientHeight))

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

        /*this.canvas = document.createElement('canvas')

        this.canvas.width = this.size
        this.canvas.height = this.size
        this.canvas.style.width = this.size+'px'
        this.canvas.style.height = this.size+'px'
        this.canvas.style.cursor = 'pointer'
        this.canvas.onmousedown = this.onMouseDown.bind(this)
        this.canvas.onmouseup = this.onMouseUp.bind(this)
        this.canvas.onmouseleave = this.onMouseUp.bind(this)
        this.canvas.onmousemove = this.onMouseMove.bind(this)
        this.canvas.ontouchstart = this.onMouseDown.bind(this)
        this.canvas.ontouchend = this.onMouseUp.bind(this)
        this.canvas.ontouchmove = this.onMouseMove.bind(this)*/

        window.addEventListener('resize', this.onResize.bind(this))

        this.camera.position.x = 0;
        this.camera.position.y = 10;
        this.camera.position.z = 0;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.size, this.size);
        base.appendChild(this.renderer.domElement);
      
        var light = new THREE.HemisphereLight(0xeeeeee, 0x888888, 1);
        light.position.set(0, 20, 0);
        this.scene.add(light);
        this.frame()
      
        this.gameObjects.push(new GameObject(this.scene, "cube3", 0, 10, -3, 0x0000ff, 0, 0.0001))
    }

    destroy() {
        window.removeEventListener('resize', this.onResize)
    }


    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    play() {
        requestAnimationFrame(this.frame.bind(this))
    }

    frame() {
        this.gameObjects.forEach(function(item) {
            item.update();
        });
        requestAnimationFrame(this.frame.bind(this));
        this.renderer.render(this.scene, this.camera);
        return
        /*this.rotation += 0.000002//0.000001///Math.pow(dist(this.mouse, { x: this.width/2, y: this.height/2 }), 2)

        const {ctx, size, points, ripples} = this

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const pointRadius = Math.round(size/130)
        
        for (const p of points) {
        }


        const numPoints = 1000

        const {rotation, theta} = this
        const spacing = 0.015*size

        for (let i = 0; i < numPoints; i++) {
            const radius = spacing * Math.sqrt(i)
            const angle = theta * i * rotation
            let x = size / 2 + radius * Math.cos(angle)
            let y = size / 2 + radius * Math.sin(angle)

            ctx.fillStyle = '#f5a44a'
            ctx.beginPath()
            ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false)
            ctx.fill()
        }

        requestAnimationFrame(this.frame.bind(this))*/
    }
/*
    expandRipples() {
        const {points, ripples, size} = this

        for (const ripple of ripples) {
            if (ripple.radius >= size*2) return

            ripple.radius += size/50

            for (const point of points) {
                if (point.colorPriority && point.colorPriority > ripple.priority)
                    continue

                const dist = getDistance(point, ripple.origin)
                if (dist < ripple.radius) {
                    point.color = ripple.colorScale(dist)
                    point.colorPriority = ripple.priority
                }                                    
            }
        }
    }

    ripple() {
        this.colorScalesIndex = this.colorScalesIndex >= this.colorScales.length-1 ? 0 : this.colorScalesIndex+1     

        const {colorScales, colorScalesIndex, mouse, points} = this

        const closestPointToMouse = _.orderBy(points, point => getDistance(point, mouse))[0]

        if (this.ripples.length >= 50)
            this.ripples = this.ripples.slice(1)
        
        this.ripples.push(new Ripple({
            origin: closestPointToMouse,
            colorScale: d3.scaleSequential(colorScales[colorScalesIndex]).domain([0, this.size*0.75]),
            radius: 0,
            priority: this.ripplePriority++
        }))        
    }*/


    onMouseDown(e: MouseEvent|TouchEvent) {
        this.isMouseDown = true
        this.onMouseMove(e)
    }

    onMouseUp() {
        this.isMouseDown = false
    }

    onMouseMove(e: MouseEvent|TouchEvent) {
        e.preventDefault()

        const rect = (e.currentTarget as Element).getBoundingClientRect()
        const offsetX = (e as MouseEvent).offsetX || (e as any).targetTouches[0].pageX - rect.left
        const offsetY = (e as MouseEvent).offsetY || (e as any).targetTouches[0].pageY - rect.top

        const newMouse = { x: offsetX, y: offsetY }
        this.mouse = newMouse

        const {size} = this

        const lastRipple = _.last(this.ripples)
//        if (this.isMouseDown && (!lastRipple || lastRipple.radius > size/8))
//            this.ripple()
    }
}