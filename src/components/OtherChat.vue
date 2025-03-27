<template>
    <div class="chat-container">
      <el-scrollbar ref="scrollbarRef" class="chat-messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="message.role"
        >
          <el-avatar :size="40" class="message-avatar">
            {{ message.role === "user" ? "" : "" }}
          </el-avatar>
          <el-card class="message-card" :body-style="{ padding: '12px' }">
            <div v-if="message.role === 'user'" class="markdown-content">
              {{ message.content }}
            </div>
            <div
              v-else
              class="markdown-content"
              v-html="
                message.role === 'assistant' &&
                index === messages.length - 1 &&
                isStreaming
                  ? currentStreamContent
                  : renderedContent(message.content)
              "
            ></div>
          </el-card>
        </div>
      </el-scrollbar>
  
      <div class="chat-input">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          :placeholder="isStreaming ? '等待AI响应中...' : '输入您的问题...'"
          resize="none"
          @keydown.enter.prevent="handleEnter"
          :disabled="isStreaming"
        />
        <el-button
          type="primary"
          :loading="isStreaming"
          @click="sendMessage"
          class="send-button"
          :icon="isStreaming ? CircleClose : Position"
          :disabled="!userInput.trim() || isStreaming"
        >
          {{ isStreaming ? "响应中" : "发送" }}
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, nextTick } from "vue";
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import hljs from "highlight.js";
  import "highlight.js/styles/foundation.css";
  import { ElMessage } from "element-plus";
  import { Position, CircleClose } from "@element-plus/icons-vue";
  
  // 状态管理
  const messages = ref([
    {
      role: "assistant",
      content: "你好！我是AI助手，很高兴为您服务。您可以问我任何问题。",
    },
  ]);
  const userInput = ref("");
  const isStreaming = ref(false);
  const currentStreamContent = ref("");
  const scrollbarRef = ref(null);
  let eventSource = null;
  
  // 配置marked选项
  marked.setOptions({
    gfm: false, // 启动类似于Github样式的Markdown语法
  
    // 高亮的语法规范
    highlight: (code, lang) => hljs.highlight(code, { language: lang }).value,
  });
  
  // 处理markdown渲染
  const renderedContent = (content) => {
    if (!content) return "";
    try {
      const rawHtml = marked(content);
      return DOMPurify.sanitize(rawHtml);
    } catch (error) {
      console.error("Markdown rendering error:", error);
      return content;
    }
  };
  
  // 处理消息发送
  const sendMessage = async () => {
    if (!userInput.value.trim() || isStreaming.value) return;
  
    const userMessage = userInput.value.trim();
    messages.value.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: "" }
    );
  
    userInput.value = "";
    await scrollToBottom();
  
    isStreaming.value = true;
    currentStreamContent.value = "";
  
    try {
      if (eventSource) {
        eventSource.close();
      }
  
      const apiUrl = new URL("http://localhost:8081/chat/ai/stream");
      apiUrl.searchParams.append("message", userMessage);
  
      eventSource = new EventSource(apiUrl);
  
      let buffer = "";
  
      eventSource.onmessage = (event) => {
        try {
          const rawData = event.data.replace(/^data: /gm, "");
          const filteredData = rawData
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .join("\n");
  
          buffer += filteredData;
          currentStreamContent.value = buffer;
          scrollToBottom();
        } catch (error) {
          console.error("SSE处理错误:", error);
          ElMessage.error("消息解析失败");
        }
      };
  
      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        ElMessage.error("连接错误，请重试");
        isStreaming.value = false;
        eventSource.close();
        messages.value[messages.value.length - 1].content = buffer;
      };
  
      eventSource.addEventListener("complete", () => {
        isStreaming.value = false;
        eventSource.close();
        messages.value[messages.value.length - 1].content = buffer;
      });
    } catch (error) {
      console.error("Send message error:", error);
      ElMessage.error("连接失败");
      isStreaming.value = false;
    }
  };
  
  // 处理回车发送
  const handleEnter = (e) => {
    if (e.shiftKey) return;
    sendMessage();
  };
  
  // 自动滚动到底部
  const scrollToBottom = async () => {
    await nextTick();
    if (scrollbarRef.value) {
      scrollbarRef.value.setScrollTop(scrollbarRef.value.wrapRef.scrollHeight);
    }
  };
  
  // 组件卸载时清理SSE连接
  onUnmounted(() => {
    if (eventSource) {
      eventSource.close();
    }
  });
  </script>
  
  <style scoped>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
    gap: 20px;
  }
  
  .chat-messages {
    flex: 1;
    padding: 20px;
    background: var(--el-bg-color-page);
    border-radius: 8px;
    height: calc(100vh - 180px);
  }
  
  .message {
    display: flex;
    margin-bottom: 20px;
    gap: 12px;
    align-items: flex-start;
  }
  
  .message-card {
    flex: 1;
    max-width: 88%;
    box-shadow: var(--el-box-shadow-lighter);
  }
  
  .message.user .message-card {
    background: var(--el-color-primary-light-9);
  }
  
  .chat-input {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 0 20px;
  }
  
  .chat-input :deep(.el-textarea__inner) {
    min-height: 60px !important;
    resize: none;
  }
  
  .send-button {
    height: 60px;
    padding: 0 24px;
  }
  
  .markdown-content {
    line-height: 1.6;
  }
  
  .markdown-content :deep(pre) {
    background: var(--el-fill-color-light);
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
  }
  
  .markdown-content :deep(code) {
    font-family: var(--el-font-family-monospace);
    padding: 2px 4px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  .markdown-content :deep(p) {
    margin: 8px 0;
  }
  
  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    padding-left: 20px;
    margin: 8px 0;
  }
  
  .markdown-content :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
  }
  
  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    border: 1px solid var(--el-border-color);
    padding: 8px;
    text-align: left;
  }
  
  .markdown-content :deep(th) {
    background-color: var(--el-fill-color-light);
  }
  
  .markdown-content :deep(blockquote) {
    margin: 8px 0;
    padding: 0 16px;
    color: var(--el-text-color-regular);
    border-left: 4px solid var(--el-border-color);
  }
  
  .markdown-content :deep(img) {
    max-width: 100%;
    height: auto;
  }
  
  .markdown-content :deep(hr) {
    border: none;
    border-top: 1px solid var(--el-border-color);
    margin: 16px 0;
  }
  
  .message-card {
    transition: all 0.3s ease;
  }
  
  .markdown-content {
    will-change: contents;
  }
  </style>
  