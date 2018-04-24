class Pomodoro {
  constructor() {
    this.timer = 'timer';     // will store setInterval() to keep track of time
    this.active = false;      // controls whether or not the timer is running
    this.type = 'focus';      // current state of timer 'focus' or 'rest'
    this.startTime = 1500;    // initial / starting value of the timer (in seconds)
    this.currentTime = 1500;  // current time on the timer (counts down; in seconds)
    this.focusTime = 1500;    // stores the focus time (in seconds)
    this.restTime = 300;      // stores the rest time (in seconds)
    this.focusCount = 0;      // stores the number of times the focus timer has happened

    // audio cues for when timer state switches
    this.restAudio = document.getElementById('beep');
    this.focusAudio = document.getElementById('beep2');
  }

  // formats the time into appropriate format (h:mm:ss)
  static formatTime(secs) {
    let result = '';
    const seconds = parseInt(secs % 60, 10);
    const minutes = secs === 3600 ? 0 : parseInt((secs / 60), 10);
    const hours = parseInt(secs / 3600, 10);

    // adds the leading '0' for minutes and seconds (hh:mm)
    const addLeadingZeroes = function (time) {
      return time < 10 ? `0${time}` : time;
    };

    // if there is an hour add that first otherwise add minutes and seconds with leading zeroes
    if (hours > 0) result += `${hours}:`;
    result += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`;

    // console.log(secs, hours, minutes, seconds, result);
    return result;
  }

  // adds / subtracts 60 seconds from the focus time
  changeFocusTime(str) {
    // can only change focus time if timer is not active
    if (this.active === false) {
      this.reset();

      // if the passed string is 'add' add a minute; else subtract a minute if above 1 minute
      if (str === 'add') {
        this.focusTime += 60;
      } else {
        this.focusTime -= 60;
      }

      // if above 60 minutes, reset to 1 minute
      if (this.focusTime > 3600) {
        this.focusTime = 3600;
      } else if (this.focusTime <= 0) {
        this.focusTime = 60;
      }

      // set current and start times to the focusTime (length)
      this.currentTime = this.focusTime;
      this.startTime = this.focusTime;

      // display the focusTime and the current time
      this.displayFocusTime();
      this.displayCurrentTime();
    }
  }

  // adds / subtracts 60 seconds from rest time
  changeRestTime(str) {
    // can only change rest time if timer is not active
    if (this.active === false) {
      this.reset();

      // if the passed string is 'add' add a minute; else subtract a minute if above 1 minute
      if (str === 'add') {
        this.restTime += 60;
      } else {
        this.restTime -= 60;
      }

      // if above 60 minutes, reset to 1 minute
      if (this.restTime > 3600) {
        this.restTime = 3600;
      } else if (this.restTime <= 0) {
        this.restTime = 60;
      }

      // display the restTime
      this.displayRestTime();
    }
  }

  // displays the current time on the DOM
  displayCurrentTime() {
    // format the time and display it in DOM
    document.getElementById('time-left').innerText = Pomodoro.formatTime(this.currentTime);

    // stores the progress bar element
    const progressBar = document.getElementById('progress-bar');

    // if the current type of timer is focus
    if (this.type === 'focus' && progressBar.classList.contains('rest')) {
      // swap current class on the progress bar
      progressBar.classList.remove('rest');
      progressBar.classList.add('focus');
    // if the current type of timer is rest
    } else if (this.type === 'rest' && progressBar.classList.contains('focus')) {
      // swap current class on the progress bar
      progressBar.classList.remove('focus');
      progressBar.classList.add('rest');
    }

    // change the current value of the progress bar coincide with the time remaining
    progressBar.setAttribute('value', 100 - parseInt((this.currentTime / this.startTime) * 100, 10));
  }

  // displays the focus time (how long the focus sessions will last) on the DOM
  displayFocusTime() {
    document.getElementById('session-length').innerText = `${parseInt(this.focusTime / 60, 10)}`;
  }

  // displays the rest time (how long the rest sessions will last) on the DOM
  displayRestTime() {
    document.getElementById('break-length').innerText = `${parseInt(this.restTime / 60, 10)}`;
  }

  // displays current iteration number for the focus timer
  displayFocusCount() {
    // stores the focus count DOM element
    const count = document.getElementById('timer-label');

    // if the focus count is 0 display the instructions
    if (this.focusCount === 0) {
      count.innerText = 'Adjust your focus and rest times below!';
    // if the current type is focus: display the focus iteration count
    } else if (this.type === 'focus') {
      count.innerText = `Focus Session #${this.focusCount}`;
    // if the current type is reset: display relaxing message
    } else if (this.type === 'rest') {
      count.innerText = 'It\'s time to relax.';
    }
  }

  // allows for the timer to be paused
  toggleTimer() {
    // stores the start / pause button element from DOM
    const timerButton = document.getElementById('start_stop');

    // if the timer is active
    if (this.active === true) {
      // clear the timer interval, change text to 'Resume', and toggle the active state
      clearInterval(this.timer);
      timerButton.innerText = 'Resume';
      this.active = false;
    // if the timer is not active
    } else {
      // change the start button text to 'pause'
      timerButton.innerText = 'Pause';

      // if the focus iteration count is 0
      if (this.focusCount === 0) {
        // display the focusCount as one and play audio
        this.focusCount = 1;
        this.displayFocusCount();
      }
      // change timer active state
      this.active = true;

      this.startTimer();
    }
  }

  startTimer() {
    // creates a timer with intervals of 1 second and calls stepDown() every interval
    this.timer = setInterval(() => {
      this.currentTime -= 1;
      this.testIfZero();
      this.displayCurrentTime();
      // console.log(document.getElementById('time-left').innerText);
    }, 30);
  }

  testIfZero() {
    if (this.currentTime < 0) {
      // if the current time is below 0 and the timer type is 'focus'
      this.displayCurrentTime();
      clearInterval(this.timer);

      if (this.type === 'focus') {
        // update times to the specified rest time; change type to rest; and play an audio cue
        this.currentTime = this.restTime;
        this.startTime = this.restTime;
        this.type = 'rest';
        this.displayFocusCount();
        this.restAudio.play();

      // if the current time is 0 and the timer type is 'rest'
      } else {
        // update times to the specified focus time; change type to focus; and play an audio cue
        // add one to the focus iteration count
        this.focusCount += 1;
        this.currentTime = this.focusTime;
        this.startTime = this.focusTime;
        this.type = 'focus';
        this.displayFocusCount();
        this.focusAudio.play();
      }

      this.startTimer();
    }
  }

  // adjusts the volume of the alarms (value comes from slider)
  adjustVolume(volume) {
    this.focusAudio.volume = (volume / 100);
    this.restAudio.volume = (volume / 100);
  }

  // plays the focus audio clip to test volume levels when 'preview sound' button is pressed
  volumeTest() {
    this.focusAudio.play();
  }

  // resets the pomodoro clock
  reset() {
    // clear the timer interval; set variables to defaults
    clearInterval(this.timer);
    this.timer = 'timer';
    this.active = false;
    this.type = 'focus';
    this.currentTime = this.focusTime;
    this.focusCount = 0;

    // reset audio
    this.restAudio.pause();
    this.focusAudio.pause();
    this.restAudio.currentTime = 0;
    this.focusAudio.currentTime = 0;

    // change start button text; display now default times
    document.getElementById('start_stop').innerText = 'Start';
    this.displayCurrentTime();
    this.displayFocusTime();
    this.displayFocusCount();
  }

  // reset everything to default
  hardReset() {
    clearInterval(this.timer);
    this.timer = 'timer';
    this.active = false;
    this.type = 'focus';
    this.startTime = 1500;
    this.currentTime = 1500;
    this.focusTime = 1500;
    this.restTime = 300;
    this.focusCount = 0;

    // reset audio
    this.restAudio.pause();
    this.focusAudio.pause();
    this.restAudio.currentTime = 0;
    this.focusAudio.currentTime = 0;

    // change start button text; display now default times
    document.getElementById('start_stop').innerText = 'Start';
    this.displayCurrentTime();
    this.displayFocusTime();
    this.displayFocusCount();
    this.displayRestTime();
  }
}

