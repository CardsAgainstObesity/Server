<script setup>
import WSConnection from '@/services/ws.mjs';
import Nav from "@/components/Nav.vue";
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
function connect() {
  const roomId = document.getElementById('code').value;
  console.log("Attempting socket connect:", roomId);
  WSConnection.socket.emit('roomJoinRequest', roomId);
}
</script>