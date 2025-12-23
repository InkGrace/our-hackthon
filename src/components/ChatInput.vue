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
  /* Glassy desk overlay */
  background: linear-gradient(to bottom, rgba(212, 212, 216, 0.4), rgba(212, 212, 216, 0.9));
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  background: #fff;
  border: 1px solid #d1d5db; /* Grey binding */
  border-radius: 4px; /* Notebook shape */
  padding: 1rem;
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.1),
    0 8px 0 -4px #e5e7eb,
    /* Stacked pages effect */ 0 8px 1px -4px rgba(0, 0, 0, 0.1),
    0 16px 0 -8px #e5e7eb,
    0 16px 1px -8px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
  transition: all 0.2s;
  position: relative;
}

/* Red margin line decoration */
.input-wrapper::before {
  content: '';
  position: absolute;
  left: 2rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #fca5a5; /* Light red margin */
  opacity: 0.5;
  pointer-events: none;
}

.input-wrapper:focus-within {
  border-color: #9ca3af;
  transform: translateY(-2px);
}

textarea {
  flex: 1;
  border: none;
  resize: none;
  outline: none;
  font-size: 1.1rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; /* Handwriting font */
  color: #1e3a8a; /* Blue Ink */
  background: transparent;
  line-height: 1.6;
  padding-left: 1.5rem; /* Space for margin line */
  background-image: linear-gradient(#f3f4f6 1px, transparent 1px);
  background-size: 100% 2rem;
  background-attachment: local;
}

.send {
  align-self: flex-end;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.4rem;
  background: #dc2626; /* Red Grading Pen */
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-family: sans-serif;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
}

.send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9ca3af;
  box-shadow: none;
}

.send:not(:disabled):hover {
  transform: translateY(-2px) rotate(1deg);
  background: #b91c1c;
  box-shadow: 0 4px 8px rgba(185, 28, 28, 0.4);
}

@media (max-width: 780px) {
  .composer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
