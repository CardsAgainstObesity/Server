<script setup>
import WSConnection from "@/services/ws.mjs";
import Nav from "@/components/Nav.vue";
import Playerlist from "@/components/Playerlist.vue";
import { game } from "@/services/cards.mjs";
import Room from "@/services/Room.mjs";
game.state = "lobby";
</script>

<script>
export default {
  name: "LobbyView",
  data() {
    return {
      playerlist: [],
      nIntervId: undefined,
    };
  },
  methods: {
    appendplayer(player) {
      const _player = { name: player ? player.name : "YOinkS" };
      this.playerlist.push(_player);
    },
    async loadPlayers() {
      if (!this.nIntervId) {
        this.nIntervId = setInterval(() => { // TODO: Esto es muy cutre, debe ser cambiado por algun mecanismo de Vue si es posible.
          this.playerlist = Room.playersArr;
        }, 500);
      }
    }
  },
  mounted() {
    this.loadPlayers();
  }
};
</script>

<template>
  <div>
    <Nav />
    <div class="left_padding">
      <main>
        <button @click="appendplayer()">DEBUG Append player</button>
        <button @click="loadPlayers()">DEBUG Load player</button>
        <h1>Jugadores en la partida</h1>
        <Playerlist :list="playerlist" :lobby="true" />
      </main>
    </div>
  </div>
</template>