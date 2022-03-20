<script setup>
import { RouterLink } from 'vue-router';
import { game } from '@/services/cards.mjs';
defineProps({
    hidelogo: {
        type: Boolean,
        required: false
    }
});
</script>
<template>
    <header>
        <div class="topnav logo" :style="(hidelogo === false ? '':'background-image: none;')">
            <nav class="left noselect">
                <RouterLink to="/">Inicio</RouterLink>
                <RouterLink :to="{ name: game.state }">Partida</RouterLink>
                <RouterLink to="/rules">Reglas</RouterLink>
            </nav>
        </div>
    </header>
</template>