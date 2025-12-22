<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
}>()

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!props.modelValue.trim() || props.disabled) return
    emit('send')
  }
}

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <footer class="composer">
    <div class="input-wrapper">
      <textarea
        :value="modelValue"
        rows="3"
        placeholder="给 AI 学员讲解知识或布置任务..."
        @keydown="handleKeydown"
        @input="onInput"
      ></textarea>
      <button
        class="send"
        type="button"
        :disabled="!modelValue.trim() || disabled"
        @click="emit('send')"
      >
        发送
      </button>
    </div>
  </footer>
</template>

<style scoped>
.composer {
  padding: 1rem 2rem 2rem;
  position: sticky;
  bottom: 0;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #99f6e4;
  box-shadow: 0 10px 40px -5px rgba(13, 148, 136, 0.15);
}

textarea {
  flex: 1;
  border: none;
  resize: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
  color: #0f172a;
  background: transparent;
  line-height: 1.5;
}

.send {
  align-self: flex-end;
  border: none;
  border-radius: 14px;
  padding: 0.6rem 1.4rem;
  background: linear-gradient(135deg, #2dd4bf, #0d9488);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    opacity 0.12s ease;
  font-size: 0.95rem;
}

.send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #cbd5e1;
}

.send:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(13, 148, 136, 0.3);
}

@media (max-width: 780px) {
  .composer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
