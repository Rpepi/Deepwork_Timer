let timer = {
  timeLeft: 0,
  totalTime: 0,
  isRunning: false,
  timerId: null
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'START_TIMER':
      timer.timeLeft = request.timeLeft;
      timer.totalTime = request.totalTime;
      timer.isRunning = true;
      startTimer();
      break;
    case 'PAUSE_TIMER':
      pauseTimer();
      break;
    case 'RESET_TIMER':
      resetTimer();
      break;
    case 'GET_TIMER_STATE':
      sendResponse({
        timeLeft: timer.timeLeft,
        totalTime: timer.totalTime,
        isRunning: timer.isRunning
      });
      break;
  }
  return true;
});

function startTimer() {
  if (timer.timerId) clearInterval(timer.timerId);
  timer.timerId = setInterval(() => {
    if (timer.timeLeft > 0) {
      timer.timeLeft--;
      chrome.runtime.sendMessage({
        action: 'TIMER_UPDATE',
        timeLeft: timer.timeLeft,
        totalTime: timer.totalTime
      });
    } else {
      resetTimer();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.png',
        title: 'Deep Work Timer',
        message: 'Le temps est écoulé!'
      });
    }
  }, 1000);
}

function pauseTimer() {
  timer.isRunning = false;
  clearInterval(timer.timerId);
}

function resetTimer() {
  timer.isRunning = false;
  timer.timeLeft = 0;
  timer.totalTime = 0;
  clearInterval(timer.timerId);
  
  // Envoyer un message pour l'effet de récompense
  chrome.runtime.sendMessage({
    action: 'TIMER_COMPLETE',
    stats: {
      duration: timer.totalTime,
      date: new Date().toISOString()
    }
  });
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon.png',
    title: 'Deep Work Timer',
    message: 'Félicitations ! Session terminée avec succès !',
    buttons: [
      { title: 'Nouvelle session' }
    ]
  });
} 