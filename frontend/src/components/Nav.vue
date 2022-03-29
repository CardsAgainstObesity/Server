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
        <div class="topnav logo" :class="(hidelogo === true ? 'hide':'')">
            <nav class="left noselect">
                <RouterLink v-if="Room.roomId == ''" to="/">Inicio</RouterLink>
                <RouterLink v-if="Room.roomId != ''" :to="{ name: game.state, params: { id: (Room.roomId == '' ? 'DEBUG':Room.roomId) } }">Partida</RouterLink>
                <RouterLink to="/rules">Reglas</RouterLink>
                <RouterLink to="/about">Acerca de</RouterLink>
            </nav>
        </div>
    </header>
</template>

<style scoped>
@media only screen and (min-height: 601px) {
	div.hide {
		background-image: none;
	}
}
</style>