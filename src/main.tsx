import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
// 先初始化全局请求客户端，保证 services 中使用的 request 已被配置
import '@/app/global'
import '@/styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
