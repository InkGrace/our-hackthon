<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  conversations: { id: number; title: string; date: string }[]
}>()

const emit = defineEmits<{
  (e: 'new-chat'): void
  (e: 'select-chat', id: number): void
}>()

const isCollapsed = ref(true)
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="emit('new-chat')" :title="isCollapsed ? '新建对话' : ''">
        <span class="plus-icon">+</span>
        <span v-if="!isCollapsed">新建对话</span>
      </button>
    </div>

    <div class="sidebar-content">
      <div class="conversations-group">
        <h3 class="group-title" v-if="!isCollapsed">最近</h3>
        <div class="divider" v-else></div>

        <div
          v-for="chat in conversations"
          :key="chat.id"
          class="conversation-item"
          :class="{ active: chat.id === 1 }"
          @click="emit('select-chat', chat.id)"
          :title="isCollapsed ? chat.title : ''"
        >
          <span class="chat-icon">💬</span>
          <span class="chat-title" v-if="!isCollapsed">{{ chat.title }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-profile" :title="isCollapsed ? '老师(我)' : ''">
        <div class="avatar-small">师</div>
        <span class="username" v-if="!isCollapsed">老师(我)</span>
      </div>

      <button
        class="collapse-btn"
        @click="isCollapsed = !isCollapsed"
        :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <span>{{ isCollapsed ? '→' : '←' }}</span>
      </button>
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 1rem;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.8rem 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #0d9488;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.sidebar:not(.collapsed) .new-chat-btn {
  justify-content: flex-start;
  padding: 0.8rem 1rem;
}

.new-chat-btn:hover {
  background: #fff;
  border-color: #0d9488;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(13, 148, 136, 0.1);
}

.plus-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 1rem;
}

.sidebar.collapsed .sidebar-content {
  padding: 0.5rem 0.75rem;
}

.group-title {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  margin: 1.5rem 0 0.5rem 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.divider {
  height: 1px;
  background: #cbd5e1;
  margin: 1.5rem 0.5rem 0.5rem;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.sidebar:not(.collapsed) .conversation-item {
  justify-content: flex-start;
  padding: 0.75rem 1rem;
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
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  overflow: hidden;
}

.sidebar:not(.collapsed) .user-profile {
  justify-content: flex-start;
  padding: 0.75rem;
}

.user-profile:hover {
  background: #e2e8f0;
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
  flex-shrink: 0;
}

.username {
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

.collapse-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  align-self: flex-end;
}

.sidebar.collapsed .collapse-btn {
  align-self: center;
}

.collapse-btn:hover {
  background: #e2e8f0;
  color: #64748b;
}

/* Hide scrollbar for cleaner look in collapsed mode */
.sidebar.collapsed .sidebar-content::-webkit-scrollbar {
  display: none;
}
</style>
