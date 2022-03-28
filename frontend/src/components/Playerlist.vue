<script setup>
import Player from "@/components/Player.vue";
import Room from "@/services/Room.mjs";

defineProps({
    list: {
        type: Array,
        required: true
    },
    lobby: {
        type: Boolean,
        required: true
    }
})
</script>

<template>
    <ul class="playerlist">
        <li v-for="player in list" :key="player">
            <Player :name="player.name" :czar="player.id == Room.getCzar().id ? true:false" />
        </li>
    </ul>
</template>

<style scoped>
ul.playerlist {
  list-style-type: none;
  padding-left: 0;
}
ul.playerlist > li {
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  min-width: 200px;
  max-width: 50vw;
  background-color: #222222;
  transition: background-color 0.25s, transform 0.25s;
  overflow-x: hidden;
}

ul.playerlist > li:hover {
  background-color: #333;
  transform: scale(1.025);
}

@keyframes slideInFromLeft {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
  100% {
    transform: scale(1);
  }
}

ul.playerlist > li:last-child {
  animation: 1s ease-out 0s 1 slideInFromLeft;
}

@media only screen and (max-width: 1000px) {
  ul.playerlist > li {
    max-width: 100% !important;
    margin-right: 2.5%;
  }
}
</style>