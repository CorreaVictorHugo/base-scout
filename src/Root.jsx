import { Suspense, lazy } from 'react'

const Demo = lazy(() => import('./Demo.jsx'))
const App = lazy(() => import('./App.jsx'))

export default function Root() {
  const demonstracao = new URLSearchParams(window.location.search).get('demo') === '1'

  return (
    <Suspense fallback={<main className="app app-login">Carregando Base Scout...</main>}>
      {demonstracao ? <Demo /> : <App />}
    </Suspense>
  )
}
