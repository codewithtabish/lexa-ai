import React from 'react'
import AboutTopHeader from './about-top-header'
import { OurStory } from './our-story'
import { ByTheNumbers } from './by-the-numbers'
import { OurValues } from './our-values'
import { PublishedBy } from './published-by'
import { TechStack } from './tech-stack'
import { Roadmap } from './roadmap'
import { ContactCta } from './contact-cta'

const AboutPage = () => {
  return (
    <main>
        <AboutTopHeader/>
        <OurStory/>
        <ByTheNumbers/>
        <OurValues/>
        <PublishedBy/>
        <TechStack/>
        <Roadmap/>
        <ContactCta/>
      
    </main>
  )
}

export default AboutPage
