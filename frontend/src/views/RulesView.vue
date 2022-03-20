<script setup>
import Nav from "@/components/Nav.vue";
</script>

<template>
    <div>
        <Nav />
        <main class="centered_text">
            <h1>Reglas del juego</h1>
            <p>Para empezar el juego, cada jugador recibe 10 cartas de respuesta (cartas blancas).</p>
            <p>La persona que haya cagado más recientemente es designada como el Zar del primer turno, y elige una carta de pregunta (carta negra). El Zar lee en alto la susodicha pregunta o la frase incompleta.</p>
            <p>Los demás jugadores responden la pregunta pasando una de sus cartas de respuesta al Zar, sin que este las pueda ver.</p>
            <p>El Zar mezcla las cartas de respuesta, y las lee en alto, repitiendo de antemano la citada pregunta. Después, el Zar elige la respuesta más graciosa. Y el jugador al que pertenece dicha respuesta recibe un punto de victoria.</p>
            <p>Después de cada ronda, otro jugador se convierte en Zar y todos los jugadores roban cartas de respuesta hasta volver a tener 10 cada uno.</p>
            <h2>Coge 2</h2>
            <p>En algunas cartas viene escrito «Coge 2» en la parte de abajo.</p>
            <p>Para responder estas cartas, cada jugador debe elegir una combinación de dos cartas. El orden de las cartas importa en este caso.</p>
            <h2>Apostar</h2>
            <p>Si tienes más de una carta de respuesta que pueden ser ganadoras, puedes jugar con dos cartas de respuesta, apostando un punto de victoria.</p>
            <p>En caso de que ganes recibes un punto de victoria y recuperas el apostado, pero si pierdes la ronda perderás también el punto de victoria que has apostado.</p>
        </main>
    </div>
</template>

<style scoped>
h1,
h2 {
    margin-top: 15px;
}
</style>