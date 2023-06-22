//#region HTML REFERENCES ########################################################################

/**
 * Reference to the progress bar.
 * @type {HTMLElement}
 */
const progressBar = document.getElementById("progressBar");
/**
 * Reference to the text label of the audio progress bar.
 * @type {HTMLElement}
 */
const timeText = document.getElementById("timeText");

//#endregion

//#region AUDIO DESCRIPTORS ########################################################################

/**
 * Audio used by the editor.
 * @type {HTMLAudioElement}
 */
const audio = new Audio(); //the main audio

/**
 * The BPM (beats per minute) of the current chart.
 * @type {number}
 */
var BPM = 180;
/**
 * The fraction of the beat placed notes will snap to. eg. 4 means 1/4th beat.
 * @type {number}
 */
var snapping = 4;
/**
 * The distance between time snap places, in seconds.
 * @type {number}
 */
var nextStep = 60 / BPM * 4 / snapping;
/**
 * The total length of the used audio to display on the progress bar.
 * @type {string}
 */
var minSec = "";


//#endregion ########################################################################

//#region PLAYBACK VARIABLES ########################################################################

/**
 * Time (in seconds) to automatically seek to when the appropriate button (default: M) is pressed.
 * @type {number}
 */
var anchoredTime = 0;
/**
 * The offset between audio playback and chart playback.
 * TODO: which is delayed, the chart or the audio? 
 *      currently, neither, because I'm a fucking moron. but the chart is supposed to be delayed by this amount so it's synced with the song 
 * @type {number}
 */
var audioOffset = 0;

/**
 * Mousewheel speed multiplier.
 * @type {number}
 */
var mwheelSpeed = 1;

//#endregion ########################################################################



//#region PLAY, PAUSE, SEEK ########################################################################

/**
 * Plays/pauses the used audio.
 */
function playPauseAudio(){
    if (!audio.paused){
        stopAnim();
        audio.pause();
        //snapAudio();   
    } else {    
        //audio.currentTime;
        audio.play();
        animate();
    }   
}

/**
 * Stops audio playback and rewinds to the beginning.
 */
function stopAudio(){
    audio.pause();
    audio.currentTime = 0;
}

/**
 * Seeks the audio to the position indicated by the given click on the progress bar, or to the anchored time if the parameter is null.
 * @param {MouseEvent | null} event The HTML DOM MouseEvent sent by the HTML document, or null.
 */
function seekAudio(event){
    if (audio.duration && audio.duration != NaN){
        var percent;

        if (event){
            if (event.deltaY){
                percent = progressBar.style.width.split("%").shift();

                if (event.deltaY < 0){
                    audio.currentTime += Number(mwheelSpeed)/10;
                    percent = audio.currentTime/audio.duration * 100;
                } else {
                    audio.currentTime -= Number(mwheelSpeed)/10;
                    percent = audio.currentTime/audio.duration * 100;
                }
            } else {
                let parentProgBar = document.getElementById("progBarParent");
                percent = (event.offsetX / parentProgBar.offsetWidth) * 100;
                audio.currentTime = (audio.duration * percent) / 100;
            }

            if (percent <= 100 && percent >= 0){
                progressBar.style.width = `${percent}%`;
            }
            
            timeText.innerHTML = `${convertToMinSec(audio.currentTime)} / ${minSec}`;
            drawAll();
        } else {
            audio.currentTime = anchoredTime;
            snapAudio()
            percent = anchoredTime / audio.duration;
            progressBar.style.width = `${percent*100}%`;
            
            timeText.innerHTML = `${convertToMinSec(audio.currentTime)} / ${minSec}`;
            drawAll();
        }
    }
}

/**
 * Sets the anchor to the current audio position.
 */
function setAnchor(){
    let anchField = document.getElementById("setAnchor");
    anchoredTime = anchField.value;
}

/**
 * Skips the used audio to the next snapping step.
 * @param {boolean} fw True if the step should happen forward.
 */
function stepAudio(fw){
    if (fw){
        audio.currentTime = audio.currentTime + nextStep * mwheelSpeed;
    } else {
        if (audio.currentTime - nextStep * mwheelSpeed >= 0){
            audio.currentTime = audio.currentTime - nextStep * mwheelSpeed;
        }
    }
    drawAll();
}


/**
 * Sets the current playback time to the closest previous snapping step.
 */
function snapAudio(){
    if (audio.duration){
        if (0 <= audio.currentTime && audio.currentTime < audio.duration){
            let i = 0;
            let found = false;
            while (!found) {
                if (i*nextStep <= audio.currentTime && audio.currentTime <= (i+1)*nextStep) {
                    found = true;
                }
                i++;
            }
            if (found) audio.currentTime = (audio.currentTime - (i-1)*nextStep > i*nextStep - audio.currentTime) 
                                        ? Math.round(i*nextStep * 1000) * 0.001 - audioOffset
                                        : Math.round((i-1)*nextStep * 1000) * 0.001  - audioOffset;
            drawAll();
        }
    }
}

//#endregion

//#region PLAYBACK SPEED ########################################################################

/**
 * Sets the playback speed of the used audio.
 */
function setPlaybackSpeed(){
    audio.playbackRate = document.getElementById("setPlaybackSpeed").value;
}

/**
 * Decreases the playback speed of the used audio by 10% (additive), down to a minimum of 10%.
 */
