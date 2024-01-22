import { FretRange, GetVoicingOps, GuitarConversorConstructor, GuitarPos, Note, Tune, VoicingDef, VoicingConfig } from "../interfaces/conversorDefs"

import {Conversor} from "./conversor"

export class GuitarConversor extends Conversor {
    tune : Tune
    fretRange : FretRange
    tuneMap : {[key : string] : Note[]}
    constructor(options : GuitarConversorConstructor = { tune: null, fretRange: { min: 0, max: 12 } }) {
        super()
        this.tune = this.setTune(options.tune)
        this.tuneMap = this.genTuneMap(this.tune)
        this.setFretRange(options.fretRange)
    }

    chordToIntervals(chord : string,avoidNotes : boolean) {
        return super.chordToIntervals(chord,avoidNotes)
    }

    genTuneMap(tune) {
        const tuneMap : {[key : string] : Note[]} = {}
        for (let i = 0; i < this.tune.length; i++) {
            tuneMap[(i + 1).toString()] = this.sortNotes(tune[(this.tune.length - 1) - i])
        }
        return tuneMap
    }

    setTune(tune : Tune) {
        const newTune : Tune = tune ? tune : ["E", "A", "D", "G", "B", "E"]
        return newTune
    }

    setFretRange(fretRange : FretRange) {
        if(!(fretRange.max > fretRange.min)){
            throw new Error("max fret must be greater than min fret")
        }
        this.fretRange = { ...fretRange, diff: fretRange.max - fretRange.min + 1 }
    }

    fretIdxToPos(id : string) : GuitarPos {
        if (typeof (id) !== "string") {
            throw new Error("id must be a string with 0:00 format, try could use posToFretIdx() method.")
        }
        let split = id.split(":")
        if (split.length < 1) {
            throw new Error("id must be a string with 0:00 format, try could use posToFretIdx() method.")
        }
        return {
            string: parseInt(split[0]),
            fret: parseInt(split[1]),
            interval : null
        }
    }


    posToFretIdx(string : number | string, fret : number | string) {
        return String(string) + ":" + String(fret).padStart(2, "0")
    }

    noteToFretIdx(note : Note) {
        const idxs = []
        let stringFretPos
        for (const key in this.tuneMap) {
            stringFretPos = this.tuneMap[key].indexOf(note)
            for (let i = stringFretPos; i < this.fretRange.max; i += 12) {
                idxs.push(this.posToFretIdx(key, i))
            }
        }
        return idxs
    }

    noteToPos(note : Note) : GuitarPos[] {
        const idxs = []
        let stringNoteIdx : number
        for (const key in this.tuneMap) {
            stringNoteIdx = this.tuneMap[key].indexOf(note)
            for (let i = stringNoteIdx; i < this.fretRange.max; i += 12) {
                idxs.push({ string: parseInt(key), fret: i })
            }
        }
        return idxs
    }

    fretIdxToNote(id : string) {
        const { string, fret } = this.fretIdxToPos(id)
        return this.tuneMap[string.toString()][fret % 12]

    }

    private genStringCombs(k : number) : string[] {
        const a = Array.from({length : this.tune.length}).map((_,i) => i + 1)
        const result = []
        function comb(current,start) {
            if(current.length == k){
                result.push(current)
                return
            }
    
            for(let i = start ; i < a.length ; i++){
                current += a[i]
                comb(current,i+1)
                current = current.substring(0,current.length - 1)
            }
        }
        comb("",0)
        return result
    }

    private genVoicingCombs(obj : {[key : string] : GuitarPos[]}, req : string[]) : GuitarPos[][] {
        const result = []
        const keys = Object.keys(obj)
        let reg = []
        function comb(current, keyi) {
            if (current.length === keys.length) {
                if (req.every(e => reg.includes(e))) {
                    result.push([...current])
                    return
                }
                return
            }

            for (let i = 0; i < obj[keys[keyi]].length; i++) {
                current.push(obj[keys[keyi]][i])
                reg.push(obj[keys[keyi]][i].interval)
                comb(current, keyi + 1)
                current.pop()
                reg.pop()
            }
        }
        comb([], 0)
        return result
    }

    genVoicingCfgID (ops : GetVoicingOps) {
        return `${[...this.tune].join("-")}:${ops.chordName}:${ops.omits.join("-")}:${ops.vFretSize}:${ops.vStringSize}`
    }

