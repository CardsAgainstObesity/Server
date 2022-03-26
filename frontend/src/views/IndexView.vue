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
				<h1>Unete a una partida</h1>
				<input type="text" id="code" placeholder="Codigo de sala" />
				<button @click="connect">Unirse</button>
				<hr />
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
		this.$router.push({ name: 'lobby' });
    },
    create() {
		const roomId = document.getElementById('code').value;
		const name = document.getElementById('name').value;
		WSConnection.changeName(name);
		WSConnection.createRoom(roomId);
		this.$router.push({ name: 'lobby' });
    }
  }
};
</script>

<style scoped>
img.logo {
	width: 100%;
}

hr {
	margin-top: 1rem;
	margin-bottom: 1rem;
}
.centered {
	margin: 0;
	position: fixed;
	top: 50%;
	left: 50%;
	-ms-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
	padding: 8rem 2rem;
	background-color: #222222;
	border-radius: 1rem;
	text-align: center;
	max-width: 50vh;
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