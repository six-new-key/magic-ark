<template>
  <a-layout has-sider>
    <LayoutSider @updateCollapsed="updateCollapsed" />
    <a-layout :style="{ marginLeft: collapsed ? '64px' : '235px' }">
      <LayoutHeader />
      <LayoutContent />
      <LayoutFooter />
    </a-layout>
  </a-layout>
</template>
<script setup>
import { ref } from "vue";
import LayoutSider from "./LayoutSider.vue";
import LayoutHeader from "./LayoutHeader.vue";
import LayoutContent from "./LayoutContent.vue";
import LayoutFooter from "./LayoutFooter.vue";

const collapsed = ref(false);

// 更新折叠状态的方法
const updateCollapsed = (val) => {
  console.log(val);
  collapsed.value = val;
};
</script>
