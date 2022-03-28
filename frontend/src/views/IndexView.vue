<script setup>
import Nav from "@/components/Nav.vue";
import Toast from "@/components/Toast.vue";
import WSConnection from "@/services/ws.mjs";
import Room from "../services/Room.mjs";
</script>

<template>
  <div>
    <Nav :hidelogo="true" />
    <Transition name="slide-fade">
      <Toast v-if="showToast" :text="toastText" type="error" />
    </Transition>
    <div class="centered">
      <main>
        <img class="logo" src="@/assets/logo.png" />
        <input type="text" id="name" placeholder="Tu nombre" maxlength="25" />
        <input type="text" id="code" placeholder="Codigo de sala" />
        <br />
        <button @click="connect">Unirse</button>
        <button @click="create">Crea una nueva partida</button>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexView",
  data() {
    return {
      showToast: false,
      nTimeoutId: undefined,
      toastText: "ERROR",
    };
  },
  mounted() {
    WSConnection.socket.on("error", (err) => {
      this.toast(err);
    });
    WSConnection.socket.on("RoomConnectionSuccess", (room) => {
      Room.roomId = room.roomId; // Si esto no se pone el valor de Room.roomId es "undefined".
      this.$router.replace({ name: "lobby", params: { id: Room.roomId } });
    });
    WSConnection.socket.on("RoomCreationSuccess", (room) => {
      Room.roomId = room.roomId; // Si esto no se pone el valor de Room.roomId es "undefined".
      this.$router.replace({ name: "lobby", params: { id: Room.roomId } });
    });
  },
  methods: {
    connect() {
      const roomId = document.getElementById("code").value;
      const name = document.getElementById("name").value;
      WSConnection.changeName(name);
      WSConnection.joinRoom(roomId);
    },
    create() {
      const roomId = document.getElementById("code").value;
      const name = document.getElementById("name").value;
      WSConnection.changeName(name);
      WSConnection.createRoom(roomId);
    },
    toast(text) {
      if (!this.nTimeoutId) {
        this.toastText = text;
        this.showToast = true;
        console.log("Comienzo timeout");
        this.nTimeoutId = setTimeout(() => {
          console.log("Fin timeout");
          this.showToast = false;
          this.nTimeoutId = undefined;
        }, 2500);
      }
    },
  },
};
</script>

<style scoped>
img.logo {
  width: 100%;
  margin-bottom: 2rem;
}

.centered {
  margin: 0;
  position: fixed;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  padding: 5rem 2rem;
  background-color: #222222;
  border-radius: 1rem;
  text-align: center;
  max-width: 50vh;
}

@media only screen and (max-height: 600px) {
  img.logo {
    display: none;
  }

  .centered {
    top: 15%;
    left: 10%;
    right: 10%;
    -ms-transform: none;
    transform: none;
    max-width: 100vw;
  }
}

button,
input[type="text"] {
  margin-bottom: 0.5rem;
  max-width: 50vw;
  background-color: #181818;
  font-size: 1rem;
  width: 100%;
}

input[type="text"]:focus,
button:hover {
  background-color: #83b4f0 !important;
  color: #181818;
}

input[type="text"] {
  min-width: 200px;
}
</style>