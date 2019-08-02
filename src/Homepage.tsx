import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observer} from 'mobx-react'
import * as _ from 'lodash'

import {Metas} from './Metas'
import {HeartButton} from './HeartButton'

declare var require: any
const styles = require('./Homepage.scss')
const mispyImg = require('./mispy.png')
const sunflowerImg = require('./sunflower.png')
const owidImg = require('./owid.png')

@observer
export default class Homepage extends React.Component<{ assets: {[key: string]: string} }> {
	render() {
        const description = `Hi, I'm Mispy! A tech person focused on inclusive positivity. I like cute things and learning the stories of nice humans. he/him 🌈💛`

        return <main className={styles.homepage}>
            <Metas title="Mispy's Website" description={description} path="/" img={"https://mispy.me/" + sunflowerImg}/>
            <section className={styles.cover}>
                <img className={styles.sunflower} src={sunflowerImg}/>
                <h1>Mispy's Website</h1>
                <i className="angle-down"/>
            </section>
            <section className="misc">
                <h3>Big Projects</h3>
                    <ul>
                        <li>I worked with researchers at the University of Oxford on <a href="https://ourworldindata.org">Our World in Data</a>, an open science project to make the research about global issues like poverty and climate change easy to access.</li>
                    </ul>
                <h3>Little Projects</h3>
                <ul>
                    <li>I made <a href="https://kanajolt.mispy.me/">Kanajolt</a>, a thing that helps you learn Japanese syllabaries by reading Pokémon names.</li>
                    <li>You can play <a href="https://pathspire.mispy.me/">Pathspire</a>, my little gamejam puzzle roguelike.</li>
                    <li>I'm trying to <a href="https://github.com/mispy/kiwisbybeat-archive">archive the works</a> of the mysterious webcomic artist Ryan Armand. If you happen to have pages from the Socks comics, let me know!</li>
                    <li>Tiny web experiments: <a href="https://mispy.me/taxicab">taxicab spheres</a>, <a href="https://mispy-spectral-pulse.netlify.com">spectral pulse</a>, <a href="https://mispy-hexgrid.netlify.com/">hex gradients</a>, <a href="https://plusle.mispy.me/">positivity Plusle</a>, <a href="https://spdgrid.mispy.me/">spatial prisoner's dilemma</a></li>
                    <li>My <a href="https://github.com/mispy/adventofcode">solutions</a> to the Advent of Code competition puzzles</li>
                </ul>
                <h3>Writing</h3>
                <ul>
                    <li>I helped write this post about the <a href="https://ourworldindata.org/child-mortality-globally">huge decline in child mortality</a>. Perhaps more than anything else, learning about this fundamentally changed the way I see the world.</li>
                    <li>You can read my <a href="https://usesthis.com/interviews/jaiden.mispy/">interview on Uses This</a> about web development tools and working with scientists as a programmer.</li>
                    <li>I have a collection of <a href="/links">links</a> to useful online resources I've discovered over the years.</li>
                    <li>Many years ago I made a <a href="https://github.com/mispy/twitter_ebooks">twitterbot library</a>. It was <a href="/the-mysterious-nature-of-bots/">weirdly popular</a>.</li>
                </ul>
            </section>
            <footer>
                <p><a href="mailto:jaiden@mispy.me">jaiden@mispy.me</a></p>
                <p>Most things I make are <a href="https://github.com/mispy">open source</a>, including <a href="https://github.com/mispy/mispy.me">this site</a></p>
            </footer>
            <HeartButton/>
            <script src={this.props.assets['homepage.js']}/>
        </main>
	}
}
