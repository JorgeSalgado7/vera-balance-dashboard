import { BrowserRouter,Route, Routes } from 'react-router-dom'
import { Login } from '../features/auth/pages/Login'

export const PageRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  </BrowserRouter>
)
