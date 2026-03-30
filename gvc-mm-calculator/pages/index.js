import dynamic from 'next/dynamic'
import Head from 'next/head'
const MMCalculator = dynamic(() => import('../components/MMCalculator'), { ssr: false })
export default function Home() {
  return (
    <>
      <Head>
        <title>GVC 월간 리소스 산정 도구</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MMCalculator />
    </>
  )
}
