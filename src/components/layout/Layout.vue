<template>
  <a-layout has-sider>
    <LayoutSider @updateCollapsed="updateCollapsed" />
    <a-layout
      :style="{
        marginLeft: collapsed ? '3.0625rem' : '13.75rem',
      }"
    >
      <!-- <LayoutHeader /> -->
      <LayoutContent :collapsed="collapsed" />
      <!-- <LayoutFooter /> -->
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
  collapsed.value = val;
};
</script>
