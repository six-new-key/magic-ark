<!--
 * new page
 * @author: sixkey
 * @since: 2025-03-27
 * LayoutSider.vue
-->
<template>
  <a-layout-sider
    breakpoint="lg"
    collapsed-width="64"
    v-model:collapsed="collapsed"
    :width="235"
    :theme="theme"
    :style="{
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      borderTopRightRadius: '1.25rem',
      borderBottomRightRadius: '1.25rem',
    }"
  >
    <div class="sider_container">
      <!-- 侧边栏顶部 -->
      <div class="sider_header">
        <div>
          <img
            v-if="!collapsed"
            src="../../assets/logo.svg"
            alt="logo"
            style="width: 8.75rem"
          />
          <img
            v-else
            src="../../assets/logo2.svg"
            alt="logo"
            style="width: 2.5rem"
          />
        </div>
        <div v-if="!collapsed" style="cursor: pointer" @click="handleChangeTheme">
          <img
            v-if="theme === 'dark'"
            src="../../assets/sun.svg"
            alt="logo"
            style="width: 1.625rem"
          />
          <img
            v-else
            src="../../assets/moon.svg"
            alt="logo"
            style="width: 1.625rem"
          />
        </div>
      </div>

      <!-- 侧边栏内容 -->
      <div class="sider_content">
        <div style="height: 300vh">我是内容</div>
      </div>

      <!-- 侧边栏底部 -->
      <div
        class="sider_footer"
        :style="{
          backgroundColor: theme === 'dark' ? '#002140' : '#fff',
          borderTop: theme === 'dark' ? 'none' : '#edecec solid 0.0625rem',
        }"
        @click="changeCollapsed"
      >
        <DoubleRightOutlined
          :style="{ color: theme === 'dark' ? '#fff' : '#000' }"
          v-if="collapsed"
        />
        <DoubleLeftOutlined
          :style="{ color: theme === 'dark' ? '#fff' : '#000' }"
          v-else
        />
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { ref } from "vue";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined
} from "@ant-design/icons-vue";

const emits = defineEmits(["updateCollapsed"]);
const collapsed = ref(false);
const changeTheme = ref(false);
const theme = ref("dark");

// 切换主题
const handleChangeTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};

// 切换折叠状态
const changeCollapsed = () => {
  collapsed.value = !collapsed.value;

  emits("updateCollapsed", collapsed.value);
};
</script>
<style scoped>
.sider_container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  color: #fff;
}
.sider_header {
  max-height: 50px;
  height: 50px;
  width: 100%;
  padding: 0.9375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sider_content {
  width: 100%;
  max-height: calc(100vh - 100px);
  overflow-y: scroll;
}
::-webkit-scrollbar {
  display: none;
}
.sider_footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: #002140;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>
