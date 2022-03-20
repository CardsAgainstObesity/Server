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
				<h1>Introduce codigo de sala</h1>
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
}

button,
input#code[type="text"] {
	margin-bottom: 0.5rem;
	max-width: 50vw;
	background-color: #181818;
}

input[type="text"]:focus,
button:hover {
    background-color: #83b4f0 !important;
    color: #181818;
}

input#code[type="text"] {
	min-width: 200px;
}
</style>