<script setup>
import WSConnection from '@/services/ws.mjs';
import Nav from "@/components/Nav.vue";
import Player from "@/components/Player.vue";
import { game } from "@/services/cards.mjs";
import Room from "@/services/Room.mjs";
import API from "@/services/API.mjs";
game.state = "lobby";
// let playerlist = [
//   {name: "Colonel Sanders"},
//   {name: "Juanpe Tortillas"},
//   {name: "Tocameles Escroto"},
//   {name: "Albion Offline"}
// ]
// function appendplayer() {
//   const player = { name: 'CUM' };
//   console.log(player)
//   playerlist.push(player);
// }
</script>

<script>
export default {
  name: 'LobbyView',
  data() {
    return {
      playerlist: []
    }
  },
  methods: {
    appendplayer(player) {
      const _player = { name: player ? player.name : "YOinkS" };
      this.playerlist.push(_player);
    },
    async loadPlayers() {
      console.log("?");
      let players = await API.getRoomPlayers(Room.roomId);
      console.log(players);
      this.playerlist = players;
    }
  }
}

</script>

<template>
  <div>
    <Nav />
    <div class="left_padding">
      <main>
        <button @click="appendplayer()">DEBUG Append player</button>
        <button @click="loadPlayers()">DEBUG Load player</button>
        <h1>Jugadores en la partida</h1>
        <ul class="playerlist">
          <li v-for="player in playerlist">
            <Player :name="player.name" />
          </li>
        </ul>
      </main>
    </div>
  </div>
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
}
@media only screen and (max-width: 1000px) {
  ul.playerlist > li {
    max-width: 100% !important;
    margin-right: 2.5%;
  }
}
</style>