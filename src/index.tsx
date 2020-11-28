import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import {Helmet, HelmetData} from 'react-helmet'
import Homepage from './Homepage'
import Post from './Post'
import { LinksPage } from './LinksPage'

declare var require: any
require("./index.scss")

class Body extends React.Component<{path: string, assets: {[key: string]: string}}> {
    content() {
        const {path} = this.props

        if (path === "/") {
            return <Homepage assets={this.props.assets}/>
        } else if (path === "/links.html") {
            return <LinksPage/>
        } else {
            return <Post slug={path.replace('/', '')} assets={this.props.assets}/>
        }           
    }

    render() {
        return <body>
            <Helmet title="Jaiden Mispy">
                <link rel="stylesheet" type="text/css" href={`/${this.props.assets['build.css']}`}/>  
            </Helmet>
            <div id="app">  
                {this.content()}
            </div>
            <script src="https://mispy.me/puzzle.js"/>
        </body>
    }
}

class Head extends React.Component<{head: HelmetData}> {
    render() {
        const {head} = this.props

        return <head>
            {head.title.toComponent()}
            {head.meta.toComponent()}
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
    const headStr = ReactDOMServer.renderToString(<Head head={head}/>)

    callback(null, "<html>"+headStr+bodyStr+"</html>")
};


declare const module: any
if (module.hot) {
    module.hot.accept()
}