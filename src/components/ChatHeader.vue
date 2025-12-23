<template>
  <header class="chat-header">
    <div class="header-left">
      <div class="brand-mark">
        <span>学</span>
      </div>
      <div>
        <p class="title">AI 课堂互动</p>
        <p class="subtitle">我是学生，你是老师</p>
      </div>
    </div>
    <div class="header-right">
      <span class="status-dot"></span>
      <span class="status-text">正在听讲</span>
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 4px solid #8b4513; /* Wood trim */
  background: #1e3a2f; /* Blackboard Green */
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-mark {
  height: 48px;
  width: 48px;
  border-radius: 4px;
  background: #fff;
  display: grid;
  place-items: center;
  color: #1e3a2f;
  font-weight: 800;
  letter-spacing: 0.05em;
  font-size: 1.4rem;
  font-family: 'Courier New', Courier, monospace;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: rotate(-3deg);
}

.title {
  font-weight: 700;
  margin: 0;
  font-size: 1.4rem;
  color: #fff; /* Chalk white */
  font-family: 'Noteworthy', 'Comic Sans MS', sans-serif;
  letter-spacing: 0.02em;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
}

.subtitle {
  margin: 0.2rem 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-family: 'Courier New', Courier, monospace;
}

.header-right {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(74, 222, 128, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
