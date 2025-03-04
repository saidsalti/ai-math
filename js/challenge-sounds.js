// Sound effects for the challenge system

const ChallengeAudio = {
    soundEffects: {},

    // Initialize all sound effects
    init: function() {
        this.loadSounds({
            correct: 'assets/sounds/correct.mp3',
            wrong: 'assets/sounds/wrong.mp3',
            click: 'assets/sounds/click.mp3',
            levelUp: 'assets/sounds/level-up.mp3',
            countdown: 'assets/sounds/countdown.mp3',
            complete: 'assets/sounds/complete.mp3'
        });
    },

    // Load sound files
    loadSounds: function(soundFiles) {
        for (let key in soundFiles) {
            this.soundEffects[key] = new Audio(soundFiles[key]);
        }
    },

    // Play a sound effect
    play: function(soundName) {
        if (this.soundEffects[soundName]) {
            this.soundEffects[soundName].currentTime = 0;
            this.soundEffects[soundName].play().catch(e => {
                console.log('Audio play prevented:', e);
            });
        }
    }
};

// Make globally available
window.ChallengeAudio = ChallengeAudio;
