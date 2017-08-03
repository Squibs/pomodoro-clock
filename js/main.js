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
    this.focusAudio = new Audio('../media/focus.wav');
    this.restAudio = new Audio('../media/rest.wav');
  }

  // formats the time into appropriate format (h:mm:ss)
  static formatTime(secs) {
    let result = '';
    const seconds = secs % 60;
    const minutes = parseInt(secs / 60, 10) % 60;
    const hours = parseInt(secs / 3600, 10);

    // adds the leading '0' for minutes and seconds (hh:mm)
    const addLeadingZeroes = function (time) {
      return time < 10 ? `0${time}` : time;
    };

    // if there is an hour add that first otherwise add minutes and seconds with leading zeroes
    if (hours > 0) result += `${hours}:`;
    result += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`;
    return result;
  }

  // adds / subtracts 60 seconds from the focus time
  changeFocusTime(str) {
    // can only change focus time if timer is not active
    if (this.active === false) {
      this.reset();

      // if the passed string is 'add' add a minute; if over 60 reset to 1 by subtracting 60
      if (str === 'add') {
        this.focusTime += 60;
      } else if (this.focusTime > 60) {
        this.focusTime -= 60;
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

      // if the passed string is 'add' add a minute; if over 60 reset to 1 by subtracting 60
      if (str === 'add') {
        this.restTime += 60;
      } else if (this.restTime > 60) {
        this.restTime -= 60;
      }

      // display the restTime
      this.displayRestTime();
    }
  }

  // displays the current time on the DOM
  displayCurrentTime() {
    // format the time and display it in DOM
    document.getElementById('clockTime').innerText = Pomodoro.formatTime(this.currentTime);

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

    // change the current value of the progres bar coincide with the time remaining
    progressBar.setAttribute('value', 100 - parseInt((this.currentTime / this.startTime) * 100, 10));
  }

  // displays the focus time (how long the focus sessions will last) on the DOM
  displayFocusTime() {
    document.getElementById('focus').innerText = `${parseInt(this.focusTime / 60, 10)} min`;
  }

  // displays the rest time (how long the rest sessions will last) on the DOM
  displayRestTime() {
    document.getElementById('rest').innerText = `${parseInt(this.restTime / 60, 10)} min`;
  }

  // displays current iteration number for the focus timer
  displayFocusCount() {
    // stores the focus count DOM element
    const count = document.getElementById('focus-count');

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
    const timerButton = document.getElementById('time-start');

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
        this.focusAudio.play();
      }

      // creates a timer with intervals of 1 second and calls stepDown() every interval
      this.timer = setInterval(() => {
        this.stepDown();
      }, 1000);

      // change timer active state
      this.active = true;
    }
  }

  // handles time operations; happens on every interval
  stepDown() {
    // if the current time is greater than 0
    if (this.currentTime > 0) {
      // subtract one from the current time and the updated time
      this.currentTime -= 1;
      this.displayCurrentTime();

      if (this.currentTime === 0) {
        // if the current time is 0 and the timer type is 'focus'
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
      }
    }
  }

  // adjusts the volume of the alarms (value comes from slider)
  adjustVolume(volume) {
    this.focusAudio.volume = (volume / 100);
    this.restAudio.volume = (volume / 100);
  }

  // plays the focus audio clip to test volume levels when 'preview sond' button is pressed
  volumeTest() {
    this.focusAudio.play();
  }

  // resets the pomodoro clock
  reset() {
    // clear the timer interval; set variables to defaults
    clearInterval(this.timer);
    this.active = false;
    this.type = 'focus';
    this.currentTime = this.focusTime;
    this.focusCount = 0;

    // change start button text; display now default times
    document.getElementById('time-start').innerText = 'Start';
    this.displayCurrentTime();
    this.displayFocusTime();
    this.displayFocusCount();
  }
}

// creates a pomodoro class object
const pomodoro = new Pomodoro();
console.log(pomodoro);

// replace placeholder DOM values
pomodoro.displayCurrentTime();
pomodoro.displayFocusTime();
pomodoro.displayRestTime();
pomodoro.displayFocusCount();
pomodoro.adjustVolume(50);

// handles what methods get called depending on which button is pressed
const buttonListener = function () {
  console.log('click');
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
      pomodoro.reset();
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
