<script setup lang="ts">
defineProps<{
  conversations: { id: number; title: string; date: string }[]
}>()

const emit = defineEmits<{
  (e: 'new-chat'): void
  (e: 'select-chat', id: number): void
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="emit('new-chat')">
        <span class="plus-icon">+</span> 新建对话
      </button>
    </div>
    <div class="sidebar-content">
      <div class="conversations-group">
        <h3 class="group-title">最近</h3>
        <div
          v-for="chat in conversations"
          :key="chat.id"
          class="conversation-item"
          :class="{ active: chat.id === 1 }"
          @click="emit('select-chat', chat.id)"
        >
          <span class="chat-icon">💬</span>
          <span class="chat-title">{{ chat.title }}</span>
        </div>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar-small">师</div>
        <span class="username">老师(我)</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1rem;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #0d9488;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
}

.new-chat-btn:hover {
  background: #fff;
  border-color: #0d9488;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(13, 148, 136, 0.1);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1rem;
}

.group-title {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  margin: 1.5rem 0 0.5rem 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.conversation-item:hover {
  background: #e2e8f0;
  color: #334155;
}

.conversation-item.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-weight: 500;
  color: #0d9488;
}

.chat-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f1f5f9;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #f1f5f9;
}

.avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2dd4bf, #0d9488);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.2);
}

.username {
  font-weight: 600;
  color: #334155;
}
</style>
