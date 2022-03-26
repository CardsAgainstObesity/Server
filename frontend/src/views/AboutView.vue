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
                <h3>VueJS</h3>
            </div>
            <div class="flex-item">
                <img class="image" src="/logos/expressjs.svg" />
                <h3>ExpressJS</h3>
            </div>
            <div class="flex-item">
                <img class="image" src="/logos/socketio.svg" />
                <h3>Socket.io</h3>
            </div>
            <!-- <div class="break" /> -->
        </div>
        <h1 class="left_padding">Tools</h1>
        <div class="container">
            <div class="flex-item">
                <img class="image" src="/logos/gimp.svg" />
                <h3>GIMP</h3>
            </div>
            <div class="flex-item">
                <img class="image" src="/icons/cube-outline.svg" />
                <h3>Tesseract-ocr</h3>
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
    width: 10rem;
    height: 10rem;
}

.flex-item > img.image {
    align-content: center;
    height: 75%;
}

h2,
h2 {
    margin-top: 15px;
}
b {
    font-weight: bold;
}
</style>