function decreasePlaybackSpeed(){
    let element = document.getElementById("setPlaybackSpeed");
    if (Number(element.value) > 0.1){
        element.value = Math.round((Number(element.value) - 0.1)*10)/10;
        setPlaybackSpeed();
    }
}

/**
 * Increases the playback speed of the used audio by 10% (additive). Careful, as this isn't limited. 
 */
function increasePlaybackSpeed(){
    let element = document.getElementById("setPlaybackSpeed");
    element.value = Math.round((Number(element.value) + 0.1)*10)/10;
    setPlaybackSpeed();
}

//#endregion

//#region DESCRIPTORS, SETTINGS ########################################################################

/**
 * Sets the length of the used audio.
 */
function setAudioDuration(){
    audio.currentTime = 0;
    seekAudio({"offsetX":0});

    timeText.innerHTML = "Loading...";
    do {
	    setTimeout(()=>{
            if (audio.duration != NaN) {
                minSec = convertToMinSec(audio.duration);
                timeText.innerHTML = `0:00 / ${minSec}`;
            }
	    }, 100);
    } while (audio.duration == NaN);
    chartHead.length = audio.duration;
}

/**
 * Sets the BPM of the chart, then snaps the audio according to the new BPM.
 */
function setBpm(){
    BPM = document.getElementById("setBpm").value;
    nextStep = 60 / BPM * 4/snapping;
    snapAudio();
}

/**
 * Sets the snapping interval.
 */
function setSnapping(){
    snapping = document.getElementById("setSnapping").value;  
    nextStep = 60 / BPM * 4/snapping;
}

/**
 * Sets the audio offset of the chart.
 * TODO: audio offset doesn't work lol
 */
function setOffset(){
    audioOffset = document.getElementById("setOffset").value / 1000;
    snapAudio();
}

//#endregion ########################################################################

//#region PLAYBACK TIME ########################################################################

/**
 * Copies the timestamp of the current audio position to the clipboard.
 */
function copyTime(){
    navigator.clipboard.writeText(audio.currentTime);
}

/**
 * Converts the given audio timestamp to `min:sec` format.
 * @param {number} t The position of the played audio to convert.
 */
function convertToMinSec(t){
    let min = Math.floor(t/60);
    let sec = Math.floor(t - min * 60);
    sec = (sec < 10) ? `0${sec}` : sec;
    return `${min}:${sec}`;
}

//#endregion

//#region NOTE REALIGNMENT ########################################################################

/**
 * Moves the selected notes, including LNs, forwards or backwards in time by a single step.
 * @param {boolean} forward True if the move should be forwards, false if backwards.
 */
function moveNotesTime(forward){
    for (let s of selectedNotes){
        let step = (forward) ? flyingNotes[s].time + nextStep 
                            : flyingNotes[s].time - nextStep > 0 ?  flyingNotes[s].time - nextStep
                            : flyingNotes[s].time;
        flyingNotes[s].time = step;
        flyingNotes[s].snap = snapping;

        for (const c of canvasObjects) {
            if (c.id == s) {
                step = (forward) ? flyingNotes[c.tail].time + nextStep 
                                : flyingNotes[c.tail].time - nextStep > 0 ?  flyingNotes[c.tail].time - nextStep
                                : flyingNotes[c.tail].time;

                flyingNotes[c.tail].time = step;
                flyingNotes[c.tail].snap = snapping;

                c.time = flyingNotes[c.id].time;
                c.snap = flyingNotes[c.id].snap;
            } else if (c.tail == s){
                step = (forward) ? flyingNotes[c.id].time + nextStep 
                : flyingNotes[c.id].time - nextStep > 0 ?  flyingNotes[c.id].time - nextStep
                : flyingNotes[c.id].time;

                flyingNotes[c.id].time = step;
                flyingNotes[c.id].snap = snapping;

                c.time = flyingNotes[c.id].time;
                c.snap = flyingNotes[c.id].snap;
            }
        }
    }
    checkPairs();
}

/**
 * Returns the closest previous snapping step's time in the audio given in `time`, according to the song's BPM and the given `snap` snapping.
 * @param {number} time The time in the audio to align.
 * @param {number} snap The snapping to snap the time to.
 * @returns 
 */
function snapTime(time, snap){
    let i = 0;
    let found = false;
    let step = 60 / BPM * 4 / snap;
    //console.log(`attempting to snap ${time} to ${snap} (step: ${step})`);

    while (!found && (i+1)*step < audio.duration) {
        //console.log(i, i*step,(i+1)*step);
        if (i*step <= time && time <= (i+1)*step) {
            found = true;
        }
        i++;
    }

    if (found) time = (time - (i-1)*step > i*step - time) 
                                ? Math.round(i*step * 10000) * 0.0001
                                : Math.round((i-1)*step * 10000) * 0.0001;
    else {console.error("Failed to snap time!")};

    return time;
}

/**
 * Updates the notes' position in time to fit onto the snapping steps.
 */
function realignNoteTimes(){
    for (let n in flyingNotes){
        if (flyingNotes){
            n.time = snapTime(n.time, n.snap);
        }
    }
}

//#endregion ########################################################################



/**
 * Updates the audio progress bar with the current completion percentage and time.
 */
function updateProgressBar(){
    let percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + "%";
    timeText.innerHTML = `${convertToMinSec(audio.currentTime)} / ${minSec}`;
}

/**
 * Sets the mousewheel speed multiplier.
 */
function setMwheelSpeed(){
    mwheelSpeed = document.getElementById("setMwheelSpeed").value;
}
