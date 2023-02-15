
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
var fill = {"active":"rgba(128,128,128,1)","inactive":`rgba(128,128,128,${inactiveOpacity})`};

var noteMode = true;

var tolerance = 0.015;

function calculateGridPositions(){
    gridPositions = [];
    let gpi = 3;
    while (gpi--) {
        let gpj = 5;
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
    let i = 3;
    while (i--){
        let j = 5;
        let row = [];
        while (j--){
            row.unshift({"cell":document.getElementById(`s${i}${j}`),"fire":false});
        }
        explosions.unshift(row);
    }
}

function getEffectImages(){
    effectImages = [];
    let gpi = 3;
    while (gpi--) {
        let gpj = 5;
        let row = [];
        while (gpj--) {
            let target = {
               "v":document.getElementById(`v${gpi}${gpj}`),
               "h":document.getElementById(`h${gpi}${gpj}`)
            }

            document.getElementById(`v${gpi}${gpj}`).style.opacity = "0";
            document.getElementById(`h${gpi}${gpj}`).style.opacity = "0";
            document.getElementById(`b${gpi}${gpj}`).style.opacity = "0";
            
            row.unshift(target);
        }
        effectImages.unshift(row);
    }
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

function toggleMetadataMenu(){
    let metaDiv = document.getElementById("metadataSettings");

    metaDiv.style.display = (metaDiv.style.display) ? "" : "none";
    //metaDiv.style.display = setTo;
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
        let i = 3;
        while (i-- && !cell){
            let j = 5;
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
            "selected":true,
            "snap":note.snap
        }
        
        switch (note.direction){
            case 2:
                pack.draw = (x,y) => {
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
                pack.draw = (x,y) => {
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
                pack.draw = (x,y) => {
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
                pack.draw = (x,y) => {
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
                console.log("direction broke while creating note");
                break;
        }

        flyingNotes.push(pack)
        selectedNotes.push(cId);
        //longNoteConnections[cId] = flyingNotes[cId].tailId; 
        cId++;
        
        //setSelectedNotes(flyingNotes[cId]);
        updatePositions();
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
        } else fireExplosions();
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
            if (-256 <= y && y <= canvas.height  + 256){
                    if (timeUntilLand <= 0.1){
                        ctx.strokeStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                        ctx.fillStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    } else {
                        ctx.strokeStyle = `rgba(128,128,128,${inactiveOpacity})`;
                        ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    // let grd = ctx.createLinearGradient(note.target.x,note.target.y,note.target.x,note.target.y - 0.2*scrollSpeed);
                    // grd.addColorStop(0, fill.active);
                    // grd.addColorStop(1, fill.inactive);
                    // ctx.fillStyle = grd;
                    // ctx.strokeStyle = grd;
                    note.draw(note.target.x, y);

                    if (note.selected){
                        ctx.strokeRect(8 + note.target.x, 96 + y,240, 64);
                    }
               }
            break;
        case 3:
            x = note.target.x - (timeUntilLand * scrollSpeed); 
            if (-256 <= x && x <= canvas.width/2   + 256){
                    if (timeUntilLand <= 0.1){
                        ctx.strokeStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                        ctx.fillStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    } else {
                        ctx.strokeStyle = `rgba(128,128,128,${inactiveOpacity})`;
                        ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    note.draw(x,note.target.y);

                    if (note.selected){
                        ctx.strokeRect(256-96 + x,256-8 + note.target.y,-64,-240);
                    }
               }
            break;
        case 5:
            y = note.target.y - (timeUntilLand * scrollSpeed); 
            if (-256 <= y && y <= canvas.height  + 256){
                    if (timeUntilLand <= 0.1){
                        ctx.strokeStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                        ctx.fillStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    } else {
                        ctx.strokeStyle = `rgba(128,128,128,${inactiveOpacity})`;
                        ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    note.draw(note.target.x, y);

                    if (note.selected){
                        ctx.strokeRect(256-8 + note.target.x, 256-96 + y,-240,-64);
                    }
               }
            break;
        case 7:
            x = note.target.x + (timeUntilLand * scrollSpeed); 
            if (-256 <= x && x <= canvas.width/2   + 256){
                    if (timeUntilLand <= 0.1){
                        ctx.strokeStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                        ctx.fillStyle = `rgba(128,128,128,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    } else {
                        ctx.strokeStyle = `rgba(128,128,128,${inactiveOpacity})`;
                        ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                    }
                    if (!explosions[ids[0]][ids[1]].fire && -tolerance <= timeUntilLand && timeUntilLand <= tolerance){
                        explosions[ids[0]][ids[1]].fire = true;
                    }
                    // ctx.fillStyle = "rgba(128,128,128,1)";
                    //ctx.strokeStyle = `rgba(255,255,255,${1 - (timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                    
                    note.draw(x,note.target.y);

                    if (note.selected){
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
    if (!effect){
        for (let i of selectedEffects){
            let pack = {"time":snapTime(audio.currentTime,snapping),
                        "direction":eDir,
                        "duration":curEDur,
                        "target":`${i}`,
                        "opacity1":opacity1,
                        "opacity2":opacity2,
                        "id":`e${eId}`,
                        "snap":snapping};
            flyingEffects.push(pack);
            eId++;
        }
        for (let e of selectedEffects){
            document.getElementById(`b${e}`).style.opacity = 0;
        }
        selectedEffects = [];
    } else {
        let pack = {"time":effect.time,
                    "direction":effect.direction,
                    "duration":effect.duration,
                    "target":effect.target,
                    "opacity1":effect.opacity1,
                    "opacity2":effect.opacity2,
                    "id":`e${eId}`,
                    "snap":effect.snapping};
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
                                        "direction":7,
                                        "snap":head.snap});
            cnvC++;
            break;
        default:
            return console.error("longnope");
    }
    
}

function updateEffect(effect){
    let timeUntilFire =  audio.currentTime - effect.time;
    let inds = effect.target.split("");

    if (-tolerance <= timeUntilFire && audio.currentTime <= (effect.time + tolerance + effect.duration * nextStep)){
        if (!(effect.direction % 2)){
            //console.log(timeUntilFire, effect.opacity/(effect.duration));
            effectImages[inds[0]][inds[1]].h.style.opacity = `${effect.opacity1 - (timeUntilFire * (effect.opacity1 - effect.opacity2))/(effect.duration * nextStep)}`;
        }
        if (!(effect.direction % 3)){
            //console.log(timeUntilFire, effect.opacity, (effect.duration));
            effectImages[inds[0]][inds[1]].v.style.opacity = `${effect.opacity1 - (timeUntilFire * (effect.opacity1 - effect.opacity2))/(effect.duration * nextStep)}`;
        }
    }
}

function redrawCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (cnvC){
        for (d of canvasObjects){
            if (d != null){
                let timeUntilLand = audio.currentTime - d.time;
                // if (-timeUntilLand <= 0.1){
                //     ctx.strokeStyle = `rgba(128,128,128,${1 - (-timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                //     ctx.fillStyle = `rgba(128,128,128,${1 - (-timeUntilLand * (1 - inactiveOpacity))/ 0.1})`;
                // } else {
                //     ctx.strokeStyle = `rgba(128,128,128,${inactiveOpacity})`;
                //     ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                // }
                switch (d.direction) {
                    case 2:
                        if (timeUntilLand <= 0) {
                            ctx.fillStyle = fill.active;
                            ctx.fillRect(d.x,d.y+timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                  
                        } else {
                            if ((d.h+timeUntilLand)*scrollSpeed <= 0){
                                ctx.fillStyle = fill.active;
                                ctx.fillRect(d.x,d.y,d.w,(d.h+timeUntilLand)*scrollSpeed);

                                let grd = ctx.createLinearGradient(d.x,d.y,d.x,d.y + 0.1*scrollSpeed);
                                grd.addColorStop(0, fill.active);
                                grd.addColorStop(1, `rgba(128,128,128,${inactiveOpacity})`);
                                ctx.fillStyle = grd;
                                //ctx.fillStyle = fill.inactive;
                                ctx.fillRect(d.x,d.y+timeUntilLand*scrollSpeed,d.w,-timeUntilLand*scrollSpeed);                  
                            }else {
                                ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                                ctx.fillRect(d.x,d.y+timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                      
                            }
                        }
                        break;
                    case 3:
                        if (timeUntilLand <= 0) {
                            ctx.fillStyle = fill.active;
                            ctx.fillRect(d.x-timeUntilLand*scrollSpeed,d.y,d.w*scrollSpeed,d.h);                  
                        } else {
                            if ((-d.w+timeUntilLand)*scrollSpeed <= 0){
                                ctx.fillStyle = fill.active;
                                ctx.fillRect(d.x,d.y,(d.w-timeUntilLand)*scrollSpeed,d.h);

                                let grd = ctx.createLinearGradient(d.x,d.y,d.x - 0.1*scrollSpeed,d.y);
                                grd.addColorStop(0, fill.active);
                                grd.addColorStop(1, `rgba(128,128,128,${inactiveOpacity})`);
                                ctx.fillStyle = grd;
                                //ctx.fillStyle = fill.inactive;
                                ctx.fillRect(d.x-timeUntilLand*scrollSpeed,d.y,timeUntilLand*scrollSpeed,d.h);                      
                            }else {
                                ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                                ctx.fillRect(d.x-timeUntilLand*scrollSpeed,d.y,d.w*scrollSpeed,d.h);                      
                            }
                        }
                        break;
                    case 5:
                        if (timeUntilLand <= 0) {
                            ctx.fillStyle = fill.active;
                            ctx.fillRect(d.x,d.y-timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                  
                        } else {
                            if ((-d.h+timeUntilLand)*scrollSpeed <= 0){
                                ctx.fillStyle = fill.active;
                                ctx.fillRect(d.x,d.y,d.w,(d.h-timeUntilLand)*scrollSpeed);

                                let grd = ctx.createLinearGradient(d.x,d.y,d.x,d.y - 0.1*scrollSpeed);
                                grd.addColorStop(0, fill.active);
                                grd.addColorStop(1, `rgba(128,128,128,${inactiveOpacity})`);
                                ctx.fillStyle = grd;
                                //ctx.fillStyle = fill.inactive;
                                ctx.fillRect(d.x,d.y-timeUntilLand*scrollSpeed,d.w,timeUntilLand*scrollSpeed);                  
                            }else {
                                ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                                ctx.fillRect(d.x,d.y-timeUntilLand*scrollSpeed,d.w,d.h*scrollSpeed);                      
                            }
                        }
                        break;
                    case 7:
                        if (timeUntilLand <= 0) {
                            ctx.fillStyle = fill.active;
                            ctx.fillRect(d.x+timeUntilLand*scrollSpeed,d.y,d.w*scrollSpeed,d.h);                  
                        } else {
                            if ((d.w+timeUntilLand)*scrollSpeed <= 0){
                                ctx.fillStyle = fill.active;
                                ctx.fillRect(d.x,d.y,(d.w+timeUntilLand)*scrollSpeed,d.h);

                                let grd = ctx.createLinearGradient(d.x,d.y,d.x + 0.1*scrollSpeed,d.y);
                                grd.addColorStop(0, fill.active);
                                grd.addColorStop(1, `rgba(128,128,128,${inactiveOpacity})`);
                                ctx.fillStyle = grd;
                                //ctx.fillStyle = fill.inactive;
                                ctx.fillRect(d.x+timeUntilLand*scrollSpeed,d.y,-timeUntilLand*scrollSpeed,d.h);                 
                            }else {
                                ctx.fillStyle = `rgba(128,128,128,${inactiveOpacity})`;
                                ctx.fillRect(d.x+timeUntilLand*scrollSpeed,d.y,d.w*scrollSpeed,d.h);                      
                            }
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
    let i = 3;
    while (i--){
        let j = 5;
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
            && flyingEffects[i].time + flyingEffects[i].duration >= audio.currentTime){
                indsToRevert.push({"direction":flyingEffects[i].direction,"target":flyingEffects[i].target})
                flyingEffects[i] = null;
            }
        }
    }

    for (let e of selectedEffects){
        document.getElementById(`b${e}`).style.opacity = 0;
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

