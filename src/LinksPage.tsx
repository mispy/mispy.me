import * as React from 'react'
import {observer} from 'mobx-react'
import {Metas} from './Metas'

const linksText = `



LEARNING TOOLS

http://sci-hub.tw/ - Guerilla open access to scientific research. Bypasses paywalls.

http://libgen.io/ - Guerilla open access repository of knowledge. Basically Sci-Hub for books.

http://custodians.online/ - A quick summary of why sites like Sci-Hub and Libgen exist and the challenges they face

https://calibre-ebook.com/ - Converts ebook files for compatibility with Kindles

https://www.khanacademy.org/ - Free interactive educational material, mainly targeted towards high school level

LIFE & MENTAL HEALTH

https://80000hours.org/ - Research on what makes a fulfilling job. Main conclusion is that salary is important but only up to a certain point, after which doing work that helps others matters a lot.

https://woebot.io/ - Chatbot app that teaches you CBT and mindfulness techniques. You check in with your mood each day and it encourages you to reflect on why you feel as you do.

https://ourworldindata.org/mental-health - A global overview of how prevalent mental health conditions are and the risk factors involved. Useful perspective for how individual struggles fit into the big picture.


CODING - TOOLS

https://code.visualstudio.com/ - My main IDE and the most popular code editor among JavaScript developers as of 2018. Excellent autocompletion, especially with TypeScript.

http://www.typescriptlang.org/ - My favorite web development language. The types give you full object property autocompletion and make it easier to reason about code, especially as the complexity of a project increases.

https://unity3d.com/ - Popular game engine mainly based on C#. A neat thing about the predominance of Unity is that many games can now be easily decompiled from the .NET assembly to read their source.

https://www.jetbrains.com/decompiler/ - .NET decompiler. The C# output it produces is easily readable in most cases.


CODING - META

https://adventofcode.com/ - A series of daily programming puzzles that run from the start of December until Christmas each year. I did all 25 days in 2018 with a friend and had a great time. If done as a speed contest, encourages you to learn a lot of fast coding tricks.

https://stateofjs.com/ - Survey data on the tools that JavaScript devs are using each year. Useful to get a picture of what new stuff might be worth trying out.

https://stackoverflow.com/ - Everyone knows Stack Overflow, of course! Something I often forget is that you can answer your own questions on SO, so you can use it as a public searchable repository you dump knowledge into.

https://stackoverflow.com/jobs - Companies pay Stack Overflow so they can advertise jobs here. They're usually pretty high-quality positions.

https://jobs.github.com/positions - Companies pay GitHub so they can advertise jobs here. At least last time I did hiring, it was easier and cheaper to advertise on GitHub than it is on SO. 

https://www.research.net/ - Service for conducting user surveys, used by GitHub 

https://axdraft.com/en/home#how-it-works - Axdraft, tool for drafting legal documents


BULK DATA SOURCES

https://data.worldbank.org/ - Major source for research on global development. Hundreds of time series indicators by country. 

https://unstats.un.org - UN data covering various topics including population growth, SDG indicators, gender equality

http://www.fao.org/faostat/en/#home - Food and agriculture data by country going back to 1961

https://www.bls.gov - US Bureau of Labor Statistics

SPECIFIC RESEARCH

https://www.autodeskresearch.com/publications/samestats - Shows how data visualization can reveal trends that summary statistics totally miss, by generating very different datasets with identical statistical properties

http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.368.8509&rep=rep1&type=pdf - Self-discipline outdoes IQ in predicting academic performance of adolescents

https://www.apa.org/practice/guidelines/transgender.pdf - The APA guidelines on best practice psychology for working with transgender and gender nonconforming people. Useful reference for discussions with people who respect scientific inquiry but aren't as familiar with LGBT issues.

BOOKS

https://blog.ncase.me/the-most-meaningful-books-i-read-in-2018/ - Nicky Case makes a list of the most meaningful books they read each year

https://patrickcollison.com/bookshelf - Patrick Collison's reading list

NICE WEB DESIGN

http://www.lateralmag.com/ - Online science magazine, makes good use of artistic illustrations

MISC

https://monzo.com/ - Modern online bank for UK residents, I know people with good experiences

`

function parseLinks(lines: string[]) {
    const groups = []

    let group = { title: "", desc: "", links: [] } as any

    for (const line of lines) {
        if (line.match(/^([A-Z]|[ &-])+$/)) {
            if (group.links.length) {
                groups.push(group)
                group = { title: "", desc: "", links: [] }
            }
            group.title = line
        } else if (line.match(/http/)) {
            const [href, desc] = line.split(" - ")
            group.links.push({ href: href, desc: desc })
        } else {
            group.desc = line
        }    
    }

    groups.push(group)

    return groups
}

@observer
export class LinksPage extends React.Component {
	render() {
        const linkGroups = parseLinks(linksText.split("\n").filter(l => l.trim().length).map(l => l.trim()))

        return <main className="LinksPage">
            <Metas title="Links" description="A collection of useful resources, particularly for programming, learning, and mental health." path="/links"/>
            <article>
                <div>
                    <h1>Links</h1>
                    <a href="/">Mispy</a>
                </div>
                {linkGroups.map(g => <section>
                    <h2>{g.title}</h2>
                    {g.desc && <p>{g.desc}</p>}
                    <ul>
                        {g.links.map((l: any) => <li><a href={l.href}>{l.href.replace(/https?:\/\//, '').replace(/\/$/, '').replace('www.', '')}</a> - {l.desc}</li>)}
                    </ul>
                </section>)}
            </article>
        </main>
	}
}
