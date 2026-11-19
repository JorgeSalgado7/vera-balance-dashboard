import { App, ConfigProvider } from 'antd'
import type { AntDesignProviderI } from './interfaces/ant-design-provider.interface'
import { antTheme } from '../theme/ant-theme'

export const AntDesignProvider = ({ children }: AntDesignProviderI) => (
  <ConfigProvider theme={antTheme}>
    <App>{children}</App>
  </ConfigProvider>
)
