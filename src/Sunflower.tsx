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

@observer
class SunflowerMain extends React.Component<{ x: number, y: number, size: number }> {
    colorScales: d3.ScaleSequential<string>[] = _(d3_chromatic).keys().filter(k => k.indexOf('interpolate') !== -1).map(k => (d3_chromatic as any)[k]).value()
    colorScalesIndex = 0
    @observable rotation = +(new Date())/1000000000//0.1952444
    @observable isPlaying = true
    @observable bbox = null
    @observable mouse = { x: 0, y: 0 }
    @observable ripples: Ripple[] = []
    @observable ripplePriority = 0

    @computed get size() {
        return this.props.size
    }

    @computed get theta() {
        return Math.PI * (3 - Math.sqrt(5))
    }

    offscreenCanvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    base: React.RefObject<HTMLCanvasElement> = React.createRef()
    finalCtx!: CanvasRenderingContext2D
    points: {x: number, y: number, color?: string, colorPriority?: number}[]
    isMouseDown: boolean = false

    constructor(props: any) {
        super(props)
        this.points = d3.range(1000).map(i => {return { x: 0, y: 0 }})
        this.offscreenCanvas = document.createElement('canvas')
        this.ctx = this.offscreenCanvas.getContext('2d') as CanvasRenderingContext2D
    }

    updatePoints() {
        const {points, rotation, theta, size} = this

        const spacing = 0.015*size

        for (let i = 0; i < points.length; i++) {
            const radius = spacing * Math.sqrt(i)
            const angle = theta * i * rotation
            let x = size / 2 + radius * Math.cos(angle)
            let y = size / 2 + radius * Math.sin(angle)

            points[i].x = x
            points[i].y = y
        }
    }

    @action componentDidMount() {
        this.finalCtx = this.base.current!.getContext('2d') as CanvasRenderingContext2D
        this.componentDidUpdate()
        requestAnimationFrame(this.frame)
    }

    @action componentDidUpdate() {
        this.ripples.push(new Ripple({
            origin: { x: this.size/2, y: this.size/2 },
            colorScale: d3.scaleSequential(d3_chromatic.interpolateYlOrBr).domain([0, this.size*0.9]),
            radius: this.size,
            priority: 0
        }))

        this.offscreenCanvas.width = this.base.current!.width
        this.offscreenCanvas.height = this.base.current!.height        
    }

    @action.bound expandRipples() {
        const {points, ripples, size} = this

        ripples.forEach(ripple => {
            if (ripple.radius >= size*2) return

            ripple.radius += size/50

            points.forEach(point => {
                if (point.colorPriority && point.colorPriority > ripple.priority)
                    return

                const dist = getDistance(point, ripple.origin)
                if (dist < ripple.radius) {
                    point.color = ripple.colorScale(dist)
                    point.colorPriority = ripple.priority
                }                                    
            })
        })
    }

    @action.bound frame() {
        if (!this.base.current) return
        this.rotation += 0.000002//0.000001///Math.pow(dist(this.mouse, { x: this.width/2, y: this.height/2 }), 2)

        this.updatePoints()
        this.expandRipples()

        const {ctx, size, points, ripples} = this

        ctx.clearRect(0, 0, this.base.current!.width, this.base.current!.height);

        const pointRadius = Math.round(size/130)

        points.forEach(d => {
            ctx.fillStyle = d.color || '#f5a44a'
            ctx.beginPath()
            ctx.arc(d.x, d.y, pointRadius, 0, 2 * Math.PI, false)
            ctx.fill()
        })

        this.finalCtx.clearRect(0, 0, this.base.current!.width, this.base.current!.height);
        this.finalCtx.drawImage(this.offscreenCanvas, 0, 0)

        requestAnimationFrame(this.frame)
    }

    @action.bound onMouseDown(e: React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>) {
        this.isMouseDown = true
        this.onMouseMove(e)
    }

    @action.bound onMouseUp() {
        this.isMouseDown = false
    }

    @action.bound onMouseMove(e: React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>) {
        e.preventDefault()

        const rect = e.currentTarget.getBoundingClientRect()
        const offsetX = (e.nativeEvent as MouseEvent).offsetX || (e.nativeEvent as any).targetTouches[0].pageX - rect.left
        const offsetY = (e.nativeEvent as MouseEvent).offsetY || (e.nativeEvent as any).targetTouches[0].pageY - rect.top

        const newMouse = { x: offsetX, y: offsetY }
        this.mouse = newMouse

        const {size} = this

        const lastRipple = _.last(this.ripples)
        if (this.isMouseDown && (!lastRipple || lastRipple.radius > size/8))
            this.ripple()
    }

    @action.bound ripple() {
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

    render() {
        let {size} = this

        return <canvas 
            ref={this.base}
            width={size} height={size} style={{width: size, height: size, cursor: 'pointer'}}
            onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onMouseLeave={this.onMouseUp} onMouseMove={this.onMouseMove}
            onTouchStart={this.onMouseDown} onTouchEnd={this.onMouseUp} onTouchMove={this.onMouseMove}
        />
    }
}

@observer
export default class Sunflower extends React.Component {
    @observable size: number = 0
    base: React.RefObject<HTMLDivElement> = React.createRef()

    componentDidMount() {
        this.onResize()
        window.addEventListener('resize', this.onResize)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize)
    }

    @action.bound onResize() {
        this.size = Math.floor(Math.min(this.base.current!.clientWidth, this.base.current!.clientHeight))
    }

    render() {
        const {size, onResize} = this
        return <div ref={this.base} className={styles.sunflower}>
            {size && <SunflowerMain x={0} y={0} size={size}/>}
        </div>
    }
}
