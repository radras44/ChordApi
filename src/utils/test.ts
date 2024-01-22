import { GuitarConversor } from "./conversor/classes/guitarConversor"
const guitarConversor = new GuitarConversor({
    fretRange : {min : 0,max:12}
})
const chordName = "C"
const decoded = guitarConversor.chordToIntervals(chordName,false)
console.log(chordName)
const result = guitarConversor.getVoicings(decoded.rootNote,decoded.intervals,{
    vFretSize : 4,
    vStringSize : 4,
    omits : [],
    chordName : chordName,
    avoidNotes : false,
    transportable : false
})
for(const v of result.voicings){
    v.positions.forEach(p=>{
        console.log(p.string,p.fret,p.interval)
    })
    console.log("----------------------------------")
}
console.log(result.voicings.length)