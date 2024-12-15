import { useEffect } from 'react'
import WikiPage from './components/WikiPage'

function App() {
  useEffect(() => {
    // Add the theme class to the body when the app mounts
    document.body.classList.add('theme-light');
  }, []);

  return (
    <>
      <WikiPage />
    </>
  )
}

export default App
