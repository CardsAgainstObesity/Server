<script setup>
import Card from "@/components/Card.vue";
import { cards, game, czar } from "@/services/cards.mjs";
game.state = "choose";
</script>

<template>
    <div class="left_padding">
        <h1 class="noselect">{{ czar }} es el Zar de las cartas.</h1>
        <div class="container left">
            <Card text="Made in Abyss" :dark="true" />
            <div class="break" />
            <Card v-for="card in cards" :text="card.text" :dark="card.dark" />
        </div>
    </div>
</template>

<style>
@import "@/assets/card.css";

.container.left {
    justify-content: left !important;
}
</style>