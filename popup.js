class DeepWorkTimer {
  constructor() {
    this.minutesInput = document.getElementById('minutes');
    this.secondsInput = document.getElementById('seconds');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.timePresets = document.getElementById('timePresets');
    this.progressBar = document.querySelector('.progress-bar');
    
    this.timeLeft = 0;
    this.totalTime = 0;
    this.isRunning = false;
    this.timerId = null;

    this.setupEventListeners();

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'TIMER_UPDATE') {
        this.timeLeft = message.timeLeft;
        this.totalTime = message.totalTime;
        this.updateDisplay();
        this.updateProgressBar(this.timeLeft / this.totalTime);
      }
      if (message.action === 'TIMER_COMPLETE') {
        this.showReward();
      }
    });

    chrome.runtime.sendMessage({ action: 'GET_TIMER_STATE' }, (response) => {
      if (response.isRunning) {
        this.timeLeft = response.timeLeft;
        this.totalTime = response.totalTime;
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.updateDisplay();
        this.updateProgressBar(this.timeLeft / this.totalTime);
      }
    });
  }

  setupEventListeners() {
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    
    this.minutesInput.addEventListener('change', () => this.validateInput(this.minutesInput, 59));
    this.secondsInput.addEventListener('change', () => this.validateInput(this.secondsInput, 59));
    this.timePresets.addEventListener('change', () => this.handlePresetChange());
  }

  validateInput(input, max) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > max) value = max;
    input.value = value.toString().padStart(2, '0');
  }

  startTimer() {
    if (!this.timeLeft) {
      const minutes = parseInt(this.minutesInput.value);
      const seconds = parseInt(this.secondsInput.value);
      this.timeLeft = this.totalTime = (minutes * 60 + seconds);
    }

    if (this.timeLeft === 0) return;

    this.isRunning = true;
    this.startBtn.disabled = true;
    
    chrome.runtime.sendMessage({
      action: 'START_TIMER',
      timeLeft: this.timeLeft,
      totalTime: this.totalTime
    });
  }

  pauseTimer() {
    this.isRunning = false;
    this.startBtn.disabled = false;
    chrome.runtime.sendMessage({ action: 'PAUSE_TIMER' });
  }

  resetTimer() {
    this.isRunning = false;
    this.timeLeft = 0;
    this.startBtn.disabled = false;
    
    if (this.timePresets.value === 'custom') {
      this.minutesInput.value = "25";
      this.secondsInput.value = "00";
    }
    this.updateProgressBar(1);
    chrome.runtime.sendMessage({ action: 'RESET_TIMER' });
  }

  updateTimer() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateDisplay();
      this.updateProgressBar(this.timeLeft / this.totalTime);
    } else {
      this.resetTimer();
      // Notification à la fin du timer
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Deep Work Timer',
        message: 'Le temps est écoulé!'
      });
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.minutesInput.value = minutes.toString().padStart(2, '0');
    this.secondsInput.value = seconds.toString().padStart(2, '0');
  }

  updateProgressBar(percentage) {
    const translateX = (1 - percentage) * 100;
    this.progressBar.style.transform = `translateX(-${translateX}%)`;
  }

  handlePresetChange() {
    const selectedValue = this.timePresets.value;
    if (selectedValue === 'custom') {
      this.minutesInput.removeAttribute('readonly');
      this.secondsInput.removeAttribute('readonly');
    } else {
      const minutes = parseInt(selectedValue);
      this.minutesInput.value = minutes.toString().padStart(2, '0');
      this.secondsInput.value = '00';
      
      this.minutesInput.setAttribute('readonly', true);
      this.secondsInput.setAttribute('readonly', true);
    }

    if (this.isRunning) {
      this.resetTimer();
    }
  }

  showReward() {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'reward-overlay';
    document.body.appendChild(overlay);
    
    // Jouer le son
    const audio = new Audio(chrome.runtime.getURL('sounds/beep.mp3'));
    audio.play();
    
    // Ajouter l'effet de célébration
    const timerDisplay = document.querySelector('.timer-display');
    timerDisplay.classList.add('timer-complete');
    overlay.classList.add('show');
    
    // Nettoyer après l'animation
    setTimeout(() => {
      overlay.remove();
      timerDisplay.classList.remove('timer-complete');
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DeepWorkTimer();
}); 