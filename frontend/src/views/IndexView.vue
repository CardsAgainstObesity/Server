<script setup>
import WSConnection from '@/services/ws.mjs';
import Nav from "@/components/Nav.vue";
import API from '@/services/API.mjs';
import Room from '../services/Room.mjs';
</script>

<template>
  <div>
    <Nav />
    <div class="centered">
      <main>
        <p>Introduce codigo de sala</p>
        <input type="text" id="code" placeholder="Codigo" />
        <button @click="connect">Submit</button>
      </main>
    </div>
  </div>
</template>

<script>
async function connect() {
  const roomId = document.getElementById('code').value;
  console.log("Attempting socket connect:", roomId);
  WSConnection.changeName();
  WSConnection.joinRoom(roomId);
  let players = await API.getRoomPlayers(roomId);
  console.log(players);
}
</script>

<style scoped>
button {
  display: block;
}
.centered {
  position: fixed;
  top: 50%;
  left: 50%;
  margin-top: -50px;
  margin-left: -100px;
}

input#code[type="text"] {
  border: 1px solid white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  min-width: 200px;
  max-width: 50vw;
  background-color: #222222;
  outline: none;
  color: #a2a2a2;
}

input#code[type="text"]:focus {
  background-color: #2e3440;
}
</style>