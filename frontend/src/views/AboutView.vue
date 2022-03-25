<script setup>
import Nav from "@/components/Nav.vue";
</script>

<template>
    <div>
        <Nav />
        <h1 class="left_padding">Web</h1>
        <div class="container">
            <div class="flex-item">
                <img class="image" src="/logos/vuejs.svg" />
                <h1>VueJS</h1>
            </div>
            <div class="flex-item">
                <img class="image" src="/logos/expressjs.svg" />
                <h1>ExpressJS</h1>
            </div>
            <div class="flex-item">
                <img class="image" src="/logos/socketio.svg" />
                <h1>Socket.io</h1>
            </div>
            <!-- <div class="break" /> -->
        </div>
        <h1 class="left_padding">Tools</h1>
        <div class="container">
            <div class="flex-item">
                <img class="image" src="/logos/gimp.svg" />
                <h1>GIMP</h1>
            </div>
            <div class="flex-item">
                <img class="image" src="/icons/cube-outline.svg" />
                <h1>Tesseract-ocr</h1>
            </div>
        </div>
    </div>
</template>

<style scoped>
.flex-item {
    margin: 0.5rem;
    padding: 1rem;
    text-align: center;
    border-radius: 0.5rem;
    background-color: #333;
    align-self: flex-start;
}

h1,
h2 {
    margin-top: 15px;
}
b {
    font-weight: bold;
}
img.image {
    width: 10rem;
}
</style>