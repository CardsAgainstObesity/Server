<script setup>
import { RouterView, RouterLink } from 'vue-router';
import HelloWorld from '@/components/HelloWorld.vue';
import Nav from "@/components/Nav.vue";
</script>

<template>
  <div>
    <RouterView />
    <footer>
      <p>
        Creado por
        <a href="https://twitter.com/guskikalola">Guskikalola</a> y
        <a href="https://twitter.com/Zlender02">Zlendy</a>.
      </p>
      <p>
        <RouterLink :to="{ name: 'lobby' }">DEBUG Lobby</RouterLink>, 
        <RouterLink :to="{ name: 'choose' }">DEBUG Elegir</RouterLink>, 
        <RouterLink :to="{ name: 'vote' }">DEBUG Votar</RouterLink>
      </p>
    </footer>
  </div>
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

@media only screen and (max-width: 500px) {
  .logo {
    background-image: none !important;
  }
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
    background-color: #2e3440;
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
