<script setup>
import { RouterLink } from 'vue-router';
import { game } from '@/services/cards.mjs';
</script>
<template>
    <header>
        <div class="topnav logo">
            <nav class="left noselect">
                <RouterLink to="/">Inicio</RouterLink>
                <RouterLink :to="{ name: game.state }">Partida</RouterLink>
                <RouterLink to="/rules">Reglas</RouterLink>
            </nav>
        </div>
    </header>
</template>