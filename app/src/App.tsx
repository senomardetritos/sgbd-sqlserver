import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './components/Header/Header'
import LeftMenu from './components/LeftMenu/LeftMenu'

function App() {

  return (
    <>
      <div className='page'>
        <aside className='page-left'>
          <LeftMenu />
        </aside>
        <main className='page-main'>
          <Header />
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default App
