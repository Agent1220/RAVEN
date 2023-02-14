var currDirection = 2;
var eDir = 2;


var chartHead = new ChartHead(120,180,0,0,0,"5x3");
var chartMetadata = new ChartMetadata("Song Name","Artist","Genre",`${chartHead.startingBpm}BPM`,"Charter","DREAM","1"); 
var chartNotes = [];
var chartEffects = [];

var chartFile = new Chart(chartMetadata,chartHead,chartNotes,chartEffects);
/**
 *  direction explanation: the direction the note is COMING FROM, represented with a number. 
 *      up: 2, right: 3, down: 5, left: 7.
 *      if it's coming from multiple directions at once, 
 *      the number will be the product of numbers from those directions respectively.
 *      eg. 21 = 3*7, it's coming from the left and from the right      
 *      
 *      effects only have two directions: horizontal: 2, vertical 3.
 */

//input chart loading
document.getElementById("chartInput").addEventListener("change", function() {
    let chartURL = URL.createObjectURL(this.files[0]);
    fetch(chartURL)
        .then((response) => response.json())
            .then((data) => chartLoading(data),
                  (error) => console.log(error)
            );
});

function chartLoading(data){
    if (cId){
        selectAllNotes();
        deleteSelectedNotes();
    }
    //console.log(data);
    chartFile = data;
    console.log(`got chart file, beginning loading\n`,chartFile);
    chartMetadata = chartFile.meta;
    console.log("loaded chart metadata");
    chartHead = chartFile.head;
    console.log("loaded chart head");

    //minSec = convertToMinSec(chartHead.length);
    timeText.innerHTML = `0:00 / ${minSec}`;
    setSnapping();
    console.log("snapping set");

    audioOffset = chartHead.offset;
    document.getElementById("setOffset").value = audioOffset * 1000;
    console.log("audio offset set");

    document.getElementById("setBpm").value = chartHead.startingBpm;
    BPM = chartHead.startingBpm;
    nextStep = 60 / BPM * 4/snapping;
    console.log("bpm and snapping set");

    console.log("loading notes...");
    loadChartNotes(chartFile.notes);

    console.log("loading effects...");
    loadChartEffects(chartFile.effects);

    alert("Loaded chart!");
}

function loadChartNotes(inputNotes){
    if (inputNotes.length){
        chartNotes = [];
        cId = 0;
        flyingNotes = [];
        //longNoteConnections = [];
        console.log("nulled notes and counter");

        console.log("uncompressing");
        for (let i = 0; i < inputNotes.length; i++){
            if (inputNotes[i]){
                //longNoteConnections[i] = [];
                if (!(inputNotes[i].direction % 2)){
                    chartNotes.push(new Note(inputNotes[i].time,inputNotes[i].tailId,2,inputNotes[i].cell,inputNotes[i].snap));
                //longNoteConnections[i].push(`${inputNotes[i].tailId}`);
                }
                if (!(inputNotes[i].direction % 3)){
                    chartNotes.push(new Note(inputNotes[i].time,inputNotes[i].tailId,3,inputNotes[i].cell,inputNotes[i].snap));
                    //longNoteConnections[i].push(`${inputNotes[i].tailId}`);
                }
                if (!(inputNotes[i].direction % 5)){
                    chartNotes.push(new Note(inputNotes[i].time,inputNotes[i].tailId,5,inputNotes[i].cell,inputNotes[i].snap));
                    //longNoteConnections[i].push(`${inputNotes[i].tailId}`);
                }
                if (!(inputNotes[i].direction % 7)){
                    chartNotes.push(new Note(inputNotes[i].time,inputNotes[i].tailId,7,inputNotes[i].cell,inputNotes[i].snap));
                    //longNoteConnections[i].push(`${inputNotes[i].tailId}`);
                }
            } else {
                chartNotes.push(null);
            }
        }
        console.log("uncompressed");

        console.log("rendering notes...");
        if (!noteMode) switchMode();
        for (let n of chartNotes){
            console.log("attempting to add note...");
            addNote(n);
            console.log(cId);
        }
        deselectNotes();
        console.log("rendered notes");

        console.log("creating long notes");
        for (let n of flyingNotes){
            if (n){
                if (n.tailId != -1){

                    selectedNotes.push(n.id);
                    selectedNotes.push(flyingNotes[n.tailId].id);
                    makeLongNote(true);
                }
            }
        }
        console.log("created long notes");

        console.log("loaded notes");

    } else {
        console.log("there was nothing to load");
    }
}

