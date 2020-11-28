import {SunflowerView} from './Sunflower'

const img = document.querySelector(".sunflower") as Element
const div = document.createElement("div")
div.className = "sunflower"

img.replaceWith(div)

try {
    new SunflowerView(div)
} catch (e) {
    div.replaceWith(img)
    console.error(e)
}

document.body.style.opacity = null