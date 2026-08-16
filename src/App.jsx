import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MockAuthProvider } from './auth/CurrentUserContext'
import RoleSwitcher from './auth/RoleSwitcher'
import HomePage from './pages/HomePage'
import ClassBoardPage from './pages/ClassBoardPage'

function App() {
  return (
    <MockAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/class/:classId" element={<ClassBoardPage />} />
        </Routes>
        <RoleSwitcher />
      </BrowserRouter>
    </MockAuthProvider>
  )
}

export default App
