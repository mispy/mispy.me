import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import * as _ from 'lodash'

import { Metas } from './Metas'
import { HeartButton } from './HeartButton'

declare var require: any
const styles = require('./Homepage.scss')
const sunflowerImg = require('./sunflower.png')

@observer
export default class Homepage extends React.Component<{ assets: { [key: string]: string } }> {
    render() {
        const description = `Hi, I'm Jaiden (also known as Mispy)! I work part-time as a freelance web developer, and in my spare hours I do some projects you can find on this site.`

        return <main className={styles.homepage}>
            <Metas title="Jaiden Mica" description={description} path="/" img={"https://mispy.me/" + sunflowerImg} />
            <section className="intro">
                <div>
                    <h1>Jaiden Mica</h1>
                    <p>Hi, I'm Jaiden (also known as Mispy)! I work part-time as a freelance web developer, and in my spare hours I do some projects here. I originally studied biology at university.</p>
                    <p>I try to lead a peaceful life filled with quiet compassion and playful curiosity, and I think it would be nice to make this an achievable option for everyone.</p>
                    <p>In the past, I worked with researchers at the University of Oxford to build a bunch of the initial structure of <a href="https://ourworldindata.org/">Our World in Data</a>.</p>
                    <p>I'm a little shy, but I like to make cool new internet friends (and sometimes travel to meet them!), so feel free to send me a message.</p>
                </div>
                <footer>
                    <div>
                        <a href="mailto:jaiden@mispy.me">jaiden@mispy.me</a>  •  <a href="https://twitter.com/m1spy">@m1spy</a>  •  <a href="https://github.com/mispy">GitHub</a>
                    </div>
                    <div>Here is a button I made for you:  <HeartButton/></div>
                </footer>
            </section>
            <section className="dawnguide">
                <div>
                    <h2>Dawnguide</h2>
                    <p></p>
                    <p><a href="https://dawnguide.com">Dawnguide</a> is my <a href="https://notes.andymatuschak.org/Mnemonic_medium">mnemonic medium</a> project about how human minds work. I'm gradually collecting research there on how to positively influence thoughts and behavior, and combining it with flashcard memorization using the <a href="https://dawnguide.com/spaced-learning">spacing effect</a>.</p>
                    <p>So far, I've found the research on <a href="https://dawnguide.com/self-compassion">self-compassion</a> to be especially meaningful. Many people try to achieve self-control through harsh self-criticism, but science does not support this strategy! It's better to be kind and encouraging towards the person that is you.</p>
                </div>
                <a href="https://dawnguide.com">
                    <footer>
                    </footer>
                </a>
            </section>
            <section className="little">
                <div>
                    <h2>Little Projects</h2>
                    <ul>
                        <li>I made <a href="https://kanajolt.mispy.me/">Kanajolt</a>, a minigame that helps you learn Japanese syllabaries by reading Pokémon names.</li>
                        <li>You can play <a href="https://pathspire.mispy.me/">Pathspire</a>, my little gamejam puzzle roguelike.</li>
                        <li>I'm trying to <a href="https://github.com/mispy/kiwisbybeat-archive">archive the works</a> of the mysterious webcomic artist Ryan Armand. If you happen to have pages from the Socks comics, let me know!</li>
                        <li>Tiny web experiments: <a href="https://mispy-spectral-pulse.netlify.com">spectral pulse</a>, <a href="https://mispy-hexgrid.netlify.com/">hex gradients</a>, <a href="https://plusle.mispy.me/">positivity Plusle</a>, <a href="https://spdgrid.mispy.me/">spatial prisoner's dilemma</a></li>
                        <li>Visualizing <a href="https://adventofcode.com/">Advent of Code</a> puzzles: <a href="https://mispy.me/taxicab">2018 day 23: Emergency Experimental Teleportation</a>, <a href="https://mispy.me/aoc-wires">2019 day 3: Crossed Wires</a>, <a href="https://mispy.me/aoc-orbits">2019 day 6: Universal Orbit Map</a></li>
                    </ul>
                </div>
                <a href="https://kanajolt.mispy.me"><footer>
                    <img src="/images/149.png" />
                    <img src="/images/286.png" />
                    <img src="/images/350.png" />
                    <img src="/images/376.png" />
                    <img src="/images/468.png" />
                    <img src="/images/135.png" />
                </footer></a>
            </section>
            <section className="sunflowerSection">
                <img src={sunflowerImg} className="sunflower" />
            </section>
            <script src={this.props.assets['homepage.js']} />
        </main>
    }
}