    getVoicings(root : Note, intervals : string[], ops : GetVoicingOps) : 
    {voicings : VoicingDef[],voicingConfig : VoicingConfig | null,error : string | null} {
        const defaultResponse = {voicings : [],voicingConfig : null}
        ops.vStringSize = ops.vStringSize ? ops.vStringSize : 4
        ops.vFretSize = ops.vFretSize ? ops.vFretSize : 4
        ops.omits = ops.omits ? ops.omits : []
        ops.chordName = ops.chordName ? ops.chordName : null

        let points = []

        if(!ops.avoidNotes){
            intervals = super.applyAvoidNotes(intervals)
        }

        let rootPos = this.noteToPos(root)[0]
        let intervalRootIdx
        let intervalIdxs
        intervals.forEach(interval => {
            intervalRootIdx = this.posToFretIdx(rootPos.string, rootPos.fret + this.intervalSTs[interval])
            intervalIdxs = this.noteToPos(this.fretIdxToNote(intervalRootIdx))
            intervalIdxs.forEach(obj => obj.interval = interval)
            points = points.concat(intervalIdxs)
        })

        let stringCombSet : string[]

        if(ops.stringComb.split("").some(e => Number(e) < 1 || Number(e) > this.tune.length)){
            return {
                ...defaultResponse,
                error : `some element in stringComb is out of range: 1-${this.tune.length}`
            }
        }
        if(ops.stringComb){
            stringCombSet = [ops.stringComb.split("").sort((a,b)=>Number(a)-Number(b)).join("")]
            ops.vStringSize = ops.stringComb.length
        }else{
            stringCombSet = this.genStringCombs(ops.vStringSize) 
        }
        console.log(stringCombSet)

        //voicings
        let voicingRequirements = intervals.filter(interval => !ops.omits.includes(interval))
        console.log("requirements :", voicingRequirements)
        let combRequirementRegister
        let voicingSet : VoicingDef[] = []
        let stringCombVoicings
        let allowByFret : GuitarPos[]
        let allowByStringAndFret : {[key : string] : GuitarPos[]}
        const voicingConfigID : string = this.genVoicingCfgID(ops)

        let maxIter : number
        if(this.fretRange.max - ops.vFretSize > 24){
            maxIter = this.fretRange.max - ops.vFretSize + 1
        }else{
            maxIter = this.fretRange.max
        }

        for (let i = 0; i <= maxIter; i++) {
            if(ops.transportable){
                allowByFret = [...points].filter(pos =>
                    pos.fret >= i && pos.fret < i + ops.vFretSize
                )
            }else{
                allowByFret = [...points].filter(pos =>
                    pos.fret == 0
                    || pos.fret >= i && pos.fret < i + ops.vFretSize
                )
            }
            for (const stringComb of stringCombSet) {
                combRequirementRegister = []
                allowByStringAndFret = {}

                allowByFret.forEach((pos : GuitarPos) => {
                    if (stringComb.includes(pos.string.toString())) {
                        combRequirementRegister.push(pos.interval)
                        if (pos.string in allowByStringAndFret) {
                            allowByStringAndFret[pos.string].push({...pos,text : pos.interval})
                        } else {
                            allowByStringAndFret[pos.string] = [{...pos,text : pos.interval}]
                        }
                    }
                })

                if (!voicingRequirements.every((i) => combRequirementRegister.includes(i))) {
                    continue
                }

                if(Object.keys(allowByStringAndFret).length !== ops.vStringSize){
                    continue
                }

                stringCombVoicings = this.genVoicingCombs(allowByStringAndFret, voicingRequirements)
                voicingSet = voicingSet.concat(stringCombVoicings.map((v : GuitarPos[]) => {
                    let posInStartFret = v.find(pos => pos.fret == i) || null
                    if(!posInStartFret){return null}
                    let bassPos = v.find(pos => String(pos.string) == stringComb[stringComb.length-1]) || null
                    const voicing :VoicingDef = {
                        stringComb : stringComb,
                        positions: v,
                        voicingConfig_id : voicingConfigID,
                        root : root,
                        bass : this.fretIdxToNote(this.posToFretIdx(bassPos.string,bassPos.fret)),
                        fretRange : {min:i,max:i + ops.vFretSize-1},
                        bassInterval : bassPos.interval,
                    }
                    return voicing                    
                }))
            }
        }

        voicingSet = voicingSet.filter((v)=>v !== null)

        const voicingConfig : VoicingConfig = {
            tune : this.tune.join("-"),
            configID : voicingConfigID,
            vStringSize : ops.vStringSize,
            vFretSize : ops.vFretSize,
            chord : ops.chordName,
            omits : ops.omits.join("-"),
            avoidNotes : false
        }
        return {voicings : voicingSet,voicingConfig : voicingConfig,error: null}
    }
}

