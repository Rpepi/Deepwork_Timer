const app = Vue.createApp({
  data() {
    return {
      totalTime: 25 * 60, // Temps total (25 minutes par défaut)
      timeRemaining: 25 * 60,
      intervalId: null,
      radius: 100,
      minutes: 25, // Minutes par défaut
      seconds: 0, // Secondes par défaut
      isExpired: false, // Indicateur pour l'animation de l'expiration
      timerRunning: false, // Indicateur pour savoir si le minuteur est en cours
    };
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    progress() {
      return (
        this.circumference -
        (this.timeRemaining / this.totalTime) * this.circumference
      );
    },
    formattedTime() {
      const minutes = Math.floor(this.timeRemaining / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (this.timeRemaining % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    },
  },
  methods: {
    startTimer() {
      if (this.intervalId) return;
      this.timerRunning = true;
      this.isExpired = false;
      this.intervalId = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.isExpired = true;
          this.playEndSound(); // Jouer le bruit de fin
          alert('Temps écoulé !');
        }
      }, 1000);
    },
    pauseTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.timerRunning = false;
    },
    resetTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.timeRemaining = this.totalTime;
      this.isExpired = false;
      this.timerRunning = false; // Revenir à l'état initial
    },
    updateTime() {
      // Mettre à jour le totalTime chaque fois que les minutes ou les secondes changent
      this.totalTime = this.minutes * 60 + this.seconds;
      this.timeRemaining = this.totalTime;
    },
    setTime(newTime) {
      this.totalTime = newTime;
      this.timeRemaining = newTime;
      this.isExpired = false;
      this.timerRunning = false; // Réinitialiser l'état du minuteur
    },
    playEndSound() {
      this.$refs.audioEnd.play(); // Jouer le son à la fin
    }
  },
  mounted() {
    this.timeRemaining = this.totalTime;
  },
});

app.mount('#app');
