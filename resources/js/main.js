// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library

//CLASSES
class Note{
    constructor(time, tailId, direction, cell,snap){
        this.time = time;
        this.cell = cell;
        this.direction = direction;
        this.tailId = tailId;
        //this.id = id;
        this.snap = snap;
    }
}

class Effect{
    constructor(time, duration, direction, cell, opacity){
        this.time = time;
        this.duration = duration;
        this.direction = direction;
        this.cell = cell;
        this.opacity = opacity;
    }
}

class ChartMetadata{
    constructor(songName, artist, genre, bpm, charter, style, scale){
        this.songName = songName;
        this.artist = artist;
        this.bpm = bpm;
        this.genre = genre;
        this.charter = charter;
        this.style = style;
        this.scale = scale;
    }
}

class ChartHead{
    constructor(length, startingBpm, offset,noteCount,/*avgDensity,*/style){
        this.length = length;
        this.startingBpm = startingBpm;
        this.offset = offset;
        this.noteCount = noteCount;
        //this.avgDensity = avgDensity;
        this.style = style;;
    }
}

class Chart{
    constructor(meta, head, notes, effects){
        this.meta = meta;
        this.head = head;
        this.notes = notes;
        this.effects = effects;
    }
}

var ctrlPressed = false;
var altPressed = false;

//this just makes sure none of the images are draggable
let alIm = document.querySelectorAll("img");
for (let iM of alIm){
    iM.setAttribute("draggable", "false");
}

document.getElementById("body").addEventListener("wheel", (e)=>e.preventDefault(),{passive: false});

window.onload = () => {
    document.getElementById("body").style.display = "";
    getEffectImages();
    getCells();
    document.getElementById("body").setAttribute("onresize","calculateGridPositions()")
    document.getElementById("eDir").style.display = "none";
    document.getElementById("eSettings").style.display = "none";

    setCanvasSize();
    
    setTimeout(calculateGridPositions, 1000);
}

function setCanvasSize(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}

function getMousePos(event){
    return {x:event.clientX, y:event.clientY};
}

function fixAlignments(){
    setCanvasSize();
    calculateGridPositions();
    realignNotePositions();
    realignLNBodies();
    updatePositions();
}

//NATIVE API
Neutralino.init();

async function toggleFullscreen(){
    if (await Neutralino.window.isFullScreen()){
        await Neutralino.window.exitFullScreen();
    } else {
        await Neutralino.window.setFullScreen();
    }
    fixAlignments();
}

//DO NOT DELETE THIS OR THE WINDOW WON'T CLOSE WITH THE CLOSE BUTTON
//AND YOU'LL HAVE TO KILL IT IN TASK MANAGER.
Neutralino.events.on("windowClose", () => {
    closeWindow();
});

function closeWindow(){
    Neutralino.app.exit();
}