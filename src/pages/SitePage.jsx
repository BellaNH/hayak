import { useEffect, useMemo, useRef } from 'react'
import { getConfigBySlug } from '../lib/getConfig'
import { enrichConfig } from '../lib/restaurantAssets'
import { applyLocale } from '../lib/localizeConfig'
import { useLanguage } from '../lib/LanguageContext'
import { themeStyle } from '../lib/themeStyle'
import { handleAnchorClick } from '../lib/smoothScroll'
import { useRecordTour } from '../hooks/useRecordTour'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Hero from '../components/Hero'
import WhyChooseUs from '../components/WhyChooseUs'
import MenuSection from '../components/MenuSection'
import AboutSection from '../components/AboutSection'
import CategoriesShowcase from '../components/CategoriesShowcase'
import StatsBar from '../components/StatsBar'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'

const SLUG = 'hayak'

export default function SitePage() {
  const { lang, dir, setLang } = useLanguage()
  const pageRef = useRef(null)
  const rawConfig = getConfigBySlug(SLUG)
  useRecordTour(pageRef) // TEMP: remove after filming (+ delete useRecordTour.js)

  useEffect(() => {
    setLang(rawConfig?.defaultLanguage ?? 'fr')
  }, [rawConfig, setLang])

  const config = useMemo(() => {
    if (!rawConfig) return null
    const enriched = enrichConfig(rawConfig)
    return applyLocale(enriched, lang)
  }, [rawConfig, lang])

  useEffect(() => {
    if (config?.name) {
      document.title = config.name
    }
  }, [config?.name])

  if (!config) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl">Site unavailable</h1>
        <p className="mt-3 opacity-70">Hayak config could not be loaded.</p>
      </main>
    )
  }

  return (
    <div
      id="top"
      ref={pageRef}
      className={`minimalist-page ${dir === 'rtl' ? 'minimalist-page--rtl' : ''}`}
      data-slug={SLUG}
      style={themeStyle(config)}
      dir={dir}
      onClick={handleAnchorClick}
    >
      <Hero config={config} />
      <WhyChooseUs config={config} />
      <ExclusiveOffers config={config} />
      <MenuSection config={config} />
      <AboutSection config={config} />
      <CategoriesShowcase config={config} />
      <StatsBar config={config} />
      <Newsletter config={config} />
      <Footer config={config} />
    </div>
  )
}
