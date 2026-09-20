import React from 'react'
import HowItWorksHeader from './how-it-works-header'
import HowItWorksSteps from './how-it-works-steps'
import { ContactCta } from '../about/contact-cta'

const HowItWorkPage = () => {
  return (
    <main>
        <HowItWorksHeader/>
        <HowItWorksSteps/>
        <ContactCta/>
      
    </main>
  )
}

export default HowItWorkPage
