import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import 'antd/dist/reset.css'
import './ui/scss/main.scss'
import { AntDesignProvider } from './ui/providers/AntDesignProvider'
import { PageRouter } from './routes/PageRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AntDesignProvider>
        <PageRouter />
      </AntDesignProvider>
    </Provider>
  </StrictMode>,
)
