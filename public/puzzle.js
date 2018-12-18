const puzzle = `\n
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
__________________________________________###____________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
________________________________________________##_______________
__________________________________________________##_____________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
____________________________##___________________________________
_______________________##________________________________________
_______________________________________________________#_________
__________________#__________________##__________________________
_________________________________________________________________
________________________________________##_______________________
_____________#____________________________#______________________
__________________________________________#______________________
___________#_______________________________#_____________________
___________#______________________________________________#______
__________#__________________________________#___________________
__________#_________________________________#____________________
_________________________________________________________________
________#______________#_________________________________________
________#_______________#_____________________#__________________
_______#_____________##______________________#_____________#_____
_______#_____________##__________#_______________________________
____________________#____________________________________________
_________________________________#__#________##__________________
___________________#___________#####_________#____________#______
___________________#___________#####_________#____________#______
_____________________________#_####__________#____________#______
________________________________##__________#_____________#______
__________________#__________#______________#____________________
___________________#_____________________________________________
______________________________##_________________________#_______
________________________________##______________________#________
__________________________________###___________________#________
___________________#________________#____________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
______________________#__________________________________________
______________________#__________________________________________
_________________________________________________#_______________
________________________##_______________________#_______________
__________________________##_____________________________________
____________________________________________##___________________
____________________________#__#________#__##____________________
________________________________#__#__#__________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
____________________###__________________________________________
_______________________#_________________________________________
_________________________________________________________________
___________________________####__________________________________`

let formattedPuzzle = puzzle.replace(/#+/g, '%c$&').replace(/_+/g, '%c$&')

const styles = []
for (const m of formattedPuzzle.match(/%c./g)||[]) {
    if (m[2] === '#')
        styles.push('background-color: #111; color: #df7a02')
    else
        styles.push('background-color: #111; color: #2d572c')
}

formattedPuzzle = formattedPuzzle.replace(/#/g, '#').replace(/_/g, '.')

console.log(formattedPuzzle, ...styles)
console.log('%cLeaves swirl in the autumn breeze. How will they settle?', 'color: #df7a02')

// Hint: Math.PI * (Math.round(distanceFromCenter) / width) * t
console.log('%c\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tYou hear a message whispered on the wind.', 'color: #df7a02; font-size: 0.6em; text-align: right;')
