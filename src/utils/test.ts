import { GuitarConversor } from "./conversor/classes/guitarConversor"
const guitarConversor = new GuitarConversor({
    fretRange : {min : 0,max:5}
})
const result = guitarConversor.chordToIntervals("CmMaj7#5")
console.log(result)