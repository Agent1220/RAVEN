
var animationId;

var cId = 0; //note count
var flyingNotes = [];
var selectedNotes = []; //stores note ids 0

var eId = 0; //effect count
var flyingEffects = [];
var selectedEffects = [];

var curEDur = 1;
var opacity1 = 0;
var opacity2 = 1;
var eRolling = false;

//var noteLandingEffect = false;

var scrollSpeed = 400;

const LNOffset = {"head":{"x":8,"y":128},
                  "tail":{"x":128,"y":8}};
var noteOffset = {"x":0,"y":-19.75};
var visOffset = {"x":4, "y":-37};
var checkOffset = {"vertical":{"x":4,"y":118},
                   "horizontal":{"x":96,"y":20}};
                   
var gridPositions = [];
var effectImages = [{"v":"doc", "h":"doc"}];
var explosions = [];
var backLights = [];
                   
var topControlsElement = document.getElementById("topControls");
var dirC = document.getElementById("dirChanger");
var eDirC = document.getElementById("eDir");
var eDirV = document.getElementById("eDirV");
var eDirH = document.getElementById("eDirH");


var cnvC = 0;
var canvasObjects = []; //[{"x":0,"y":0,"h":0,"w":0,"time":0,"id":0,"direction":0}];
var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
ctx.fillStyle = "rgba(128,128,128,1)";
ctx.strokeStyle = "rgba(128,128,128,1)";
var inactiveOpacity = 0.1;
var noteColours = {"primary":{"r":128, "g":128, "b":128, "a":1},
                   "secondary":{"r":128, "g":200, "b":200, "a":1}};
// var fill = {"active":`rgba(${noteColours.r},${noteColours.g},${noteColours.b},${noteColours.a})`,
//             "inactive":`rgba(${noteColours.r},${noteColours.g},${noteColours.b},${inactiveOpacity})`};


var noteMode = true;

var tolerance = 0.015;

function calculateGridPositions(){
    gridPositions = [];
    let gpi = gridDimensions.rows;
    while (gpi--) {
        let gpj = gridDimensions.cols;
        let row = [];
        while (gpj--) {
            let target = document.getElementById(`i${gpi}${gpj}`).getBoundingClientRect();
            row.unshift({"x":target.left+noteOffset.x,"y":target.top+noteOffset.y});
        }
        gridPositions.unshift(row);
    }
}

function getCells(){
    explosions = [];
    let i = gridDimensions.rows;
    while (i--){
        let j = gridDimensions.cols;
        let row = [];
        while (j--){
            row.unshift({"cell":document.getElementById(`s${i}${j}`),"fire":false});
        }
        explosions.unshift(row);
    }
}

function getEffectImages(){
    effectImages = [];
    backLights = [];

    let gpi = gridDimensions.rows;
    while (gpi--) {
        let gpj = gridDimensions.cols;
        let row = [];
        let grow = [];
        while (gpj--) {
            let target = {
               "v":document.getElementById(`v${gpi}${gpj}`),
               "h":document.getElementById(`h${gpi}${gpj}`)
            }

            imgOpsTo0(gpi, gpj);

            
            row.unshift(target);
            
            let grad = {
                "img": document.getElementById(`g${gpi}${gpj}`),
                "times":[] // time, by
            };

            grow.unshift(grad);
        }
        effectImages.unshift(row);
        backLights.unshift(grow);
    }
}

function imgOpsTo0(gpi, gpj){
    document.getElementById(`v${gpi}${gpj}`).style.opacity = "0";
    document.getElementById(`h${gpi}${gpj}`).style.opacity = "0";
    document.getElementById(`b${gpi}${gpj}`).style.opacity = "0";
    document.getElementById(`g${gpi}${gpj}`).style.opacity = "0";
}

function setScrollSpeed(){
    scrollSpeed = document.getElementById("setScrollSpeed").value;
    updatePositions();
}

function setEffectDuration(){
    curEDur = Number(document.getElementById("setEffectDuration").value);
}

function setEffectOpacity(){
    opacity2 = Number(document.getElementById("setEffectOpacity2").value);
    opacity1 = Number(document.getElementById("setEffectOpacity1").value);
}

function setEffectRolling(){
    eRolling = document.getElementById("effectRolling").toggleAttribute("checked");
}

// function setLandingEffect(){
//     noteLandingEffect = document.getElementById("landingEffect").toggleAttribute("checked");
// }

function toggleMetadataMenu(){
    let metaDiv = document.getElementById("metadataSettings");

    metaDiv.style.display = (metaDiv.style.display) ? "" : "none";
    //metaDiv.style.display = setTo;
}

function setNoteColours(act){
    let colourValues = {"r":document.getElementById("redValue").value,
                        "g":document.getElementById("greenValue").value,
                        "b":document.getElementById("blueValue").value,
                        "a":document.getElementById("alphaValue").value / 100}
    switch (act) {
        // case -1: // reset
        //     for (const s of selectedNotes) {
        //         flyingNotes[s].colour.r = noteColours.r;
        //         flyingNotes[s].colour.g = noteColours.g;
        //         flyingNotes[s].colour.b = noteColours.b;
        //     }
        //     break;
        
        case 1: // primary
            noteColours.primary.r = colourValues.r;
            noteColours.primary.g = colourValues.g;
            noteColours.primary.b = colourValues.b;
            noteColours.primary.a = colourValues.a;
            break;
        case 0: // secondary
            noteColours.secondary.r = colourValues.r;
            noteColours.secondary.g = colourValues.g;
            noteColours.secondary.b = colourValues.b;
            noteColours.secondary.a = colourValues.a;
            break;
    
        default:
            console.log("wrong note colour act");
            break;
    }
    updatePositions();
}

