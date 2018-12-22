import {SunflowerView} from './Sunflower'

const img = document.querySelector(".sunflower") as Element
const div = document.createElement("div")
div.className = "sunflower"

img.replaceWith(div)

try {
    new SunflowerView(div)

    const h1 = document.querySelector("h1") as Element
    const p = document.createElement("p")
    p.innerHTML = `<p>This pretty swirly <a href="https://github.com/mispy/mispy.me/blob/master/src/Sunflower.ts">WebGL thing</a> is a <a href="https://en.wikipedia.org/wiki/Phyllotaxis">phyllotaxis</a>. Try clicking on it!</p>`
    h1.after(p)
} catch (e) {
    div.replaceWith(img)
    console.error(e)
}

document.body.style.opacity = null