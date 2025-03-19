import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

console.log('正在初始化应用...')

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
  .mount('#app')

console.log('应用已挂载')

// 添加全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue全局错误:', err)
  console.error('发生错误的组件:', vm)
  console.error('错误信息:', info)
}