function checkClick(event){
    const coords = getMousePos(event);
    const correctedCoords = {"x":coords.x + noteOffset.x,"y":coords.y + noteOffset.y};
    let cell;
    
    let noteclick = false;
    let note;

    if (cId){
        let i = 0;
        while (!noteclick && i < flyingNotes.length){
            if (flyingNotes[i]){
                let notePos = drawNote(flyingNotes[i]);
                //console.log("note pos:",notePos);
                let size;

                switch (flyingNotes[i].direction) {
                    case 2:
                        size = {"x":248,"y":64};
                        if (notePos.x <= coords.x - checkOffset.vertical.x && coords.x - checkOffset.vertical.x <= notePos.x + size.x
                            && notePos.y <= coords.y - checkOffset.vertical.y && coords.y - checkOffset.vertical.y <= notePos.y + size.y){
                                note = flyingNotes[i];
                                noteclick = true;
                                //console.log("found note:",note);  
                            }
                        break;
                    case 3:
                        size = {"x":64,"y":248};
                        if (notePos.x <= coords.x - checkOffset.horizontal.x && coords.x - checkOffset.horizontal.x <= notePos.x + size.x
                            && notePos.y <= coords.y - checkOffset.horizontal.y && coords.y - checkOffset.horizontal.y <= notePos.y + size.y){
                                note = flyingNotes[i];
                                noteclick = true;
                                //console.log("found note:",note);  
                            }
                        break;
                    case 5: 
                        size = {"x":248,"y":64};
                        if (notePos.x <= coords.x - checkOffset.vertical.x && coords.x - checkOffset.vertical.x <= notePos.x + size.x
                            && notePos.y <= coords.y - checkOffset.vertical.y && coords.y - checkOffset.vertical.y <= notePos.y + size.y){
                                note = flyingNotes[i];
                                noteclick = true;
                                //console.log("found note:",note);  
                            }
                        break;                        
                    case 7:
                        size = {"x":64,"y":248};
                        if (notePos.x <= coords.x - checkOffset.horizontal.x && coords.x - checkOffset.horizontal.x <= notePos.x + size.x
                            && notePos.y <= coords.y - checkOffset.horizontal.y && coords.y - checkOffset.horizontal.y <= notePos.y + size.y){
                                note = flyingNotes[i];
                                noteclick = true;
                                //console.log("found note:",note);  
                            }
                        break;           
                    default:
                        break;
                }
            }
            i++;
        }
    }

    if (!note) {
        let i = gridDimensions.rows;
        while (i-- && !cell){
            let j = gridDimensions.cols;
            while (j-- && !cell){
                if (gridPositions[i][j].x <= correctedCoords.x && correctedCoords.x <= gridPositions[i][j].x + 256
                 && gridPositions[i][j].y <= correctedCoords.y && correctedCoords.y <= gridPositions[i][j].y + 256){
                    cell = `${i}${j}`;
                }
            }
        }
    }

    if (noteclick){
        setSelectedNotes(note);
    } else if (cell){
        if (noteMode){
            addNote(new Note(audio.currentTime,-1,currDirection,cell,snapping));
        } else {
            setSelectedEffects(cell);
        }
        
    }
}

function realignNotePositions(){
    for (const n of flyingNotes) {
        if (n) {
            let inds = n.target.id.split("");
            let tgt = gridPositions[inds[0]][inds[1]];
            n.target.x = tgt.x;
            n.target.y = tgt.y;
        }
    }
}

function noteObject(x,y,dir){
    switch (dir){
        case 2:
            ctx.beginPath();
            ctx.moveTo(8 + x, 96 + y);//topleft
            ctx.lineTo(128 + x, 128 + y);//top mid
            ctx.lineTo(248 + x, 96 + y);//top right
            ctx.lineTo(248 + x, 128 + y); //bottom right
            ctx.lineTo(128 + x, 160 + y);//bottom mid
            ctx.lineTo(8 + x, 128 + y);//bottom left
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 3:
            ctx.beginPath();
            ctx.moveTo(256-96 + x,256-8 + y);//topleft
            ctx.lineTo(256-128 + x,256-128 + y);//top mid
            ctx.lineTo(256-96 + x,256-248 + y);//top right
            ctx.lineTo(256-128 + x,256-248 + y); //bottom right
            ctx.lineTo(256-160 + x,256-128 + y);//bottom mid
            ctx.lineTo(256-128 + x,256-8 + y);//bottom left
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 5:
            ctx.beginPath();
            ctx.moveTo(256-8 + x, 256-96 + y);//topleft
            ctx.lineTo(256-128 + x, 256-128 + y);//top mid
            ctx.lineTo(256-248 + x, 256-96 + y);//top right
            ctx.lineTo(256-248 + x, 256-128 + y); //bottom right
            ctx.lineTo(256-128 + x, 256-160 + y);//bottom mid
            ctx.lineTo(256-8 + x, 256-128 + y);//bottom left
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 7:
            ctx.beginPath();
            ctx.moveTo(96 + x, 8 + y);//topleft
            ctx.lineTo(128 + x, 128 + y);//top mid
            ctx.lineTo(96 + x, 248 + y);//top right
            ctx.lineTo(128 + x, 248 + y); //bottom right
            ctx.lineTo(160 + x, 128 + y);//bottom mid
            ctx.lineTo(128 + x, 8 + y);//bottom left
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        default:
            console.error("direction machine broke (noteObject)");
    }
}

