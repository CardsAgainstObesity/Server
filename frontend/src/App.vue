<script setup>
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from '@/components/HelloWorld.vue';
import { game } from '@/services/cards.mjs';
</script>

<script>
export default {
    name: 'App',
    data () {
      return {
        gamestate: game.state
      }
    }
}
</script>

<template>
  <main>
    <header>
      <div class="topnav logo">
        <nav class="left noselect">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink :to="{ name: gamestate }">Partida</RouterLink>
          <RouterLink :to="{ name: 'choose' }">Partida (Elegir)</RouterLink>
          <RouterLink :to="{ name: 'vote' }">Partida (Votar)</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <footer>
      <p>
        Creado por
        <a href="https://twitter.com/guskikalola">Guskikalola</a> y
        <a href="https://twitter.com/Zlender02">Zlendy</a>.
      </p>
    </footer>
  </main>
</template>

<style>
@import "@/assets/base.css";

.logo {
  /* object-fit: cover; */
  background-image: url("@/assets/logo.png");
  background-size: auto 2rem;
  background-repeat: no-repeat;
  background-position: 99%, center;
}

div.topnav {
  position: relative;
  overflow: hidden;
  background-color: var(--color-background-soft);
  margin-bottom: 2rem;
}

.left {
  float: left;
}

.right {
  float: right;
}

a,
.green {
  text-decoration: none;
  color: #83b4f0;
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: #2E3440;
  }
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 1rem 1rem;
  border-left: 1px solid var(--color-border);
}

footer {
  position: fixed;
  bottom: 1%;
  width: 100%;
  text-align: center;
}
</style>
