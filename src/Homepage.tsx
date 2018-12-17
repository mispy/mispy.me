import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observable, computed, action} from 'mobx'
import {observer} from 'mobx-react'
import Sunflower from './Sunflower'

declare var require: any
const styles = require('./Homepage.scss')
const mispyImg = require('./mispy.png')
const sunflowerImg = require('./sunflower.png')
const owidImg = require('./owid.png')

declare var window: any
window.homepageStart = function() {
    ReactDOM.render(<Homepage isClient={true}/>, document.querySelector("#app"))

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

    console.log(puzzle.replace(/#/g, '🍂').replace(/_/g, '🍃'))
    console.log('%c Leaves swirl in the autumn breeze. Your hear a whisper upon the wind. All is still in the center.', 'color: #df7a02');
}

@observer
export default class Homepage extends React.Component<{ isClient: boolean }> {
	render() {
        const {isClient} = this.props


        return <main className={styles.homepage}>
            <section className={styles.cover}>
                {isClient && <Sunflower/>}
                {!isClient && <img className={styles.sunflower} src={sunflowerImg}/>}
                <h1>Mispy's Website</h1>
                <p>This pretty swirly thing is a <a href="https://en.wikipedia.org/wiki/Phyllotaxis">phyllotaxis</a>. Try clicking on it!</p>
                <i className="fa fa-angle-down"/>
            </section>
            <section className={styles.currentProject}>
                <h2>Main Project</h2>
                <hr/>
                <div className="project">
                    <a href="https://ourworldindata.org" target="_blank"><img src={owidImg}/></a>
                    <p>Since 2016 I've been working with some awesome researchers at the University of Oxford on <a href="https://ourworldindata.org">Our World in Data</a>. We're building a big collection of open knowledge, covering topics like <a href="https://ourworldindata.org/extreme-poverty">global poverty</a>, <a href="https://ourworldindata.org/financing-healthcare">healthcare financing</a> and <a href="https://ourworldindata.org/co2-and-other-greenhouse-gas-emissions">climate change</a>.</p>
                    <p>I'm responsible for the tech side of the project and spend most of my time working on our open source <a href="https://github.com/owid/owid-grapher">data visualization engine</a>. If you're interested in getting involved, you can check out some of our <a href="https://github.com/owid/owid-grapher/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22">GitHub issues</a>!</p>
                </div>
            </section>
            <section className="misc">
                <h3>Little Projects</h3>
                <ul>
                    <li>I made <a href="https://kanajolt.mispy.me/">Kanajolt</a>, a thing that helps you learn Japanese syllabaries by reading Pokémon names.</li>
                    <li>You can play <a href="https://pathspire.mispy.me/">Pathspire</a>, my little gamejam puzzle roguelike.</li>
                    <li>I'm trying to <a href="https://github.com/mispy/kiwisbybeat-archive">archive the works</a> of the mysterious webcomic artist Ryan Armand. If you happen to have pages from the Socks comics, let me know!</li>
                    <li>Tiny web experiments: <a href="https://mispy-spectral-pulse.netlify.com">spectral pulse</a>, <a href="https://mispy-hexgrid.netlify.com/">hex gradients</a>, <a href="https://plusle.mispy.me/">positivity Plusle</a>, <a href="https://spdgrid.mispy.me/">spatial prisoner's dilemma</a></li>
                    <li>My <a href="https://github.com/mispy/adventofcode">solutions</a> to the Advent of Code competition puzzles</li>
                </ul>
                <h3>Writing</h3>
                <ul>
                    <li>I helped write this post about the <a href="https://ourworldindata.org/child-mortality-globally">huge decline in child mortality</a>. Perhaps more than anything else, learning about this fundamentally changed the way I see the world.</li>
                    <li>You can read my <a href="https://usesthis.com/interviews/jaiden.mispy/">interview on Uses This</a> about web development tools and working with scientists as a programmer.</li>
                    <li>Many years ago I made a <a href="https://github.com/mispy/twitter_ebooks">twitterbot library</a>. It was <a href="https://mispy.me/the-mysterious-nature-of-bots/">weirdly popular</a>.</li>
                </ul>
            </section>
            <footer>
                <p><a href="mailto:jaiden@mispy.me">jaiden@mispy.me</a> / <a href="https://twitter.com/m1sp">@m1sp</a></p>
                <p>I may take a while to respond to email. The best way to contact me is <a href="https://twitter.com/intent/tweet/?text=@m1sp%20Hi%20Mispy!">via Twitter</a>.</p>
                <p>Most things I make are <a href="https://github.com/mispy">open source</a>, including <a href="https://github.com/mispy/mispy.me">this site</a></p>
            </footer>
            <script async dangerouslySetInnerHTML={{__html: "window.homepageStart()"}}></script>
        </main>
	}
}
