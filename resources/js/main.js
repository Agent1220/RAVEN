//#region CLASSES

/**
 * A note used in the map. It traverses in `direction`, before hitting `cell` at the moment defined by `time`.
 * Optionally, if the head of a long note, `tailId` indicates the end point of the note.
 */
class Note {
    /**
     * The time in seconds (during the playback of the current song) on which the note must be pressed.
     * @type {number}
     */
    time;
    /**
     * The sequential ID (index) of the tailing note. If defined, this object is the head of a long note.
     * @type {number}
     */
    tailId;
    /**
     * The direction in which the note travels.
     * @type {number}
     */
    direction;
    /**
     * The cell on which the note appears.
     * @type {string}
     */
    cell;
    /**
     * TODO: something related to inter-beat snapping? used during rendering?
     * @type {number}
     */
    snap;

    /**
     * @param {number} time The time in seconds (during the playback of the current song) on which the note must be pressed.
     * @param {number} tailId The sequential ID (index) of the tailing note. If defined, this object is the head of a long note.
     * @param {number} direction The direction in which the note travels.
     * @param {string} cell The cell on which the note appears.
     * @param {number} snap TODO: something related to inter-beat snapping? used during rendering?
     */
    constructor(time, tailId, direction, cell, snap) {
        this.time = time;
        this.tailId = tailId;
        this.direction = direction;
        this.cell = cell;
        this.snap = snap;
    }
}

/**
 * A visual effect used in the map. It traverses in `direction`, before hitting `cell` at the moment defined by `time`.
 */
class Effect{
    /**
     * The time in seconds (during the playback of the current song) on which the effect will appear.
     * @type {number}
     */
    time;
    /**
     * The duration for which the effect will appear.
     * @type {number}
     */
    duration;
    /**
     * The direction the effect travels.
     * @type {number}
     */
    direction;
    /**
     * The cell on which the effect will appear.
     * @type {string}
     */
    cell;
    /**
     * TODO: 
     * @type {number}
     */
    opacity;

    /**
     * @param {number} time The time in seconds (during the playback of the current song) on which the effect will appear.
     * @param {number} duration The duration for which the effect will appear.
     * @param {number} direction The direction the effect travels.
     * @param {string} cell The cell on which the effect will appear.
     * @param {number} opacity TODO: 
     */
    constructor(time, duration, direction, cell, opacity){
        this.time = time;
        this.duration = duration;
        this.direction = direction;
        this.cell = cell;
        this.opacity = opacity;
    }

}

/**
 * Structure storing metadata for a given chart.
 */
class ChartMetadata{
    /**
     * The title of the charted song.
     * @type {string}
     */
    songName;
    /**
     * The name of the song's artist.
     * @type {string}
     */
    artist;
    /**
     * The genre of the charted song.
     * @type {string}
     */
    genre;
    /**
     * The BPM of the charted song.
     * @type {number}
     */
    bpm;
    /**
     * The name of the charter.
     * @type {string}
     */
    charter;
    /**
     * The grid type of the chart.
     * @type {string}
     */
    style;
    /**
     * TODO: my brain is not music enough to know what this means
     * @type {number}
     */
    scale;

    /**
     * @param {string} songName The title of the charted song.
     * @param {string} artist The name of the song's artist.
     * @param {string} genre The genre of the charted song.
     * @param {number} bpm The BPM of the charted song.
     * @param {string} charter The name of the charter.
     * @param {string} style The grid type of the chart.
     * @param {number} scale TODO: 
     */
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

/**
 * Structure containing playback-related metadata of a chart.
 */
class ChartHead{
    /**
     * The length of the chart in seconds.
     * @type {number}
     */
    length;
    /**
     * The starting BPM of the chart.
     * @type {number}
     */
    startingBpm;
    /**
     * TODO: the same as it is in beat saber?
     * @type {number}
     */
    offset;
    /**
     * The number of notes in the chart.
     * @type {number}
     */
    noteCount;
    /**
     * The grid type of the chart.
     * @type {string}
     */
    style;

