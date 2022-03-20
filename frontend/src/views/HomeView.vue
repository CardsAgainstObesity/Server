<script setup>
import TheWelcome from '@/components/TheWelcome.vue';
import WSConnection from '@/services/ws.mjs';
import API from '@/services/API.mjs';
</script>

<template>
  <main>
    <!-- <TheWelcome /> -->
    <p>Introduce codigo de sala</p>
    <input id="code" placeholder="Codigo" />
    <button @click="connect">Submit</button>
  </main>
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