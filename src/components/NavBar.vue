<template>
  <nav>
    <router-link to="/map" class="big-type">map</router-link>
    <router-link to="/" class="big-type">communicating hate</router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
nav {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  z-index: 10;
}

a {
  color: var(--pri);
  text-decoration: none;
}

a:hover {
 font-style: italic;
}
</style>