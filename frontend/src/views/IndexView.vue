<script setup>
import WSConnection from '@/services/ws.mjs';
import Nav from "@/components/Nav.vue";
import Room from '../services/Room.mjs';
</script>

<template>
	<div>
		<Nav :hidelogo="true" />
		<div class="centered">
			<main>
				<img class="logo" src="@/assets/logo.png" />
				<input type="text" id="name" placeholder="Tu nombre" />
				<input type="text" id="code" placeholder="Codigo de sala" />
				<br>
				<button @click="connect">Unirse</button>
				<button @click="create">Crea una nueva partida</button>
			</main>
		</div>
	</div>
</template>

<script>
export default {
  name: "IndexView",
  methods: {
    connect() {
		const roomId = document.getElementById('code').value;
		const name = document.getElementById('name').value;
		WSConnection.changeName(name);
		WSConnection.joinRoom(roomId);
		WSConnection.socket.on("RoomConnectionSuccess", (room) => {
			Room.roomId = room.roomId; // Si esto no se pone el valor de Room.roomId es "undefined".
			this.$router.replace({ name: 'lobby', params: { id: Room.roomId } })
        });
    },
    create() {
		const roomId = document.getElementById('code').value;
		const name = document.getElementById('name').value;
		WSConnection.changeName(name);
		WSConnection.createRoom(roomId);
		WSConnection.socket.on("RoomCreationSuccess", (room) => {
			Room.roomId = room.roomId; // Si esto no se pone el valor de Room.roomId es "undefined".
			this.$router.replace({ name: 'lobby', params: { id: Room.roomId } })
        });
    }
  }
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