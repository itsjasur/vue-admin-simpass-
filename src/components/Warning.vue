<template>
  <div v-if="store.active" class="overlay">
    <div class="popup-content">
      <div class="title">{{ store.title }}</div>

      <div v-for="(message, index) in store.messages" :key="index" class="text">{{ message }}</div>

      <button @click="store.close()">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { useWarningStore } from '../stores/warning'

const store = useWarningStore()
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.552);
  z-index: 3000;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  box-sizing: border-box;
  max-width: 400px;
  width: 90%;
  min-height: 200px;
  display: flex;
  flex-flow: column;
  gap: 5px;

  align-items: center;
  justify-content: center;
  overflow-y: auto;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  align-self: flex-end;
  color: #333;
  font-size: 30px;
  cursor: pointer;
  padding: 5px;
  border-radius: 30px;
  background-color: #ffffff71;
}

.title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
}

.text {
  font-size: 16px;
  color: #535353;
  line-height: 1.5;
  white-space: pre-line;
}

button {
  margin-top: 20px;
  max-width: 100px;
}
</style>
