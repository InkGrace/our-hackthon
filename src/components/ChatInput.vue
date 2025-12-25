<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
}>()

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustHeight = () => {
  if (textareaRef.value) {
    // 先重置高度为 auto，以便准确计算 scrollHeight
    textareaRef.value.style.height = 'auto'
    // 强制重排以获取准确的 scrollHeight
    const scrollHeight = textareaRef.value.scrollHeight
    // 设置最小高度和最大高度
    const minHeight = 60
    const maxHeight = 300
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    textareaRef.value.style.height = `${newHeight}px`
    // 如果内容超过最大高度，显示滚动条
    textareaRef.value.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
  }
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  adjustHeight()
}

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    emit('send')
  }
}

// 监听 modelValue 变化，确保外部更新时也能调整高度
watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      adjustHeight()
    })
  },
)

onMounted(() => {
  nextTick(() => {
    adjustHeight()
  })
})
</script>

<template>
  <footer class="composer">
    <div class="input-wrapper">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        placeholder="清晰地解释这个概念..."
        @keydown.enter.prevent="handleEnter"
        @input="handleInput"
      ></textarea>
      <button class="send" @click="$emit('send')" :disabled="!modelValue || disabled">
        教教 AI
      </button>
    </div>
  </footer>
</template>

<style scoped>
.composer {
  padding: 1.5rem 2rem 2.5rem;
  position: relative;
  background: transparent;
  border-top: none;
  display: flex;
  justify-content: center;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px; /* Classic notepad */
  padding: 1rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.025);
  width: 100%;
  max-width: 800px; /* Focused width */
  transition: all 0.2s;
  position: relative;
}

/* Spiral binding visual top */
.input-wrapper::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 20px;
  right: 20px;
  height: 12px;
  background-image: linear-gradient(to right, #9ca3af 20%, transparent 20%);
  background-size: 20px 100%;
  opacity: 0.5;
}

.input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

textarea {
  flex: 1;
  border: none;
  resize: none;
  outline: none;
  font-size: 1.05rem;
  font-family: 'Georgia', serif;
  color: #1f2937;
  background: transparent;
  line-height: 1.6;
  padding: 0;
  min-height: 60px;
  max-height: 300px;
  overflow-y: auto;
  /* Lined paper helper */
  background-image: linear-gradient(#f3f4f6 1px, transparent 1px);
  background-size: 100% 2rem;
  background-attachment: local;
  line-height: 2rem;
  transition: height 0.2s ease;
}

.send {
  align-self: flex-end;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  background: #10b981; /* Growth Green */
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-family: sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.send::before {
  content: '🧑‍🏫';
  font-size: 1.1rem;
}

.send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #d1d5db;
}

.send:not(:disabled):hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}
</style>
