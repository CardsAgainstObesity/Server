<script setup>
import Nav from "@/components/Nav.vue";
</script>

<template>
    <div>
        <Nav />
        <main class="centered_text">
            <h1>Frontend</h1>
            <p>Vue.js</p>
            <img class="image" src="https://raw.githubusercontent.com/vuejs/art/9f8ee218d32b52c2d150212f22798a7a61689361/logo.svg" />
            <h1>Backend</h1>
            <p>ExpressJS</p>
        </main>
    </div>
</template>

<style scoped>
h1,
h2 {
    margin-top: 15px;
}
b {
    font-weight: bold;
}
img.image{
    width: 30%;
}
</style>