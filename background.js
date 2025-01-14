// Quand l'extension est installée ou mise à jour
chrome.runtime.onInstalled.addListener(() => {
    console.log('L\'extension Minuteur Circulaire est installée.');
  });
  
  // Fonction pour créer une notification lorsque le minuteur arrive à zéro
  function showTimerExpiredNotification() {
    chrome.notifications.create('timerExpired', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Temps écoulé',
      message: 'Votre minuteur est terminé!',
      priority: 2
    });
  }
  
  // Écoute de l'événement pour envoyer la notification quand le minuteur est terminé
  chrome.runtime.onMessage.addListener((message) => {
    if (message === 'timerExpired') {
      showTimerExpiredNotification();
    }
  });
  
  // Example de gestion d'un minuteur en arrière-plan
  let timerState = {
    isRunning: false,
    timeRemaining: 0,
    intervalId: null
  };
  
  // Méthode pour démarrer un minuteur en arrière-plan
  function startTimer(duration) {
    if (timerState.isRunning) return;
    timerState.isRunning = true;
    timerState.timeRemaining = duration;
    
    timerState.intervalId = setInterval(() => {
      if (timerState.timeRemaining > 0) {
        timerState.timeRemaining--;
      } else {
        clearInterval(timerState.intervalId);
        timerState.isRunning = false;
        // Lorsque le timer est terminé, envoyer un message pour notifier
        chrome.runtime.sendMessage('timerExpired');
      }
    }, 1000);
  }
  
  // Méthode pour arrêter le minuteur
  function stopTimer() {
    if (!timerState.isRunning) return;
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.timeRemaining = 0;
  }
  
  // Exemple d'écoute d'événements pour contrôler le minuteur à partir de la popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'start') {
      startTimer(message.duration);
    } else if (message.type === 'stop') {
      stopTimer();
    }
  });
  