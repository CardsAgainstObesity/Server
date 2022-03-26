<script setup>
import Card from "@/components/Card.vue";
import Nav from "@/components/Nav.vue";
import { cards, game, czar } from "@/services/cards.mjs";
game.state = "choose";
</script>

<template>
    <div>
        <Nav />
        <div class="left_padding">
            <h1 class="noselect">{{ czar }} es el Zar de las cartas.</h1>
            <div class="container left">
                <Card text="Así es, yo maté a ___. ¿Que cómo lo hice? ___." :dark="true" :clickable="false" />
                <button @click="resetCards()" class="btn">RESET</button>
                <button class="btn">READY</button>
                <div class="break" />
                <Card v-for="card in cards" :text="card.text" :dark="card.dark" :clickable="true" :key="card" />
            </div>
        </div>
    </div>
</template>

<script>
function resetCards() {
    for (let input of document.querySelectorAll('.card_input')){
        input.innerHTML = "...";
    }
    game.card = 0;
}
</script>


<style>
@import "@/assets/card.css";

.container.left {
    justify-content: left !important;
}

button.btn {
    margin-bottom: 24px;
    height: 2.5rem;
}
</style>