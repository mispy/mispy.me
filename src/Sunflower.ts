import * as _ from 'lodash'
import * as React from 'react'
import * as d3 from 'd3'
import * as d3_chromatic from 'd3-scale-chromatic'
import {observer} from 'mobx-react'
import {computed, observable, action} from 'mobx'
import * as THREE from 'three'
import { Camera } from 'three';

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
#define CIRCLE_SIZE 0.8
#define SCALE_FACTOR 0.0020
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
    float circleSize = CIRCLE_SIZE;
    float scaling = SCALE_FACTOR;

	gl_FragColor = vec4(1.0);
    vec2 pointCenter = vec2(width, height) / 2.0;    
    float uvDist = length(uv - pointCenter);
    float firstSqrtI = (uvDist / size - circleSize) / scaling;
    float lastSqrtI = (uvDist / size + circleSize) / scaling;
    float lastI = ceil(lastSqrtI * lastSqrtI);
    float firstI = floor(firstSqrtI*firstSqrtI);
    float range = lastI-firstI;

    for (int j = 0; j < MAX_ITERATIONS; j++) {
        if (float(j) >= range) {
            break;
        }

        float i = firstI+float(j);

        float dist = scaling * size * sqrt(i);
        // if (dist > uvDist + circleSize * size) break;
        // if (dist < uvDist - circleSize * size) continue;
        float angle = TWO_PI/4. * i * rotation;

        vec2 xy = pointCenter + dist * vec2(cos(angle), sin(angle));
        float d = length(xy - uv) / size;        
        if (d < circleSize) {
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
void main()
{
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    fragCoord = uv;
}
`

class GameObject {
    name: string
    geometry: THREE.PlaneGeometry
    obj: any
    material: THREE.Material
    
    constructor(scene: THREE.Scene, name: string, width: number, height: number, x: number, y: number, z: number) {
        this.name = name
        this.geometry = new THREE.PlaneGeometry(width, height);

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
          uniforms.iResolution.value.x = 1;
          uniforms.iResolution.value.y = 1;
          this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: general,
            fragmentShader: frag1
          });

              // material
            /*this.material = new THREE.MeshBasicMaterial( {
                color: 0x00ffff, 
            } );*/
    
          this.obj = new THREE.Mesh(this.geometry, this.material);
          this.obj.startTime = Date.now();
          this.obj.uniforms = uniforms;
          this.obj.name = name
          scene.add(this.obj);
    }

    update() {
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
    width!: number
    height!: number


    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    renderer: THREE.WebGLRenderer
    plane: GameObject

    constructor(base: HTMLDivElement) {
        this.base = base 


        const worldWidth = 100
        const worldHeight = 100
        const worldSize = Math.max(worldWidth, worldHeight)

        this.scene = new THREE.Scene()
        this.camera = new THREE.OrthographicCamera(-worldWidth/2, worldWidth/2, -worldHeight/2, worldHeight/2, 1, worldSize*10)
        this.camera.position.set(0, 0, -worldSize*2)

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


        this.renderer = new THREE.WebGLRenderer();
        base.appendChild(this.renderer.domElement);

        this.plane = new GameObject(this.scene, "plane", worldWidth, worldHeight, 0, 0, 0)
        this.camera.lookAt(this.plane.obj.position)
        this.onResize()

        this.bindFrame = this.frame.bind(this)
        window.addEventListener('resize', this.onResize.bind(this))
    }

    destroy() {
        window.removeEventListener('resize', this.onResize)
    }


    onResize() {
        this.size = Math.floor(Math.min(this.base.clientWidth, this.base.clientHeight))
        this.width = this.base.clientWidth//this.size
        this.height = this.base.clientHeight//this.size
        this.renderer.setSize(this.width, this.height);
    }

    play() {
        requestAnimationFrame(this.bindFrame)
    }

    bindFrame: () => void
    frame() {
        this.plane.update()
        requestAnimationFrame(this.bindFrame);
        this.renderer.render(this.scene, this.camera);
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