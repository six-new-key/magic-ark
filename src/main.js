import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Antd from 'ant-design-vue';
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(ElementPlus)
app.use(Antd)
app.mount('#app')