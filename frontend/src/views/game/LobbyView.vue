<script setup>
import WSConnection from '@/services/ws.mjs';
import Nav from "@/components/Nav.vue";
import Playerlist from "@/components/Playerlist.vue";
import { game } from "@/services/cards.mjs";
import Room from "@/services/Room.mjs";
import API from "@/services/API.mjs";
game.state = "lobby";
</script>

<script>
export default {
  name: 'LobbyView',
  data() {
    return {
      playerlist: [],
      nIntervId: undefined
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
      // if (!this.nIntervId) {
      //   this.nIntervId = setInterval(() => {
      //     // let players = await API.getRoomPlayers(Room.roomId);
      //     API.getRoomPlayers(Room.roomId).then(players => {
      //       console.log(players);
      //       this.playerlist = players;
      //     });
      //   }, 1000);
      // }
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
        <Playerlist :list="playerlist" />
      </main>
    </div>
  </div>
</template>