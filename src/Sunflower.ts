import * as _ from 'lodash'
import * as React from 'react'
import * as d3 from 'd3'
import * as d3_chromatic from 'd3-scale-chromatic'
import {observer} from 'mobx-react'
import {computed, observable, action} from 'mobx'

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
    offscreenCanvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    finalCtx!: CanvasRenderingContext2D
    points: {x: number, y: number, color?: string, colorPriority?: number}[]
    isMouseDown: boolean = false
    size!: number
    canvas: HTMLCanvasElement

    constructor(base: HTMLDivElement) {
        this.base = base 
        this.onResize()
        this.points = d3.range(1000).map(i => {return { x: 0, y: 0 }})

        this.ripples.push(new Ripple({
            origin: { x: this.size/2, y: this.size/2 },
            colorScale: d3.scaleSequential(d3_chromatic.interpolateYlOrBr).domain([0, this.size*0.9]),
            radius: this.size,
            priority: 0
        }))

        this.canvas = document.createElement('canvas')

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
        this.canvas.ontouchmove = this.onMouseMove.bind(this)

        this.base.appendChild(this.canvas)

        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = this.canvas.width
        this.offscreenCanvas.height = this.canvas.height  
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

        window.addEventListener('resize', this.onResize)
    }

    destroy() {
        window.removeEventListener('resize', this.onResize)
    }


    onResize() {
        this.size = Math.floor(Math.min(this.base.clientWidth, this.base.clientHeight))
    }

    play() {
        requestAnimationFrame(this.frame.bind(this))
    }

    frame() {
        this.rotation += 0.000002//0.000001///Math.pow(dist(this.mouse, { x: this.width/2, y: this.height/2 }), 2)

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

        requestAnimationFrame(this.frame.bind(this))
    }

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
    }


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
        if (this.isMouseDown && (!lastRipple || lastRipple.radius > size/8))
            this.ripple()
    }
}