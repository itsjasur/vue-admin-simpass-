<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>아이구! 페이지를 찾을 수 없네요!</h2>
      <p>찾으시는 페이지가 존재하지 않거나 이동되었습니다.</p>
      <router-link to="/home" class="home-link">홈으로</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #343a40;
}

.not-found-content {
  max-width: 600px;
}

.not-found-content h1 {
  font-size: 80px;
  margin: 0;
}

.not-found-content h2 {
  font-size: 25px;
  margin: 10px;
}

.not-found-content p {
  font-size: 1.2rem;
  margin: 1rem 0;
}

.home-link {
  min-width: 100px;
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--main-color);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.home-link:hover {
  opacity: 0.5;
  background-color: var(--main-color);
}
</style>
