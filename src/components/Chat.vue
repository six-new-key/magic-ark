<template>
  <div class="container">
    <Conversations
      :items="itemList"
      defaultActiveKey="item1"
    />
    <Bubble content="Hello AI" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Bubble ,Conversations} from "ant-design-x-vue";

const items = Array.from({ length: 4 }).map((_, index) => ({
  key: `item${index + 1}`,
  label: `Conversation Item ${index + 1}`,
  disabled: index === 3,
}));

const itemList = ref(items)
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
}
</style>