function checkPairs(){
    for (let i = 0; i < flyingNotes.length; i++) {
        if (flyingNotes[i] && flyingNotes[i].tail == false) {
            flyingNotes[i].primary = true;
            let found = false;
            for (let j = 0; j < flyingNotes.length; j++){
                if (flyingNotes[j] && j != i) {
                    if (flyingNotes[i].time == flyingNotes[j].time) {
                        if (flyingNotes[j].tail == false) {
                            found = true;
                        }
                    } 
                }
            }
            if (found){
                flyingNotes[i].primary = false;
                if (flyingNotes[flyingNotes[i].tailId]) flyingNotes[flyingNotes[i].tailId].primary = false;
            }
            
        }
    }
    updatePositions();
}

function addNote(note){
    if (note)
    {
        //console.log("deseleccting notes...");
        deselectNotes();
        //console.log("deselected");

        
        let inds = note.cell.split("");
        let target = gridPositions[inds[0]][inds[1]];
        //console.log("created target info");

        let pack = {
            "id":cId,
            "time":snapTime(note.time, note.snap),
            "direction":note.direction,
            "target":{"x":target.x,"y":target.y,"id":note.cell},
            "tailId":note.tailId,
            "tail":false,
            "selected":true,
            "snap":note.snap,
            "primary": true
        };
        pack.draw = (x,y) => noteObject(x,y,note.direction);



        flyingNotes.push(pack);
        selectedNotes.push(cId);
        backLights[inds[0]][inds[1]].times.push({"time":pack.time,"by":pack.id});
        //longNoteConnections[cId] = flyingNotes[cId].tailId; 
        cId++;

        if (altPressed){
            let ePack = {"time":snapTime(audio.currentTime - (240 / BPM), 2),
                            "direction":(!(note.direction % 2) || !(note.direction % 5)) ? 2 : 3,
                            "duration":1,
                            "target":`${note.cell}`,
                            "opacity1": 0,
                            "opacity2": 1,
                            "id":`e${eId}`,
                            "snap":2};
                flyingEffects.push(ePack);
                eId++;

            // ePack = {"time":snapTime(audio.currentTime + (120 / BPM) ,2),
            //                 "direction":(!(note.direction % 2) || !(note.direction % 5)) ? 2 : 3,
            //                 "duration":1,
            //                 "target":`${note.cell}`,
            //                 "opacity1": 1,
            //                 "opacity2": 0,
            //                 "id":`e${eId}`,
            //                 "snap":2};
            //     flyingEffects.push(ePack);
            //     eId++;
        }
        
        //setSelectedNotes(flyingNotes[cId]);
        checkPairs();
    } else {
        //console.log("pushing null to notes");
        flyingNotes.push(null);
        //longNoteConnections.push(-1); 
        cId++;
    }
}

function setSelectedNotes(note){
    if (noteMode){
        if (!ctrlPressed){
            deselectNotes();
        }
        
        var cango = true;
        for (let i = 0; i < selectedNotes.length; i++) {
            if (note.id == selectedNotes[i]){
                cango = false;
            } 
        }
        
        if (cango){
            selectedNotes.push(note.id);
            note.selected = true;
            updatePositions();
        }
    }
}

function updatePositions(){
    if (cId){
        redrawCanvas();
        for (let n of flyingNotes){
            if (n){
                //moveNote(n);
                drawNote(n);
            }
        }
        if (audio.paused){
            for (let i of explosions){
                for (let j of i){
                    j.fire = false;
                }
            }
            for (const r of backLights) {
                for (const c of r) {
                    c.img.style.opacity = `${0}`;
                }
            }
        } else {
            fireExplosions();
            checkBackLights();
        }
    }
    if (eId){
        if (audio.paused) resetEffects();
        for (let i = 0; i < eId; i++){
            if (flyingEffects[i]){
                //console.log("updating effect");
                updateEffect(flyingEffects[i]);
            }
        }
    }
}

