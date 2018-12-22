import * as React from 'react'
import Helmet from "react-helmet";
declare var require: any;
const faviconImg = require('./favicon.png')
const sunflowerImg = require('./sunflower.png')

export class Metas extends React.Component<{ path: string, title: string, description: string, children?: any }> {
    render() {
        const {path, title, description, children} = this.props

        return <Helmet>
            <title>{title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="description" content={description}/>
            <meta name="twitter:title" content={title}/>
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
            <link rel="icon" href={faviconImg}/>
            {children}
        </Helmet>
    }
}