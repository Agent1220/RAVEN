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
    constructGrid();

    // getEffectImages();
    // getCells();
    document.getElementById("body").setAttribute("onresize","calculateGridPositions()")
    document.getElementById("eDir").style.display = "none";
    document.getElementById("eSettings").style.display = "none";

    setCanvasSize();
    
    // setTimeout(calculateGridPositions, 1000);
}

window.addEventListener("focus", () => {altPressed = false; ctrlPressed = false;})
window.addEventListener("blur", () => {altPressed = false; ctrlPressed = false;})

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

function constructGrid(){
    deselectNotes();
    removeFallenNotes();
    
    let tableBody = document.getElementById("table");
    tableBody.innerHTML = "";

    for (let i = 0; i < gridDimensions.rows; i++) {
        let r = document.createElement("tr");
        for (let j = 0; j < gridDimensions.cols; j++) {
            const images = {
                "explSprite":document.createElement("img"),
                "cellBg":document.createElement("img"),
                "effectV":document.createElement("img"),
                "effectH":document.createElement("img"),
                "borderLight":document.createElement("img"),
                "bgRad":document.createElement("img")
            }
        
            images.explSprite.src = "img/expl_sprite.png";
            images.cellBg.src = "img/cell_background.png";
            images.effectV.src = "img/effect_v.png";
            images.effectH.src = "img/effect_h.png";
            images.borderLight.src = "img/cell_border_light.png";
            images.bgRad.src = "img/g_rad.png";
        
            images.explSprite.style = "z-index: 15; position: fixed; overflow: hidden; object-fit: none; object-position: -1305px 0; width: 256px; height: 256px;";
            images.cellBg.style = "z-index: 1;";
            images.effectV.style = "z-index: 4; position: absolute; left: 2.5px; top: 1px;";
            images.effectH.style = "z-index: 4; position: absolute; left: 2.5px; top: 1px;";
            images.borderLight.style = "z-index: 4; position: absolute; left: 2.5px;";
            images.bgRad.style = "z-index: 1; position: absolute; left: 2.5px; pointer-events: none;";
        
            let c = document.createElement("td");
            c.id = `c${i}${j}`;

            images.explSprite.id = `s${i}${j}`;
            images.cellBg.id = `i${i}${j}`;
            images.effectV.id = `v${i}${j}`;
            images.effectH.id = `h${i}${j}`;
            images.borderLight.id = `b${i}${j}`;
            images.bgRad.id = `g${i}${j}`;

            
            c.appendChild(images.explSprite);
            c.appendChild(images.cellBg);
            c.appendChild(images.effectV);
            c.appendChild(images.effectH);
            c.appendChild(images.borderLight);
            c.appendChild(images.bgRad);
            
            r.appendChild(c);
        }
        tableBody.appendChild(r);
    }

    for (let i = 0; i < gridDimensions.rows; i++) {
        for (let j = 0; j < gridDimensions.cols; j++) {
            imgOpsTo0(i,j);
        }
    }

    getEffectImages();
    getCells();
    calculateGridPositions();
    
    fixAlignments();
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