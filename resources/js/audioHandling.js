var audio = new Audio(); //the main audio
var progressBar = document.getElementById("progressBar");
var anchoredTime = 0;
var mwheelSpeed = 1;
var minSec = "";
var timeText = document.getElementById("timeText");
var snapping = 4;
var audioOffset = 0;

var BPM = 180;
var nextStep = 60 / BPM * 4/snapping;

function updateProgressBar(){
    let percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + "%";
    timeText.innerHTML = `${convertToMinSec(audio.currentTime)} / ${minSec}`;
}
audio.addEventListener("timeupdate", updateProgressBar);

//add listener for audio input
document.getElementById("audioInput").addEventListener("change", async function() {
    audio.src = URL.createObjectURL(this.files[0]);
    progressBar.style.width = "0%";
    anchoredTime = 0;

    setAudioDuration();
});

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

function setBpm(){
    BPM = document.getElementById("setBpm").value;
    nextStep = 60 / BPM * 4/snapping;
    snapAudio();
}

function setOffset(){
    audioOffset = document.getElementById("setOffset").value / 1000;
    snapAudio();
}

function setPlaybackSpeed(){
    audio.playbackRate = document.getElementById("setPlaybackSpeed").value;
}

function decreasePlaybackSpeed(){
    let element = document.getElementById("setPlaybackSpeed");
    if (Number(element.value) > 0.1){
        element.value = Math.round((Number(element.value) - 0.1)*10)/10;
        setPlaybackSpeed();
    }
}

function increasePlaybackSpeed(){
    let element = document.getElementById("setPlaybackSpeed");
    element.value = Math.round((Number(element.value) + 0.1)*10)/10;
    setPlaybackSpeed();
}

function setSnapping(){
    snapping = document.getElementById("setSnapping").value;  
    nextStep = 60 / BPM * 4/snapping;
}

function setMwheelSpeed(){
    mwheelSpeed = document.getElementById("setMwheelSpeed").value;
}

function convertToMinSec(t){
    let min = Math.floor(t/60);
    let sec = Math.floor(t - min * 60);
    sec = (sec < 10) ? `0${sec}` : sec;
    return `${min}:${sec}`;
}

function playPauseAudio(m){
    if (!audio.paused){
        stopAnim();
        audio.pause();
        snapAudio();   
    } else {    
        audio.currentTime;
        audio.play();
        animate();
    }   
}
function stopAudio(){
    audio.pause();
    audio.currentTime = 0;
}

function seekAudio(event){
    if (audio.duration && audio.duration != NaN){
        var percent;

        if (event){
            if (event.deltaY){
                // if (event.deltaY < 0){
                //     if (+percent - mwheelSpeed <= 0){
                //         percent = 0;
                //     } else {
                //         percent = +percent - mwheelSpeed;
                //     }
                // } else {
                //     if (+percent + mwheelSpeed >= 100){
                //         percent = 100;
                //     } else {
                //         percent = +percent + mwheelSpeed;
                //     }
                // }
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

            //snapAudio();
            if (percent <= 100 && percent >= 0){
                progressBar.style.width = `${percent}%`;
            }
            
            timeText.innerHTML = `${convertToMinSec(audio.currentTime)} / ${minSec}`;
            updatePositions();
        } else {
            if (audio.duration) {
                audio.currentTime = anchoredTime;
                snapAudio()
                percent = anchoredTime / audio.duration;
                progressBar.style.width = `${percent*100}%`;
                
                timeText.innerHTML = `${convertToMinSec(audio.currentTime)} / ${minSec}`;
                updatePositions();
            }
        }
    }
}

function stepAudio(fw){
    if (fw){
        audio.currentTime = audio.currentTime + nextStep * mwheelSpeed;
    } else {
        if (audio.currentTime - nextStep * mwheelSpeed >= 0){
            audio.currentTime = audio.currentTime - nextStep * mwheelSpeed;
        }
    }
    //snapAudio();
    updatePositions();
}

function copyTime(){
    navigator.clipboard.writeText(audio.currentTime);
}

function setAnchor(){
    let anchField = document.getElementById("setAnchor");
    anchoredTime = anchField.value;
}

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
            updatePositions();
        }
    }
}

function moveNotesTime(forward){
    for (let s of selectedNotes){
        for (let n of flyingNotes){
            if (n){
                if (n.id == s){
                    let step = (forward) ? n.time + nextStep 
                    : n.time - nextStep > 0 ?  n.time - nextStep
                    : n.time;
                    n.time = step;
                    n.snap = snapping;
                }

                for (let c of canvasObjects){
                    if (c.id == n.id){ //if head of LN
                        let step = (forward) ? c.time + nextStep 
                        : c.time - nextStep > 0 ?  c.time - nextStep
                        : c.time;
                        c.time = step;
                        c.snap = snapping;
                    }
                }
            }
        }
    }
    updatePositions();
}

function snapTime(time, snap){
    let i = 0;
    let found = false;
    let step = 60 / BPM * 4/snap;
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

function realignNoteTimes(){
    for (let n in flyingNotes){
        if (flyingNotes){
            n.time = snapTime(n.time, n.snap);
        }
    }
}