function loadChartEffects(inputEffects){
    if (inputEffects.length){
        chartEffects = [];
        let l = inputEffects.length;
        for (let i = 0; i < l; i++){
            if (!(inputEffects[i].direction % 2)){
                chartEffects.push(inputEffects[i]);
            }
            if (!(inputEffects[i].direction % 3)){
                chartEffects.push(inputEffects[i]);
            }
        }

        flyingEffects = [];
        eId = 0;
        for (let e of chartEffects){
            renderEffects(e);
        }
        console.log("loaded effects");

    } else {
        console.log("there was nothing to load");
    }
}

async function saveChart(){
    var path;
    // var check = false;

    var exportable = constructChartFile();

    console.log(exportable);

    // await Neutralino.os.showSaveDialog("Save chart", {
    //     filters:[{name: "JSON", extensions: ["json"]}]
    // }).then(function(url){
    //             if (url){
    //                 path = `${url.split(".json")[0]}.json`; 
    //                 console.log("got url: " + path)
    //                 check = true;
    //             }
    //         },
    //         function(error){console.log(error); alert(`Error getting chart file location!\n\n${error.message}`);});
        let dataToWrite = JSON.stringify(exportable, undefined, 2);
        document.getElementById("savedChart").innerHTML = dataToWrite;
        alert("chart in thext form can be found in the bottom left text box. copy its contents to a text file then change the extension to .json");
    
        // await Neutralino.filesystem.writeFile(path, dataToWrite)
        //     .then(() => alert(`Saved to ${path}`),
        //     (error) => {alert(`Error saving chart file!\n\n${error.message}`); console.log(error.message)});
    


}

//time, tailId, direction, cell
function constructChartFile(){
    chartHead.startingBpm = BPM;
    let r = new Chart(
                new ChartMetadata(chartMetadata.songName,chartMetadata.artist,chartMetadata.genre,`${chartHead.startingBpm} BPM`,chartMetadata.charter,"DREAM",chartMetadata.scale),
                new ChartHead(audio.duration,chartHead.startingBpm,chartHead.offset,0,0,"5x3"),
                [],
                []);
    
    let noteC = 0;
    if (cId){
        let rawNotes = [];
        // this leaves holes. too bad!
        for (let n in flyingNotes){
            if (flyingNotes[n]){
                rawNotes[n] = new Note(flyingNotes[n].time,flyingNotes[n].tailId,flyingNotes[n].direction,flyingNotes[n].target.id,flyingNotes[n].snap);
                noteC++;
            } else {
                rawNotes[n] = null;
            }
        }

        r.notes = rawNotes;
    }

    //let effC = 0;
    let filteredEffects = [];
    if (eId) {
        for (let e of flyingEffects){
            if (e){
                filteredEffects.push(e);
                //effC++;
            }
        }
    }
    r.effects = filteredEffects;
    r.head.offset = audioOffset;
    r.head.noteCount = noteC;
    r.head.avgDensity = noteC / r.head.length;

    return r;
}

var rotIter = 1;
function changeDirection(){
    let deg = 90 * rotIter;

    dirC.style.transform = `rotate(${deg}deg)`;

    let a = [7,2,3,5];
    rotIter++;
    rotIter %= 4;
    currDirection = a[rotIter];
}

var eIter = 0;
function changeEffectDirection(){
    let a = [2,3,6];
    eIter++;
    eIter %= 3;
    eDir = a[eIter];

    eDirH.style.opacity = (eDir % 2) ? "0" : "1";
    eDirV.style.opacity = (eDir % 3) ? "0" : "1";
}

function switchMode(){
    if (noteMode){
        noteMode = false;
        document.getElementById("switchMode").innerHTML = "Mode: effect";

        document.getElementById("eSettings").style.display = "";
        dirC.style.display = "none";
        eDirC.style.display = "flex";
    } else {
        noteMode = true;
        document.getElementById("switchMode").innerHTML = "Mode: note";

        document.getElementById("eSettings").style.display = "none";
        dirC.style.display = "flex";
        eDirC.style.display = "none";
    }
}