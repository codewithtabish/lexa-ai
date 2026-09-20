import React from 'react'
import HeroSection from './hero-section'
import { TransformationsSection } from './explore-transformation'
import { WhyLexaSection } from './why-lexa-section'
import { TestimonialsSection } from './testimonials-section'
import { PricingSection } from './pricing-section'
import { FaqSection } from './faq-section'
import { ContactCta } from '../about/contact-cta'

const MarketingPage = () => {
  return (
    <>
        <HeroSection/>
        <TransformationsSection/>
        <WhyLexaSection/>
        <TestimonialsSection/>
        
        <PricingSection/>
        <FaqSection/>
        {/* <ContactCta/> */}
      
    </>
  )
}

export default MarketingPage
