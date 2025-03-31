<!--
 * new page
 * @author: sixkey
 * @since: 2025-03-27
 * LayoutHeader.vue
-->
<template>
  <a-layout-content :style="{ marginLeft: '1rem' }">
    <div class="container">
      <!-- 内容 -->
      <div class="chat_container">
        <div class="chat_content">
          <Bubble
            v-for="(message, index) in messages"
            :key="index"
            :loading="message.loading ? true : false"
            :variant="message.role === 'user' ? 'filled' : 'outlined'"
            :placement="message.role === 'user' ? 'end' : 'start'"
            shape="corner"
            :style="{ marginBottom: '1.25rem' }"
          >
            <template #avatar>
              <div v-if="message.role === 'ai'">
                <img src="../../assets/ai.svg" style="width: 2.25rem;height: 2.25rem;" />
              </div>
              <div v-else>
                <a-avatar>
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
              </div>
            </template>
            <template #message>
              <div
                v-html="
                  index === messages.length - 1 && isStreaming
                    ? currentStreamContent
                    : renderedContent(message.content)
                "
              ></div>
            </template>
          </Bubble>
        </div>
      </div>

      <!-- 消息发送框 -->
      <div
        class="send_msg_container"
        :style="{
          marginLeft: collapsed ? '5rem' : '15.625rem',
          width: collapsed ? 'calc(100% - 6.25rem)' : 'calc(100% - 16.875rem)',
        }"
      >
        <Sender
          :onSubmit="sendMessage"
          style="width: 62%; border-radius: 1.625rem"
          v-model:value="inputValue"
        />
      </div>

      <!-- 右侧消息通知 -->
      <div class="msg_info_container">消息内容</div>
    </div>
  </a-layout-content>
</template>

<script setup>
import { ref, onUnmounted, nextTick, h } from "vue";
import { Bubble, Sender } from "ant-design-x-vue";
import { message } from 'ant-design-vue';
import { UserOutlined } from "@ant-design/icons-vue";
import markdownit from "markdown-it";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { formatMarkdownSpacing } from "../../utils/customMarkdownParser.js";

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});
// 配置marked选项
const marked = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    console.log(str, lang);

    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre><code class="hljs">' +
      marked.utils.escapeHtml(str) +
      "</code></pre>"
    );
  },
});

// 状态管理
const messages = ref([
  {
    role: "ai",
    content: "你好！我是AI助手，很高兴为您服务。您可以问我任何问题。",
  },
]);
const isStreaming = ref(false);
const currentStreamContent = ref("");
const scrollbarRef = ref(null);
let eventSource = null;
// 发送消息的输入框值
const inputValue = ref("");

// 处理markdown渲染
const renderedContent = (content) => {
  if (!content) return "";
  try {
    // 使用自定义的markdown解析器进行转换，然后使用marked渲染为HTML
    const parserMarkdown = formatMarkdownSpacing(content);
    const rawHtml = marked.render(parserMarkdown);
    // 使用DOMPurify进行HTML净化，防止XSS攻击
    return DOMPurify.sanitize(rawHtml);
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return content;
  }
};

// 处理消息发送
const sendMessage = async () => {
  if (!inputValue.value.trim()) return;
  const userMessage = inputValue.value.trim();
  messages.value.push(
    { role: "user", content: userMessage },
    { role: "ai", content: "", loading: true }
  );

  inputValue.value = "";
  isStreaming.value = true;
  currentStreamContent.value = "";

  try {
    if (eventSource) {
      eventSource.close(); // 关闭旧连接
    }

    const apiUrl = new URL("http://localhost:8081/chat/ai/stream");
    apiUrl.searchParams.append("message", userMessage);
    eventSource = new EventSource(apiUrl);

    let buffer = "";

    // 1. 监听普通消息事件
    eventSource.onmessage = (event) => {
      try {
        messages.value[messages.value.length - 1].loading = false;
        buffer += event.data; // 直接拼接数据
        currentStreamContent.value = buffer;
        // scrollToBottom(); // 可选：实时滚动到底部
      } catch (error) {
        console.error("SSE处理错误:", error);
        message.error("消息解析失败");
      }
    };

    // 2. 监听自定义错误事件
    eventSource.addEventListener("error", (event) => {
      const errorMsg = event.data || "未知错误";
      message.error(`错误: ${errorMsg}`);
      closeAndReset();
    });

    // 3. 监听完成事件
    eventSource.addEventListener("complete", () => {
      console.log("SSE Complete");
      closeAndReset();
      messages.value[messages.value.length - 1].content = buffer;
    });

    // 4. 处理连接错误（如网络问题）
    eventSource.onerror = () => {
      message.error("连接异常，请重试");
      closeAndReset();
    };
  } catch (error) {
    console.error("Send message error:", error);
    message.error("连接失败");
    closeAndReset();
  }
};

// 统一关闭连接和重置状态
const closeAndReset = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  isStreaming.value = false;
  messages.value[messages.value.length - 1].loading = false;
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
.container {
  position: relative;
  padding-top: 1.5rem;
  padding-bottom: 6.25rem;
  background-color: #fff;
}

.chat_container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.chat_content {
  width: 60%;
  /* background-color: yellow; */
}

.send_msg_container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  background-color: #fff;
  padding-bottom: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.msg_info_container {
  position: fixed;
  top: 0;
  right: 0;
  width: 16%;
  max-width: 16%;
  height: 2.875rem;
  background-color: yellowgreen;
}
</style>