function drawNote(note){
    let timeUntilLand = audio.currentTime - note.time;
    let x = note.target.x;
    let y = note.target.y;
    let ids = note.target.id.split("");

    switch (note.direction) {
        case 2:
            y = note.target.y + (timeUntilLand * scrollSpeed); 
            if (-256 <= y && y <= canvas.height){
                let rgba = (note.primary) ? {"r": noteColours.primary.r,"g": noteColours.primary.g,"b": noteColours.primary.b,"a": noteColours.primary.a}
                                          : {"r": noteColours.secondary.r,"g": noteColours.secondary.g,"b": noteColours.secondary.b,"a": noteColours.secondary.a};

                if (timeUntilLand <= 0.1){
                    let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a - (timeUntilLand * (rgba.a - inactiveOpacity))/ 0.1})`;
                    ctx.strokeStyle = fillStroke;
                    ctx.fillStyle = fillStroke;
                } else {
                    let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${inactiveOpacity})`;
                    ctx.strokeStyle = fillStroke;
                    ctx.fillStyle = fillStroke;
                }
                if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                    explosions[ids[0]][ids[1]].fire = true;
                }
                note.draw(note.target.x, y);

                if (note.selected){
                    ctx.strokeStyle = `rgba(255,255,255,1)`;
                    ctx.strokeRect(8 + note.target.x, 96 + y,240, 64);
                }
            }
            break;
        case 3:
            x = note.target.x - (timeUntilLand * scrollSpeed); 
            if (-256 <= x && x <= note.target.x + canvas.width/2){
                let rgba = (note.primary) ? {"r": noteColours.primary.r,"g": noteColours.primary.g,"b": noteColours.primary.b,"a": noteColours.primary.a}
                                          : {"r": noteColours.secondary.r,"g": noteColours.secondary.g,"b": noteColours.secondary.b,"a": noteColours.secondary.a};
                let fadeinTreshold = note.target.x + canvas.width/2 - scrollSpeed*0.1;
                    if (fadeinTreshold < x){
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a - (x - fadeinTreshold)/(scrollSpeed*0.1)})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    } else if (timeUntilLand <= 0.1){
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a - (timeUntilLand * (rgba.a - inactiveOpacity))/ 0.1})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    } else {
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${inactiveOpacity})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    note.draw(x,note.target.y);

                    if (note.selected){
                        ctx.strokeStyle = `rgba(255,255,255,1)`;
                        ctx.strokeRect(256-96 + x,256-8 + note.target.y,-64,-240);
                    }
               }
            break;
        case 5:
            y = note.target.y - (timeUntilLand * scrollSpeed); 
            if (-256 <= y && y <= canvas.height){
                let rgba = (note.primary) ? {"r": noteColours.primary.r,"g": noteColours.primary.g,"b": noteColours.primary.b,"a": noteColours.primary.a}
                                          : {"r": noteColours.secondary.r,"g": noteColours.secondary.g,"b": noteColours.secondary.b,"a": noteColours.secondary.a};
                    if (timeUntilLand <= 0.1){
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a - (timeUntilLand * (rgba.a - inactiveOpacity))/ 0.1})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    } else {
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${inactiveOpacity})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    note.draw(note.target.x, y);

                    if (note.selected){
                        ctx.strokeStyle = `rgba(255,255,255,1)`;
                        ctx.strokeRect(256-8 + note.target.x, 256-96 + y,-240,-64);
                    }
               }
            break;
        case 7:
            x = note.target.x + (timeUntilLand * scrollSpeed); 
            if (note.target.x - canvas.width/2 <= x && x <= canvas.width){
                let rgba = (note.primary) ? {"r": noteColours.primary.r,"g": noteColours.primary.g,"b": noteColours.primary.b,"a": noteColours.primary.a}
                                          : {"r": noteColours.secondary.r,"g": noteColours.secondary.g,"b": noteColours.secondary.b,"a": noteColours.secondary.a};
                let fadeinTreshold = note.target.x - canvas.width/2 + scrollSpeed*0.1;
                    if (fadeinTreshold > x){
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a - (-x + fadeinTreshold)/(scrollSpeed*0.1)})`
                        ctx.strokeStyle = fillStroke; 
                        ctx.fillStyle = fillStroke;
                    } 
                    else if (timeUntilLand <= 0.1){
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a - (timeUntilLand * (rgba.a - inactiveOpacity))/ 0.1})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    } 
                    else {
                        let fillStroke = `rgba(${rgba.r},${rgba.g},${rgba.b},${inactiveOpacity})`;
                        ctx.strokeStyle = fillStroke;
                        ctx.fillStyle = fillStroke;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    note.draw(x,note.target.y);

                    if (note.selected){
                        ctx.strokeStyle = `rgba(255,255,255,1)`;
                        ctx.strokeRect(96 + x, 8 + note.target.y, 64,240);
                    }
               }
            break;
            
        default:
            console.log("direction machine broke")
            break;
    }
    return {"x":x,"y":y}
}

function renderEffects(effect){
    if (effect == 0 || effect == 1){
        if (eRolling){
            snapAudio();
            let rollCount = selectedEffects.length;
            for (let i of selectedEffects){
                let pack = {"time":audio.currentTime - rollCount*nextStep,
                            "direction":eDir,
                            "duration":curEDur,
                            "target":`${i}`,
                            "opacity1": 1 - effect,
                            "opacity2": effect,
                            "id":`e${eId}`,
                            "snap":snapping};
                flyingEffects.push(pack);
                eId++;
                rollCount--;
            }
        } else {
            for (let i of selectedEffects){
                let pack = {"time":snapTime(audio.currentTime,snapping),
                            "direction":eDir,
                            "duration":curEDur,
                            "target":`${i}`,
                            "opacity1": 1 - effect,
                            "opacity2": effect,
                            "id":`e${eId}`,
                            "snap":snapping};
                flyingEffects.push(pack);
                eId++;
            }
        }
        for (let e of selectedEffects){
            document.getElementById(`b${e}`).style.opacity = 0;
        }
        selectedEffects = [];
    } else if (effect) {
        let pack = {"time":effect.time,
                    "direction":effect.direction,
                    "duration":effect.duration,
                    "target":effect.target,
                    "opacity1":effect.opacity1,
                    "opacity2":effect.opacity2,
                    "id":`e${eId}`,
                    "snap":effect.snap};
        flyingEffects.push(pack);
        eId++;
    }
    //console.log("added effect",flyingEffects[-1]);
    updatePositions();
}

function resetEffects(){
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 5;j++){
            effectImages[i][j].v.style.opacity = 0;
            effectImages[i][j].h.style.opacity = 0;
        }
    }
}

function makeLongNote(pass){
    if (pass || selectedNotes.length == 2){
        let firstNote = flyingNotes[selectedNotes[0]];
        let secondNote = flyingNotes[selectedNotes[1]];

        if (pass || (firstNote.target.id == secondNote.target.id
          && firstNote.direction == secondNote.direction
          && firstNote.time != secondNote.time)){
            if (firstNote.time > secondNote.time){
                let t = firstNote;
                firstNote = secondNote;
                secondNote = t;

                t = selectedNotes[0];
                selectedNotes[0] = selectedNotes[1];
                selectedNotes[1] = t;
            }
            
            deselectNotes();

            switch (firstNote.direction) {
                case 2:
                    firstNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(248 + x, 128 + y); //bottom right
                        ctx.lineTo(128 + x, 160 + y);//bottom mid
                        ctx.lineTo(8 + x, 128 + y);//bottom left
                        ctx.fill();
                        ctx.stroke();
                    }
                    secondNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(8 + x, 96 + y);//topleft
                        ctx.lineTo(128 + x, 128 + y);//top mid
                        ctx.lineTo(248 + x, 96 + y);//top right
                        ctx.lineTo(248 + x, 128 + y); //bottom right
                        ctx.lineTo(8 + x, 128 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    break;
                case 3:
                    firstNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(256-128 + x,256-248 + y); //bottom right
                        ctx.lineTo(256-160 + x,256-128 + y);//bottom mid
                        ctx.lineTo(256-128 + x,256-8 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    secondNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(256-96 + x,256-8 + y);//topleft
                        ctx.lineTo(256-128 + x,256-128 + y);//top mid
                        ctx.lineTo(256-96 + x,256-248 + y);//top right
                        ctx.lineTo(256-128 + x,256-248 + y); //bottom right
                        ctx.lineTo(256-128 + x,256-8 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    break;
                case 5:
                    firstNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(256-248 + x, 256-128 + y); //bottom right
                        ctx.lineTo(256-128 + x, 256-160 + y);//bottom mid
                        ctx.lineTo(256-8 + x, 256-128 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    secondNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(256-8 + x, 256-96 + y);//topleft
                        ctx.lineTo(256-128 + x, 256-128 + y);//top mid
                        ctx.lineTo(256-248 + x, 256-96 + y);//top right
                        ctx.lineTo(256-248 + x, 256-128 + y); //bottom right
                        ctx.lineTo(256-8 + x, 256-128 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    break;
                case 7:
                    firstNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(128 + x, 248 + y); //bottom right
                        ctx.lineTo(160 + x, 128 + y);//bottom mid
                        ctx.lineTo(128 + x, 8 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    secondNote.draw = (x,y) =>{
                        ctx.beginPath();
                        ctx.moveTo(96 + x, 8 + y);//topleft
                        ctx.lineTo(128 + x, 128 + y);//top mid
                        ctx.lineTo(96 + x, 248 + y);//top right
                        ctx.lineTo(128 + x, 248 + y); //bottom right
                        ctx.lineTo(128 + x, 8 + y);//bottom left
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    break;
            
                default:
                    console.log("direction broke while creating LN");
                    break;
            }
            tileLNBody(firstNote,secondNote);
            firstNote.tailId = secondNote.id;
           
            //longNoteConnections[firstNote.id] = secondNote.id;
            updatePositions();
        } else {
            console.log("not matching notes");
        }


    } else {
        console.log("not 2 notes");
    }
}

function realignLNBodies(){
    for (const c of canvasObjects) {
        if (c) {
            switch (c.direction) {
                case 2:
                case 5:
                    c.x = flyingNotes[c.id].target.x + LNOffset.head.x;
                    c.y = flyingNotes[c.id].target.y + LNOffset.head.y;
                    break;
                case 3:
                case 7:
                    c.x = flyingNotes[c.id].target.x + LNOffset.tail.x;
                    c.y = flyingNotes[c.id].target.y + LNOffset.tail.y;
                    break;
            
                default:
                    break;
            }
        }
    }
}

function tileLNBody(head, tail){
    var tilingLength = `${tail.time - head.time}`;
    switch (head.direction) {
        case 2:
            //ctx.fillRect(head.target.x+1, head.target.y + LNOffset.head.y,246,0.5-tilingLength);
            canvasObjects.push({"x":head.target.x + LNOffset.head.x, 
                                         "y":head.target.y + LNOffset.head.y, 
                                         "w":240, 
                                         "h":-tilingLength,
                                        "time":snapTime(head.time, head.snap),
                                        "id":head.id,
                                        "tail":tail.id,
                                        "direction":2,
                                        "snap":head.snap});
            cnvC++;
            break;
        case 3:
            //ctx.fillRect(head.target.x + LNOffset.tail.x, head.target.y + LNOffset.tail.y,tilingLength,246);
            canvasObjects.push({"x":head.target.x + LNOffset.tail.x, 
                                         "y":head.target.y + LNOffset.tail.y, 
                                         "w":tilingLength, 
                                         "h":240,
                                        "time":snapTime(head.time, head.snap),
                                        "id":head.id,
                                        "tail":tail.id,
                                        "direction":3,
                                        "snap":head.snap});
            cnvC++;
            break;
        case 5:
            //ctx.fillRect(head.target.x+1, head.target.y + LNOffset.head.y,246,tilingLength);
            canvasObjects.push({"x":head.target.x + LNOffset.head.x, 
                                         "y":head.target.y + LNOffset.head.y, 
                                         "w":240, 
                                         "h":tilingLength,
                                        "time":snapTime(head.time, head.snap),
                                        "id":head.id,
                                        "tail":tail.id,
                                        "direction":5,
                                        "snap":head.snap});
            cnvC++;
            break;
        case 7:
            //ctx.fillRect(head.target.x + LNOffset.tail.x, head.target.y + LNOffset.tail.y,-tilingLength,246);
            canvasObjects.push({"x":head.target.x + LNOffset.tail.x, 
                                         "y":head.target.y + LNOffset.tail.y, 
                                         "w":-tilingLength, 
                                         "h":240,
                                        "time":snapTime(head.time, head.snap),
                                        "id":head.id,
                                        "tail":tail.id,
                                        "direction":7,
                                        "snap":head.snap});
            cnvC++;
            break;
        default:
            return console.error("longnope");
    }
    tail.tail = true;
    tail.primary = head.primary;
    checkPairs();
}

function updateEffect(effect){ 
    let timeUntilFire =  audio.currentTime - effect.time;
    let inds = effect.target.split("");
    let snap = 60 / BPM * 4 / effect.snap;
    if (-tolerance <= timeUntilFire && timeUntilFire <= (effect.time + effect.duration * snap) + tolerance){
        if (!(effect.direction % 2)){
            //console.log(timeUntilFire, effect.opacity/(effect.duration));
            effectImages[inds[0]][inds[1]].h.style.opacity = `${effect.opacity1 - (timeUntilFire * (effect.opacity1 - effect.opacity2))/(effect.duration * snap)}`;
        }
        if (!(effect.direction % 3)){
            //console.log(timeUntilFire, effect.opacity, (effect.duration));
            effectImages[inds[0]][inds[1]].v.style.opacity = `${effect.opacity1 - (timeUntilFire * (effect.opacity1 - effect.opacity2))/(effect.duration * snap)}`;
        }
    }
}

function redrawCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (cnvC){
        for (d of canvasObjects){
            if (d != null){
                let timeUntilLand = audio.currentTime - d.time;
                switch (d.direction) {
                    case 2:
                        if (timeUntilLand <= 0) {
                            let rgba = (flyingNotes[d.id].primary) ? `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${noteColours.primary.a})`
                                                                   : `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${noteColours.secondary.a})`;
                            ctx.fillStyle = rgba;
                            ctx.fillRect(d.x,d.y+timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                  
                        } else {
                            if ((d.h+timeUntilLand)*scrollSpeed <= 0){
                                let rgbi, rgba;
                                
                                if (flyingNotes[d.id].primary) {
                                    rgba = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${noteColours.primary.a})`;
                                    rgbi = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${inactiveOpacity})`;
                                } else {
                                    rgba = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${noteColours.secondary.a})`;
                                    rgbi = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${inactiveOpacity})`;
                                }
                                ctx.fillStyle = rgba;
                                ctx.fillRect(d.x,d.y,d.w,(d.h+timeUntilLand)*scrollSpeed);

                                let grd = ctx.createLinearGradient(d.x,d.y,d.x,d.y + 0.1*scrollSpeed);
                                grd.addColorStop(0, rgba);
                                grd.addColorStop(1, rgbi);
                                ctx.fillStyle = grd;
                                
                                ctx.fillRect(d.x,d.y+timeUntilLand*scrollSpeed,d.w,-timeUntilLand*scrollSpeed);                  
                            }else {
                                let rgbi = (flyingNotes[d.id].primary) ? `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${inactiveOpacity})`
                                                                       : `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${inactiveOpacity})`;
                                ctx.fillStyle = rgbi;
                                ctx.fillRect(d.x,d.y+timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                      
                            }
                        }
                        break;
                    case 3: 
                        if (-256 < d.x-timeUntilLand*scrollSpeed + d.w*scrollSpeed && -timeUntilLand*scrollSpeed < canvas.width/2 + 256){
                            let rgba, rgbi, rgb0;
                            if (flyingNotes[d.id].primary) {
                                rgba = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${noteColours.primary.a})`;
                                rgbi = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${inactiveOpacity})`;
                                rgb0 = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${0})`;
                            } else {
                                rgba = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${noteColours.secondary.a})`;
                                rgbi = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${inactiveOpacity})`;
                                rgb0 = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${0})`;
                            }

                            let grd = ctx.createLinearGradient(d.x - 0.1*scrollSpeed,d.y,d.x + canvas.width/2,d.y);
                            let grdLength = canvas.width/2 + 0.1*scrollSpeed;
                            grd.addColorStop(0, rgbi);
                            grd.addColorStop(0.1*scrollSpeed/grdLength, rgba);
                            grd.addColorStop((canvas.width/2)/grdLength,rgba);
                            grd.addColorStop(1,rgb0);

                            ctx.fillStyle = grd;
                            ctx.fillRect(d.x-timeUntilLand*scrollSpeed,d.y,d.w*scrollSpeed,d.h);
                        }
                        break;
                    case 5:
                        if (timeUntilLand <= 0) {
                            let rgba = (flyingNotes[d.id].primary) ? `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${noteColours.primary.a})`
                                                                   : `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${noteColours.secondary.a})`;
                            ctx.fillStyle = rgba;
                            ctx.fillRect(d.x,d.y-timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                  
                        } else {
                            if ((-d.h+timeUntilLand)*scrollSpeed <= 0){
                                let rgbi, rgba;
                                
                                if (flyingNotes[d.id].primary) {
                                    rgba = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${noteColours.primary.a})`;
                                    rgbi = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${inactiveOpacity})`;
                                } else {
                                    rgba = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${noteColours.secondary.a})`;
                                    rgbi = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${inactiveOpacity})`;
                                }
                                ctx.fillStyle = rgba;
                                ctx.fillRect(d.x,d.y,d.w,(d.h-timeUntilLand)*scrollSpeed);

                                let grd = ctx.createLinearGradient(d.x,d.y,d.x,d.y - 0.1*scrollSpeed);
                                grd.addColorStop(0, rgba);
                                grd.addColorStop(1, rgbi);
                                ctx.fillStyle = grd;
                                
                                ctx.fillRect(d.x,d.y-timeUntilLand*scrollSpeed,d.w,timeUntilLand*scrollSpeed);                  
                            }else {
                                let rgbi = (flyingNotes[d.id].primary) ? `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${inactiveOpacity})`
                                                                       : `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${inactiveOpacity})`;
                                ctx.fillStyle = rgbi;
                                ctx.fillRect(d.x,d.y-timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                      
                            }
                        }
                        break;
                    case 7:
                        if (d.x+timeUntilLand*scrollSpeed < canvas.width - d.w*scrollSpeed) {
                            let rgba, rgbi, rgb0;
                            if (flyingNotes[d.id].primary) {
                                rgba = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${noteColours.primary.a})`;
                                rgbi = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${inactiveOpacity})`;
                                rgb0 = `rgba(${noteColours.primary.r},${noteColours.primary.g},${noteColours.primary.b},${0})`;
                            } else {
                                rgba = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${noteColours.secondary.a})`;
                                rgbi = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${inactiveOpacity})`;
                                rgb0 = `rgba(${noteColours.secondary.r},${noteColours.secondary.g},${noteColours.secondary.b},${0})`;
                            }

                            let grd = ctx.createLinearGradient(d.x + 0.1*scrollSpeed,d.y,d.x - canvas.width/2,d.y);
                            let grdLength = canvas.width/2 + 0.1*scrollSpeed;
                            grd.addColorStop(0, rgbi);
                            grd.addColorStop(0.1*scrollSpeed/grdLength, rgba);
                            grd.addColorStop((canvas.width/2)/grdLength,rgba);
                            grd.addColorStop(1,rgb0);

                            ctx.fillStyle = grd;
                            ctx.fillRect(d.x+timeUntilLand*scrollSpeed,d.y,d.w*scrollSpeed,d.h);
                        }
                        break;
                    
                    default:
                        console.log("direction machine broke")
                        break;
                }
            }
        }
    }
}

function fireExplosions(){
    let i = gridDimensions.rows;
    while (i--){
        let j = gridDimensions.cols;
        while (j--){
            if (explosions[i][j].fire){
                explosions[i][j].fire = false;
                fireExplosion(explosions[i][j].cell);
            }
        }
    }
}

function fireExplosion(cell){
    // I don't trust this
    // let iter = 0;
    // let intId = setInterval(() => {
    //     let xpos = -261 * iter;
    //     //console.log(xpos);
    //     cell.style.backgroundPosition = `${xpos}px 0px`;
    //     if (++iter >= 5) {
    //         clearInterval(intId);
    //     }; 
    // }, 33);

    setTimeout(() => {
        cell.style.objectPosition = `${-261 * 1}px 0px`;
        setTimeout(() => {
            cell.style.objectPosition = `${-261 * 1}px 0px`;
            setTimeout(() => {
                cell.style.objectPosition = `${-261 * 2}px 0px`;
                setTimeout(() => {
                    cell.style.objectPosition = `${-261 * 3}px 0px`;
                    setTimeout(() => {
                        cell.style.objectPosition = `${-261 * 4}px 0px`;
                        setTimeout(() => {
                            cell.style.objectPosition = `${-261 * 5}px 0px`;
                        }, 33);
                    }, 33);
                }, 33);
            }, 33);
        }, 33);
    }, 33);
}

function checkBackLights(){
    for (const r of backLights) {
        for (const c of r) {
            let op = 0;
            if (c.times.length > 0) {
                for (const i of c.times) {
                    if (i.time - 120/BPM <= audio.currentTime && audio.currentTime <= i.time) {
                        op++;
                    }
                }
            }
            c.img.style.opacity = `${op}`;
        }
    }
}
                        
function animate(){
    updatePositions();
    //fireExplosions();
    animationId = requestAnimationFrame(animate);
}

function stopAnim(){
    cancelAnimationFrame(animationId);
}

function revertNote(note){
    if (note){
        switch (note.direction){
            case 2:
                note.draw = (x,y) => {
                    ctx.beginPath();
                    ctx.moveTo(8 + x, 96 + y);//topleft
                    ctx.lineTo(128 + x, 128 + y);//top mid
                    ctx.lineTo(248 + x, 96 + y);//top right
                    ctx.lineTo(248 + x, 128 + y); //bottom right
                    ctx.lineTo(128 + x, 160 + y);//bottom mid
                    ctx.lineTo(8 + x, 128 + y);//bottom left
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                break;
            case 3:
                note.draw = (x,y) => {
                    ctx.beginPath();
                    ctx.moveTo(256-96 + x,256-8 + y);//topleft
                    ctx.lineTo(256-128 + x,256-128 + y);//top mid
                    ctx.lineTo(256-96 + x,256-248 + y);//top right
                    ctx.lineTo(256-128 + x,256-248 + y); //bottom right
                    ctx.lineTo(256-160 + x,256-128 + y);//bottom mid
                    ctx.lineTo(256-128 + x,256-8 + y);//bottom left
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                break;
            case 5:
                note.draw = (x,y) => {
                    ctx.beginPath();
                    ctx.moveTo(256-8 + x, 256-96 + y);//topleft
                    ctx.lineTo(256-128 + x, 256-128 + y);//top mid
                    ctx.lineTo(256-248 + x, 256-96 + y);//top right
                    ctx.lineTo(256-248 + x, 256-128 + y); //bottom right
                    ctx.lineTo(256-128 + x, 256-160 + y);//bottom mid
                    ctx.lineTo(256-8 + x, 256-128 + y);//bottom left
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
               break;
            case 7:
                note.draw = (x,y) => {
                    ctx.beginPath();
                    ctx.moveTo(96 + x, 8 + y);//topleft
                    ctx.lineTo(128 + x, 128 + y);//top mid
                    ctx.lineTo(96 + x, 248 + y);//top right
                    ctx.lineTo(128 + x, 248 + y); //bottom right
                    ctx.lineTo(160 + x, 128 + y);//bottom mid
                    ctx.lineTo(128 + x, 8 + y);//bottom left
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                break;

            default:
                console.log("direction broke while reverting note");
                break;
        }

        //console.log("searching for:",note.id);
        for (let c = 0; c < canvasObjects.length; c++){
            if (canvasObjects[c].id == note.id){
                canvasObjects.splice(c,1);
                //console.log("found it!");
            }
        }
        note.tail = false;
        updatePositions();
    }
}

function deleteSelectedNotes(){
    if (noteMode){
        for (let s of selectedNotes){
            for (let n of flyingNotes){
                if (n){
                    if (flyingNotes[s].id == n.tailId){
                        revertNote(n);
                    }
                }
            }
            if (flyingNotes[s].tailId != -1) {
                revertNote(flyingNotes[s]);
                revertNote(flyingNotes[flyingNotes[s].tailId]);
            }

            let ids = flyingNotes[s].target.id.split("");
            backLights[ids[0]][ids[1]].times.splice(backLights[ids[0]][ids[1]].times.findIndex((item) => {return item.by == s}));

            flyingNotes[s] = null;
        }
        selectedNotes = [];
        updatePositions();
    } else {
        deleteSelectedEffects();
    }
}

function deleteSelectedEffects(){
    var indsToRevert =  [];
    for (let i = 0; i < eId; i++){
        if (flyingEffects[i]){
            if (flyingEffects[i].time <= audio.currentTime 
            && audio.currentTime <= flyingEffects[i].time + flyingEffects[i].duration){
                for (let s of selectedEffects){
                    //console.log(flyingEffects[i]);
                    if (flyingEffects[i] && s == flyingEffects[i].target){
                        indsToRevert.push({"direction":flyingEffects[i].direction,"target":flyingEffects[i].target})
                        flyingEffects[i] = null;
                    }
                }
            }
        }
    }
    for (let e of indsToRevert){
        let inds = e.target.split("");
        if (!(e.direction % 2)){
            effectImages[inds[0]][inds[1]].h.style.opacity = 0;
        }
        if (!(e.direction % 3)){
            effectImages[inds[0]][inds[1]].v.style.opacity = 0;
        }
    }
    updatePositions();
    for (let e of selectedEffects){
        document.getElementById(`b${e}`).style.opacity = 0;
    }
    selectedEffects = [];
}

function deselectNotes(){
    if (noteMode){
        if (selectedNotes.length){
            for (let n of selectedNotes){
                flyingNotes[n].selected = false;
            }
            selectedNotes = [];
        }
        updatePositions();
    } else {
        if (selectedEffects){
            for (let n of selectedEffects){
                document.getElementById(`b${n}`).style.opacity = "0";
            }
            selectedEffects = [];
        }
    }
}

function setSelectedEffects(cell){
    if (!ctrlPressed){
        deselectNotes(selectedEffects);
    }

    var cango = true;
        for (let i = 0; i < selectedEffects.length; i++) {
            if (cell == selectedEffects[i]){
                cango = false;
            } 
        }
    
    if (cango){
        selectedEffects.push(cell);
        document.getElementById(`b${cell}`).style.opacity = "1";
    }
}


function selectAllNotes(){
    if (noteMode){
        deselectNotes();
        for (let n of flyingNotes){
            if (n){
                n.selected = true;
                selectedNotes.push(n.id);
            }
        }
        updatePositions();
    } else {
        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 5; j++){
                setSelectedEffects(`${i}${j}`)
            }
        }
    }
}


function toggleUI(){
    if (topControlsElement.style.display == "none"){
        topControlsElement.style.display = "";
    } else {
        topControlsElement.style.display = "none";
    }
}

function showcase(){
    if (audio.duration != NaN){
        audio.pause();
        topControlsElement.style.display = "none";
        inactiveOpacity = 0;
        playPauseAudio();
    }
}

function stopShowcase(){
    if (audio.duration != NaN){
        topControlsElement.style.display = "";
        inactiveOpacity = 0.1;
        stopAudio();
    }
}
