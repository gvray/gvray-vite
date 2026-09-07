import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from '@/router'
// 先初始化全局请求客户端，保证 services 中使用的 request 已被配置
import '@/global'
import '@/styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
