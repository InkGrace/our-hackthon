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
  border-bottom: 1px solid #f1f5f9;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-mark {
  height: 48px;
  width: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2dd4bf, #0d9488);
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.03em;
  font-size: 1.2rem;
  box-shadow: 0 8px 16px rgba(13, 148, 136, 0.2);
}

.title {
  font-weight: 800;
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.header-right {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0d9488;
  font-weight: 600;
  background: #f0fdfa;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #14b8a6;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(20, 184, 166, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
  }
}
</style>
