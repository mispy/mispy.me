import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import {Helmet, HelmetData} from 'react-helmet'
import Homepage from './Homepage'
import Post from './Post'

declare var require: any
const faviconImg = require('./favicon.png')
const sunflowerImg = require('./sunflower.png')

class Body extends React.Component<{path: string, assets: {[key: string]: string}}> {
    content() {
        const {path} = this.props

        if (path == "/") {
            return <Homepage assets={this.props.assets}/>
        } else {
            return <Post slug={path.replace('/', '')} assets={this.props.assets}/>
        }           
    }

    render() {
        return <body>
            <Helmet title="Jaiden Mispy"/>
            <div id="app">  
                {this.content()}
            </div>
        </body>
    }
}

class Head extends React.Component<{path: string, assets: {[key: string]: string}, head: HelmetData}> {
    render() {
        const {head, assets, path} = this.props

        const description = `Since 2016 I've been working with some awesome researchers at the University of Oxford on Our World in Data. We're building a big collection of open knowledge, covering topics like global poverty, healthcare financing and climate change.`

        const title = head.title.toComponent()

        return <head>
            {head.title.toComponent()}
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="description" content={description}/>
            <meta name="twitter:title" content={title.toString()}/>
            <meta name="twitter:url" content={"https://mispy.me" + path}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:image" content={"https://mispy.me/" + sunflowerImg}/>
            <meta name="twitter:card" content="summary_large_image"/>

            <meta property="og:locale" content="en_US"/>
            <meta property="og:site_name" content="Jaiden Mispy"/>
            <meta property="og:title" content="Jaiden Mispy"/>
            <meta property="og:url" content={"https://mispy.me" + path}/>
            <meta property="og:description" content={description}/>
            <meta property="og:image" content={"https://mispy.me/" + sunflowerImg}/>
            {head.meta.toComponent()}
            <link rel="stylesheet" type="text/css" href={assets['build.css']}/>  
            <link rel="icon" href={faviconImg}/>         
            {head.link.toComponent()}
        </head>
    }
}

export default (locals: any, callback: (val: null, html: string) => void) => {
    const assets = locals.assets as {[name: string]: string}
    for (const key in assets) {
        assets[key+'.js'] = assets[key]
        assets[key+'.css'] = assets[key].replace(/.js$/, '.css')
    }

    const bodyStr = ReactDOMServer.renderToString(<Body path={locals.path} assets={assets}/>)
    const head = Helmet.renderStatic()
    const headStr = ReactDOMServer.renderToString(<Head path={locals.path} head={head} assets={assets}/>)

    callback(null, "<html>"+headStr+bodyStr+"</html>")
};