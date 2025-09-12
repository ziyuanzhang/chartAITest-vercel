<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
defineOptions({
  name: "Chat_second"
});
const chatBox = ref<HTMLDivElement>();
const inputBox = ref({
  val: "",
  disabled: false
});
const sendBtnDisabled = ref<boolean>(false);
let eventSource: EventSource | null = null;
let currentStreamId = null;
let currentAiMessageDiv: HTMLDivElement | undefined = undefined;

const addMessage = (role: string, text: string, isTyping = false) => {
  if (!chatBox.value) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}-message`;
  if (isTyping) {
    messageDiv.innerHTML = `${text}<span class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>`;
  } else {
    messageDiv.textContent = text;
  }
  chatBox.value.appendChild(messageDiv);
  chatBox.value.scrollTop = chatBox.value.scrollHeight;
  return messageDiv;
};
const addSystemMessage = (text: string) => {
  if (!chatBox.value) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = "message system-message";
  messageDiv.textContent = text;
  chatBox.value.appendChild(messageDiv);
  chatBox.value.scrollTop = chatBox.value.scrollHeight;
};
const sendMessage = async () => {
  if (!chatBox.value) return;
  const message = inputBox.value.val.trim();
  if (!message || eventSource) return;

  inputBox.value.val = "";
  inputBox.value.disabled = true;
  sendBtnDisabled.value = true;

  // 显示用户消息
  addMessage("user", message);

  try {
    // 1. 启动会话 (POST)
    const startResponse = await fetch("http://127.0.0.1:8000/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start session: ${startResponse.status}`);
    }

    const { stream_id } = await startResponse.json();
    currentStreamId = stream_id;

    // 显示AI正在输入的状态
    currentAiMessageDiv = addMessage("ai", "", true);

    // 2. 连接流式响应 (GET + EventSource)
    eventSource = new EventSource(
      `http://127.0.0.1:8000/api/chat/stream/${stream_id}`
    );

    eventSource.onmessage = function (event) {
      if (!chatBox.value) return;
      try {
        const data = JSON.parse(event.data);

        if (data.content && currentAiMessageDiv) {
          // 移除打字动画，显示实际内容
          if (currentAiMessageDiv.querySelector(".typing-indicator")) {
            currentAiMessageDiv.innerHTML = "";
          }
          currentAiMessageDiv.textContent += data.content;
          chatBox.value.scrollTop = chatBox.value.scrollHeight;
        }

        if (data.done) {
          closeConnection();
          addSystemMessage("对话完成");
        }

        if (data.error) {
          closeConnection();
          addSystemMessage(`错误: ${data.error}`);
        }
      } catch (e) {
        console.error("Error parsing SSE data:", e);
      }
    };

    eventSource.onerror = function (error) {
      console.error("EventSource error:", error);
      closeConnection();
      addSystemMessage("连接中断，请重试");
    };
  } catch (error) {
    console.error("Error:", error);
    closeConnection();
    addSystemMessage(`出错: ${error.message}`);
  }
};
const closeConnection = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  currentStreamId = null;
  inputBox.value.disabled = false;
  sendBtnDisabled.value = false;
};
// 支持回车发送
const handleKeypress = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

onMounted(() => {
  inputBox.value.disabled = false;
  sendBtnDisabled.value = false;
});
onUnmounted(() => {
  closeConnection();
});
</script>

<template>
  <div class="chat-container">
    <div class="chatBox" ref="chatBox">
      <div class="message system-message">
        欢迎使用AI聊天助手！请输入您的问题开始对话。
      </div>
    </div>

    <div class="input-area">
      <textarea
        placeholder="输入您的消息..."
        v-model="inputBox.val"
        :disabled="inputBox.disabled"
        class="inputBox"
        rows="5"
      />
      <button
        id="sendBtnDisabled"
        @click="sendMessage"
        @keypress="handleKeypress"
        :disabled="sendBtnDisabled"
      >
        发送
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-container {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  .chatBox {
    height: 400px;
    overflow-y: auto;
    padding: 20px;
    background: #f8f9fa;
    .message {
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 80%;
    }
    .user-message {
      background: #007bff;
      color: white;
      margin-left: auto;
      text-align: right;
    }
    .ai-message {
      background: white;
      border: 1px solid #e1e5e9;
    }
    .system-message {
      background: #fff3cd;
      color: #856404;
      text-align: center;
      font-size: 14px;
    }
  }
}

.input-area {
  display: flex;
  padding: 16px;
  background: white;
  border-top: 1px solid #e1e5e9;
  .inputBox {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-right: 12px;
  }
  button {
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

.typing-indicator {
  display: inline-block;
  margin-left: 4px;
}
.typing-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  background: #666;
  border-radius: 50%;
  margin: 0 1px;
  animation: typing 1.4s infinite;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}
</style>
