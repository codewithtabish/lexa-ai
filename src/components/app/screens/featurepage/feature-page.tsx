import React from 'react'
import FeaturesTopHeader from './features-top-header'
import { FeatureGrid } from './feature-grid'
import { HowItWorks } from './how-it-works'
import { WhyLexa } from './why-lexa'
import { GalleryPreview } from './gallery-preview'
import { ContactCta } from '../about/contact-cta'

const FeaturePage = () => {
  return (
    <>
    <FeaturesTopHeader/>
    <FeatureGrid/>
    <HowItWorks/>
    <WhyLexa/>
    <GalleryPreview/>
    <ContactCta/>
    
      
    </>
  )
}

export default FeaturePage
