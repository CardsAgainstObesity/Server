<script setup>
import Nav from "@/components/Nav.vue";
</script>

<template>
    <div>
        <Nav />
        <main class="centered_text">
            <h1>Reglas del juego</h1>
            <p>
                Para empezar el juego, cada jugador recibe
                <b>10 cartas de respuesta</b> (cartas blancas).
            </p>
            <p>
                La persona que
                <b>haya cagado más recientemente</b>, es decir, <b>el primero que se une a la partida</b>, es designada como el
                <b>Zar del primer turno</b>, y elige una
                <b>carta de pregunta</b> (carta negra). El
                <b>Zar lee en alto</b> la susodicha pregunta o la frase incompleta.
            </p>
            <p>
                Los demás
                <b>jugadores responden la pregunta</b> pasando una de sus cartas de respuesta al Zar, sin que este las pueda ver.
            </p>
            <p>
                El
                <b>Zar mezcla las cartas de respuesta</b>, y
                <b>las lee en alto</b>, repitiendo de antemano la citada pregunta. Después, el
                <b>Zar elige la respuesta más graciosa</b>. Y el jugador al que pertenece dicha respuesta recibe un
                <b>punto de victoria</b>.
            </p>
            <p>
                Después de cada ronda,
                <b>otro jugador se convierte en Zar</b> y todos los jugadores roban cartas de respuesta hasta
                <b>volver a tener 10 cada uno</b>.
            </p>
            <h2>Coge 2</h2>
            <p>
                En algunas cartas viene escrito «<b>Coge 2</b>» en la parte de abajo.
            </p>
            <p>
                <b>Para responder</b> estas cartas, cada jugador debe elegir una
                <b>combinación de dos cartas</b>. El orden de las cartas importa en este caso.
            </p>
            <h2>Apostar</h2>
            <p>
                Si tienes más de una carta de respuesta que pueden ser ganadoras,
                <b>puedes jugar con dos cartas de respuesta, apostando un punto de victoria</b>.
            </p>
            <p>
                En caso de que ganes recibes un punto de victoria y recuperas el apostado, pero
                <b>si pierdes</b> la ronda
                <b>perderás también el punto de victoria</b> que has apostado.
            </p>
        </main>
    </div>
</template>

<style scoped>
h1,
h2 {
    margin-top: 15px;
}
b {
    font-weight: bold;
}
</style>