    /**
     * @param {number} length The length of the chart in seconds.
     * @param {number} startingBpm The starting BPM of the chart.
     * @param {number} offset TODO: 
     * @param {number} noteCount The number of notes in the chart.
     * @param {string} style The grid type of the chart.
     */
    constructor(length, startingBpm, offset, noteCount, /*avgDensity,*/ style){
        this.length = length;
        this.startingBpm = startingBpm;
        this.offset = offset;
        this.noteCount = noteCount;
        //this.avgDensity = avgDensity;
        this.style = style;
    }
}

/**
 * A complete chart, ready to be exported.
 */
class Chart{
    /**
     * The metadata of the chart.
     * @type {ChartMetadata}
     */
    meta;
    /**
     * The playback information of the chart.
     * @type {ChartHead}
     */
    head;
    /**
     * The array of notes used in the chart.
     * @type {Note[]}
     */
    notes;
    /**
     * The array of effects used in the chart.
     * @type {Effect[]}
     */
    effects;

    /**
     * @param {ChartMetadata} meta The metadata of the chart.
     * @param {ChartHead} head The playback information of the chart.
     * @param {Note[]} notes The array of notes used in the chart.
     * @param {Effect[]} effects The array of effects used in the chart.
     */
    constructor(meta, head, notes, effects){
        this.meta = meta;
        this.head = head;
        this.notes = notes;
        this.effects = effects;
    }
}

//#endregion

//#region GLOBAL FIELDS

/**
 * True if CTRL is currently being pressed, otherwise false.
 * @type {boolean}
 */
var ctrlPressed = false;
/**
 * True if ALT is currently being pressed, otherwise false.
 * @type {boolean}
 */
var altPressed = false;

//#endregion



//#region GRID CONSTRUCTION, RESIZING, FITTING

/**
 * Resizes the DOM canvas to fit the size of the viewport.
 */
function setCanvasSize(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}

/**
 * Realigns all visual elements to fit the current size of the window / grid.
 */
function fixAlignments(){
    setCanvasSize();
    calculateGridPositions();
    realignNotePositions();
    realignLNBodies();
    drawAll();
}

/**
 * Cleans up the previous grid, then creates the HTML elements for the new editing grid, according to the type set by {@link dreaming} / {@link gridDimensions}
 */
function constructGrid(){
    deselectAll();
    removeFallenNotes();
    removeFallenEffects();
    
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

//#endregion

//#region WINDOW FUNCTIONS

/**
 * Toggles between fullscreen and windowed mode, realigning the visual elements to fit.
 */
async function toggleFullscreen(){
    if (await Neutralino.window.isFullScreen()){
        await Neutralino.window.exitFullScreen();
    } else {
        await Neutralino.window.setFullScreen();
    }
    fixAlignments();
}

/**
 * Closes the app.
 */
function closeWindow(){
    Neutralino.app.exit();
}

//#endregion

/**
 * Sets up all of the application's callbacks and event listeners.
 * Centrally, instead of in each individual source file.
 */
function setUpCallbacksAndListeners() {
    //Disables scroll wheel
    document.getElementById("body").addEventListener("wheel", (e)=>e.preventDefault(), {passive: false});

    //Window focus gain and loss
    window.addEventListener("focus", () => {altPressed = false; ctrlPressed = false;})
    window.addEventListener("blur", () => {altPressed = false; ctrlPressed = false;})

    //Chart loading
    document.getElementById("chartInput").addEventListener("change", function() {
        let chartURL = URL.createObjectURL(this.files[0]);
        fetch(chartURL)
            .then((response) => response.json())
                .then((data) => chartLoading(data),
                    (error) => console.log(error)
                );
        calculateGridPositions();
    });

    //Audio playback
    audio.addEventListener("timeupdate", updateProgressBar);

    //Audio loading
    document.getElementById("audioInput").addEventListener("change", async function() {
        audio.src = URL.createObjectURL(this.files[0]);
        progressBar.style.width = "0%";
        anchoredTime = 0;
    
        setAudioDuration();
    });
}

/**
 * Returns the current position of the cursor, relative to the window.
 * @param {MouseEvent} event The HTML DOM MouseEvent received from the HTML document.
 * @returns Anonymous structure `{x:number, y:number}`.
 */
function getMousePos(event){
    return {x:event.clientX, y:event.clientY};
}



window.onload = () => {
    let alIm = document.querySelectorAll("img");
    for (let iM of alIm){
        iM.setAttribute("draggable", "false");
    }

    setUpCallbacksAndListeners();

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


//NATIVE API
Neutralino.init();

//DO NOT DELETE THIS OR THE WINDOW WON'T CLOSE WITH THE CLOSE BUTTON
//AND YOU'LL HAVE TO KILL IT IN TASK MANAGER.
Neutralino.events.on("windowClose", closeWindow);