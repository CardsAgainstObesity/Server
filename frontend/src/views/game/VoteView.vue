<script setup>
import Card from "@/components/Card.vue";
import Nav from "@/components/Nav.vue";
import { cards, game, czar } from "@/services/cards.mjs";
game.state = "vote";
</script>

<template>
    <div>
        <Nav/>
        <h1 class="left_padding noselect">{{ czar }} es el Zar de las cartas.</h1>
        <div class="container">
            <Card text="Así es, yo maté a ___. ¿Que cómo lo hice? ___." :dark="true" :clickable="false" />
            <div class="break" />
            <Card v-for="card in cards" :text="card.text" :dark="card.dark" :clickable="true" :key="card" />
        </div>
    </div>
</template>

<style>
@import "@/assets/card.css";

.container.left {
    justify-content: left !important;
}
</style>