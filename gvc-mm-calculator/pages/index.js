import dynamic from 'next/dynamic'
import Head from 'next/head'

// dynamic import to avoid SSR issues with browser APIs (window.innerWidth etc.)
const MMCalculator = dynamic(() => import('../components/MMCalculator'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>GVC 월간 리소스 산정 도구</title>
        <meta name="description" content="GVC Man-Month 리소스 산정 워크플로우" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MMCalculator />
    </>
  )
}
