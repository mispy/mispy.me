import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observable, computed, action} from 'mobx'
import {observer} from 'mobx-react'
import * as moment from 'moment'
import Link from './Link'
import Sunflower from './Sunflower'

declare var require: any
const styles = require('./Homepage.css')
const mispyImg = require('./mispy.png')
const sunflowerImg = require('./sunflower.png')
const owidImg = require('./owid.png')

declare var window: any
window.homepageStart = function() {
    ReactDOM.render(<Homepage isClient={true}/>, document.body)
}

@observer
export default class Homepage extends React.Component<{ isClient: boolean }> {
	render() {
        const {isClient} = this.props


        return <main className={styles.homepage}>
            <section className={styles.cover}>
                {isClient && <Sunflower/>}
                {!isClient && <img className={styles.sunflower} src={sunflowerImg}/>}
                <h1>Jaiden Mispy</h1>
                <hr/>
                <p>Data Visualization Developer</p>

                <i className="fa fa-angle-down"/>
            </section>
            <section className={styles.currentProject}>
                <h2>Current Project</h2>
                <hr/>
                <div className="project">
                    <a href="https://ourworldindata.org" target="_blank"><img src={owidImg}/></a>
                    <p>Since 2016 I have been working with a great team at the <a href="http://www.oxfordmartin.ox.ac.uk/">Oxford Martin School</a> on <a href="https://ourworldindata.org">Our World in Data</a>. Our goal is to make reliable information about important global issues accessible and freely available to all of humanity.</p>
                </div>
            </section>
            <section className={styles.contact}>
                <h2>Contact</h2>
                <hr/>
                <form action="https://formspree.io/jaiden@mispy.me" method="POST">
                    <input type="text" name="name" placeholder="Name" required/>
                    <input type="email" name="_replyto" placeholder="Email Address" required/>
                    <textarea name="message" rows={5} placeholder="Message" required/>
                    <input type="submit" value="Send"/>
                </form>
            </section>
            <footer>
                <a href="mailto:jaiden@mispy.me">jaiden@mispy.me</a>
                <div className={styles.socialLinks}>
                    <a href="https://twitter.com/m1sp" target="_blank"><i className="fa fa-twitter"/></a>
                    <a href="https://github.com/mispy" target="_blank"><i className="fa fa-github"/></a>
                    <a href="https://facebook.com/misprime" target="_blank"><i className="fa fa-facebook"/></a>
                </div>            
            </footer>
            <script async dangerouslySetInnerHTML={{__html: "window.homepageStart()"}}></script>
        </main>
	}
}
