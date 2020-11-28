import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observer} from 'mobx-react'
import * as _ from 'lodash'

import {Metas} from './Metas'
import {HeartButton} from './HeartButton'

declare var require: any
const styles = require('./Homepage.scss')
const sunflowerImg = require('./sunflower.png')

@observer
export default class Homepage extends React.Component<{ assets: {[key: string]: string} }> {
	render() {
        const description = `Hi! I'm a software engineer, designer, and researcher. I work on tools to help humans learn and grow. Interactions with technology can be a powerful influence on how we think and feel. I want to create systems where that influence is intentionally positive, and leads to happier, healthier people.`
        
        // TODO mobile
        return <main className={styles.homepage}>
            <Metas title="Jaiden Mispy" description={description} path="/" img={"https://mispy.me/" + sunflowerImg}/>
            <section className="intro">
                <h1>Jaiden Mispy</h1>
                <p>Hi! I'm a software engineer, designer, and researcher. I work on tools to help humans learn and grow.</p>
                <p>Interactions with technology can be a powerful influence on how we think and feel. I want to create systems where that influence is intentionally positive, and leads to happier, healthier people.</p>
                <p>In the past, I helped to build the technical infrastructure of <a href="https://ourworldindata.org/">Our World in Data</a> at the University of Oxford.</p>
                <p>I'm now an independent developer, funding my own projects with part-time contracts and <a href="https://www.patreon.com/mispy">Patreon</a>. If you find my work interesting, you can <a href="https://www.patreon.com/mispy">become a member</a> to help me spend more time on it.</p>
                <footer>
                    <div>
                        <a href="mailto:jaiden@mispy.me">jaiden@mispy.me</a> • <a href="https://twitter.com/mispy11">@mispy11</a>
                        <HeartButton/>
                    </div>
                    <p>Most of my work is <a href="https://github.com/mispy">open source</a>, including <a href="https://github.com/mispy/mispy.me">this site</a></p>
                </footer>
            </section>
            <section className="dawnguide">
                <h2>Dawnguide</h2>
                <p><a href="https://dawnguide.com">Dawnguide</a> is my small, specialized encyclopedia and spaced learning system for mental health strategies that are strongly supported by evidence.</p> 
                <p>It aims to bridge the gap between the collective knowledge of the human mind that is locked away in scientific journals, and those who would most benefit from applying that knowledge in their own lives.</p>
                <p>Since it feels wrong to paywall something that is most potentially useful to vulnerable people, I decided to build Dawnguide as a free <a href="https://en.wikipedia.org/wiki/Public_good_(economics)">public good</a>. The content is licensed under CC-BY, and the code is <a href="https://github.com/mispy/dawnguide">open source</a>.</p>
                <a href="https://dawnguide.com">
                    <footer>
                    </footer>
                </a>
            </section>
            <section className="little">
                <h2>Little Projects</h2>
                <ul>
                    <li>I made <a href="https://kanajolt.mispy.me/">Kanajolt</a>, a minigame that helps you learn Japanese syllabaries by reading Pokémon names.</li>
                    <li>You can play <a href="https://pathspire.mispy.me/">Pathspire</a>, my little gamejam puzzle roguelike.</li>
                    <li>I'm trying to <a href="https://github.com/mispy/kiwisbybeat-archive">archive the works</a> of the mysterious webcomic artist Ryan Armand. If you happen to have pages from the Socks comics, let me know!</li>
                    <li>Tiny web experiments: <a href="https://mispy.me/taxicab">taxicab spheres</a>, <a href="https://mispy-spectral-pulse.netlify.com">spectral pulse</a>, <a href="https://mispy-hexgrid.netlify.com/">hex gradients</a>, <a href="https://plusle.mispy.me/">positivity Plusle</a>, <a href="https://spdgrid.mispy.me/">spatial prisoner's dilemma</a></li>
                    <li>My <a href="https://github.com/mispy/adventofcode">solutions</a> to the Advent of Code competition puzzles</li>
                </ul>
                <a href="https://kanajolt.mispy.me"><footer>
                    <img src="/images/149.png"/>
                    <img src="/images/286.png"/>
                    <img src="/images/350.png"/>
                    <img src="/images/376.png"/>
                    <img src="/images/468.png"/>
                    <img src="/images/135.png"/>
                </footer></a>
            </section>
            <script src={this.props.assets['homepage.js']}/>
        </main>
	}
}
