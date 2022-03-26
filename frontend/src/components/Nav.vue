<script setup>
import { RouterLink } from 'vue-router';
import { game } from '@/services/cards.mjs';
import Room from '../services/Room.mjs';
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
                <RouterLink :to="{ name: game.state, params: { id: (Room.roomId == '' ? 'DEBUG':Room.roomId) } }">Partida</RouterLink>
                <RouterLink to="/rules">Reglas</RouterLink>
                <RouterLink to="/about">Acerca de</RouterLink>
            </nav>
        </div>
    </header>
</template>