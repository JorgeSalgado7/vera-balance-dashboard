import { App, ConfigProvider } from 'antd'
import type { PropsWithChildren } from 'react'
import { antTheme } from '../theme/ant-theme'

export const AntDesignProvider = ({ children }: PropsWithChildren) => (
  <ConfigProvider theme={antTheme}>
    <App>{children}</App>
  </ConfigProvider>
)
