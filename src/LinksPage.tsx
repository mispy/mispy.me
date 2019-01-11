import * as React from 'react'
import {observer} from 'mobx-react'
import {Metas} from './Metas'

const linksText = `



LEARNING TOOLS

http://sci-hub.tw/ - Guerilla open access to scientific research. Bypasses paywalls.

http://libgen.io/ - Guerilla open access repository of knowledge. Basically Sci-Hub for books.

http://custodians.online/ - A quick summary of why sites like Sci-Hub and Libgen exist and the challenges they face

https://calibre-ebook.com/ - Converts ebook files for compatibility with Kindles

https://apps.ankiweb.net/ - A tool for memorizing anything using spaced repetition of flashcards. Michael Nielsen writes about it in his essay on <a href="http://augmentingcognition.com/ltm.html">augmenting long-term memory</a>.

https://www.khanacademy.org/ - Free interactive educational material, mainly targeted towards high school level

https://ourworldindata.org/ - Data & research about long-term global change

https://www.core-econ.org/ - Open access economics textbook

https://explorabl.es/ - Collection of explorable explanations on various topics

http://www.gwern.net/ - Essays about many unusual research subjects

LIFE & MENTAL HEALTH

https://80000hours.org/ - Research on what makes a fulfilling job. Main conclusion is that salary is important but only up to a certain point, after which doing work that helps others matters a lot.

https://woebot.io/ - Chatbot app that teaches you CBT and mindfulness techniques. You check in with your mood each day and it encourages you to reflect on why you feel as you do.

https://ourworldindata.org/mental-health - A global overview of how prevalent mental health conditions are and the risk factors involved. Useful perspective for how individual struggles fit into the big picture.

PROGRAMMING

https://code.visualstudio.com/ - My main IDE and the most popular code editor among JavaScript developers as of 2018. Excellent autocompletion, especially with TypeScript.

https://www.typescriptlang.org/ - My favorite web development language. The types give you full object property autocompletion and make it easier to reason about code, especially as the complexity of a project increases.

https://www.netlify.com/ - Fantastic modern web host centered around static site building

https://jamstack.org - Summary of the JAMstack, my preferred way of doing web development

https://unity3d.com/ - Popular game engine mainly based on C#. A neat thing about the predominance of Unity is that many games can now be easily decompiled from the .NET assembly to read their source.

https://www.jetbrains.com/decompiler/ - .NET decompiler. The C# output it produces is easily readable in most cases.

https://adventofcode.com/ - Daily programming puzzles from the start of December until Christmas each year. I did all 25 days in 2018 with a friend and had a great time.

https://stateofjs.com/ - Survey data on the tools that JavaScript devs are using each year. Useful to get a picture of what new stuff might be worth trying out.

https://stackoverflow.com/ - Remember that you can answer your own questions on SO, so you can use it as a public searchable repository you dump knowledge into.

https://stackoverflow.com/jobs - Companies pay Stack Overflow so they can advertise jobs here. They're usually pretty high-quality positions.

https://jobs.github.com/positions - Companies pay GitHub so they can advertise jobs here. At least last time I did hiring, it was easier and cheaper to advertise on GitHub than it is on SO. 

https://www.research.net/ - Service for conducting user surveys, used by GitHub 

https://axdraft.com - Tool for drafting legal documents

DATA VISUALIZATION

https://www.autodeskresearch.com/publications/samestats - Shows how data visualization can reveal trends that summary statistics totally miss, by generating very different datasets with identical statistical properties

https://www.timeanddate.com/sun/uk/oxford - Sun graphs for different areas of the world

http://graphics.wsj.com/infectious-diseases-and-vaccines/ - Heatmaps showing dramatic falloff of infection rates after introduction of vaccines

BULK DATA SOURCES

https://data.worldbank.org/ - Major source for research on global development. Hundreds of time series indicators by country. 

https://unstats.un.org - UN data covering various topics including population growth, SDG indicators, gender equality

http://www.fao.org/faostat - Food and agriculture data by country going back to 1961

https://www.transitwiki.org/TransitWiki/index.php/Publicly-accessible_public_transportation_data - Index of public transportation data for cities around the world

https://www.bls.gov - US Bureau of Labor Statistics

SPECIFIC RESEARCH

https://www.gapminder.org/test - Gapminder's test for misconceptions about the world. It's remarkable how easy it is to not know this stuff!

http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.368.8509&rep=rep1&type=pdf - Self-discipline outdoes IQ in predicting academic performance of adolescents

https://www.apa.org/practice/guidelines/transgender.pdf - The APA guidelines on best practice psychology for working with transgender and gender nonconforming people. Useful reference for discussions with people who respect scientific inquiry but aren't as familiar with LGBT issues.

http://www.dartmouth.edu/~nyhan/nyhan-reifler.pdf - Attempts to correct political misconceptions by presenting contrary evidence in the wrong ways can backfire and make people even more resolute

http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.395.886&rep=rep1&type=pdf - People are more likely to believe statements if they are presented poetically

BOOKS

https://blog.ncase.me/the-most-meaningful-books-i-read-in-2018/ - Nicky Case makes a list of the most meaningful books they read each year

https://patrickcollison.com/bookshelf - Patrick Collison's reading list

https://www.gwern.net/Book-reviews - Gwern's super long list of book reviews

https://www.goodreads.com/user/show/81203600-jaiden-mispy - My Goodreads account

NICE WEB DESIGN

https://pudding.cool - Super fancy embedded datavis articles

https://distill.pub/ - A machine learning research journal that makes good use of interactives

http://www.lateralmag.com/ - Online science magazine, lots of artistic illustrations

https://seeing-theory.brown.edu - Beautiful online textbook about probability and statistics

https://www.wanikani.com/ - Adorable slightly animated landing page

http://nkwiatek.com/experiments/ascii - ASCII gas physics simulation

https://tea.fncombo.me/ - Lovely little filterable mobile-friendly personal tea collection app 

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
                        {g.links.map((l: any) => <li><a href={l.href}>{l.href.replace(/https?:\/\//, '').replace(/\/$/, '').replace('www.', '')}</a> - <span dangerouslySetInnerHTML={{__html: l.desc}}/></li>)}
                    </ul>
                </section>)}
            </article>
        </main>
	}
}