// creates a pomodoro class object
const pomodoro = new Pomodoro();

// replace placeholder DOM values
pomodoro.displayCurrentTime();
pomodoro.displayFocusTime();
pomodoro.displayRestTime();
pomodoro.displayFocusCount();
pomodoro.adjustVolume(50);

// handles what methods get called depending on which button is pressed
const buttonListener = function () {
  switch (this.value) {
    case '-f':
      pomodoro.changeFocusTime('subtract');
      break;
    case '+f':
      pomodoro.changeFocusTime('add');
      break;
    case '-r':
      pomodoro.changeRestTime('subtract');
      break;
    case '+r':
      pomodoro.changeRestTime('add');
      break;
    case 'start':
      pomodoro.toggleTimer();
      break;
    case 'reset':
      pomodoro.hardReset();
      break;
    case 'sound':
      pomodoro.volumeTest();
      break;
    default:
      break;
  }
};

// store HTMLCollection of all buttons as 'buttons'
const buttons = document.getElementsByTagName('button');

// iterate through 'buttons' and add a listener for each
for (let i = 0; i < buttons.length; i += 1) {
  buttons.item(i).addEventListener('click', buttonListener);
}

// stores slider related DOM elements
const slider = document.getElementById('volume-slider');
const sliderValue = document.getElementById('volume-value');

// adjusts volume instantly when slider is moved
slider.addEventListener('input', function () {
  sliderValue.innerText = `${this.value}%`;
  pomodoro.adjustVolume(this.value);
});

// support for older browsers; adjusts volume when slider is released
slider.addEventListener('change', function () {
  sliderValue.innerText = `${this.value}%`;
  pomodoro.adjustVolume(this.value);
});


/* *********************
    VARIOUS USAGE FIXES
   ********************* */
// fix for iOS double tap zooms; prevents zoom in when pressing a button multiple times in a row
(function () {
  // stores timestamp of the last time screen was touched
  let lastTouch = 0;

  // resets lastTouch timestamp
  function resetPreventZoom() {
    lastTouch = 0;
  }

  // prevents the screen from zooming based on time, page movement, or number of fingers
  function preventZoom(event) {
    const time = event.timeStamp;
    const time2 = lastTouch || time;
    const timeDifference = time - time2;
    const fingers = event.touches.length;

    lastTouch = time;

    // if enough time has elapsed or multiple fingers touch the screen
    if (!timeDifference || timeDifference >= 300 || fingers > 1) {
      return;
    }

    resetPreventZoom();
    event.preventDefault();
    event.target.click();
  }

  document.addEventListener('touchstart', preventZoom, false);
  document.addEventListener('touchmove', resetPreventZoom, false);
}());
