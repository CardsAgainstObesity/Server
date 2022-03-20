<script setup>
import WSConnection from '@/services/ws.mjs';
import Nav from "@/components/Nav.vue";
import API from '@/services/API.mjs';
</script>

<template>
  <div>
    <Nav />
    <div class="left_padding">
      <main>
        <p>Introduce codigo de sala</p>
        <input id="code" placeholder="Codigo" />
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