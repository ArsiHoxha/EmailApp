import React from 'react'
import DarkHome from './components/DarkHome'
import Navbar from './components/Navbar'
import PriceTable from './components/PriceTable'
import FeaturesSection from './components/FeaturesSection'
import HowItWorks from './components/HowItWorks'
import Testiomonials from './components/Testiomonials'
import Footer from './components/Foters'

export default function Home() {
  return (
    <div>
      <DarkHome></DarkHome>
      <FeaturesSection></FeaturesSection>
      <HowItWorks></HowItWorks>
      <Testiomonials></Testiomonials>
      <PriceTable></PriceTable>
      <Footer></Footer>
    </div>
  )
}
