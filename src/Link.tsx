import * as React from 'react'

export default class Link extends React.Component<any> {
    render() {
        return <a href={this.props.to} {...this.props}>{this.props.children}</a>
    }
}