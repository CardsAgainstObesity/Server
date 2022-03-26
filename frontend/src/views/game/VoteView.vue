<script setup>
import Card from "@/components/Card.vue";
import Nav from "@/components/Nav.vue";
import { cards, game, czar } from "@/services/cards.mjs";
game.state = "vote";
let black_card_test = "Así es, yo maté a ___. ¿Que cómo lo hice? ___.";
const replace_value = "<span class='card_input'>...</span>";
black_card_test = black_card_test.replaceAll('___',replace_value);
</script>

<template>
    <div>
        <Nav/>
        <h1 class="left_padding noselect">{{ czar }} es el Zar de las cartas.</h1>
        <div class="container">
            <Card :text="black_card_test" :dark="true" :clickable="false" />
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