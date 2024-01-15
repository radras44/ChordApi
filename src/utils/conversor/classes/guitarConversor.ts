import { FretRange, GetVoicingOps, GuitarConversorConstructor, GuitarPos, Note, Tune, Voicing, VoicingConfig } from "../interfaces/conversorDefs"

import {Conversor} from "./conversor"

export class GuitarConversor extends Conversor {
    tune : Tune
    fretRange : FretRange
    tuneMap : {[key : string] : Note[]}
    constructor(options : GuitarConversorConstructor = { tune: null, fretRange: { min: 0, max: 26 } }) {
        super()
        this.tune = this.setTune(options.tune)
        this.tuneMap = this.genTuneMap(this.tune)
        this.setFretRange(options.fretRange)
    }

    chordToIntervals(chord : string) {
        return super.chordToIntervals(chord)
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

    genStringCombs(k : number) {
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

    genVoicingCombs(obj : {[key : string] : GuitarPos[]}, req : string[]) : GuitarPos[][] {
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

    getVoicings(root : Note, intervals : string[], ops : GetVoicingOps) : {voicings : Voicing[],voicingConfig : VoicingConfig} {
        ops.vStringSize = ops.vStringSize ? ops.vStringSize : 4
        ops.vFretSize = ops.vFretSize ? ops.vFretSize : 4
        ops.omits = ops.omits ? ops.omits : []
        ops.chordName = ops.chordName ? ops.chordName : null

        let points = []

        let rootPos = this.noteToPos(root)[0]
        let intervalRootIdx
        let intervalIdxs
        intervals.forEach(interval => {
            intervalRootIdx = this.posToFretIdx(rootPos.string, rootPos.fret + this.intervalSTs[interval])
            intervalIdxs = this.noteToPos(this.fretIdxToNote(intervalRootIdx))
            intervalIdxs.forEach(obj => obj.interval = interval)
            points = points.concat(intervalIdxs)
        })

        const stringCombSet = this.genStringCombs(ops.vStringSize)

        //voicings
        let voicingRequirements = intervals.filter(interval => !ops.omits.includes(interval))
        console.log("requirements :", voicingRequirements)
        let combRequirementRegister
        let voicingSet : Voicing[] = []
        let stringCombVoicings
        let allowByFret
        let allowByStringAndFret
        const voicingConfigID : string = this.genVoicingCfgID(ops)

        for (let i = 0; i <= this.fretRange.max - ops.vFretSize + 1; i++) {
            allowByFret = [...points].filter(pos =>
                pos.fret == 0
                || pos.fret >= i && pos.fret < i + ops.vFretSize
            )
            for (const stringComb of stringCombSet) {
                combRequirementRegister = []
                allowByStringAndFret = {}

                allowByFret.forEach(pos => {
                    if (stringComb.includes(pos.string.toString())) {
                        combRequirementRegister.push(pos.interval)
                        if (pos.string in allowByStringAndFret) {
                            allowByStringAndFret[pos.string].push(pos)
                        } else {
                            allowByStringAndFret[pos.string] = [pos]
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
                let voicing : Voicing
                let tune = [...this.tune].join("-")
                let voicingUID : string
                voicingSet = voicingSet.concat(stringCombVoicings.map((v : GuitarPos[]) => {
                    let bassPos = v.find(e => e.string == stringComb[0]) || null
                    voicingUID = `${tune}:${v.map(pos => `${pos.string}${pos.fret}${pos.interval}`).join("")}` 
                    voicing = {
                        stringComb : stringComb,
                        positions: v,
                        voicingConfig_id : voicingConfigID,
                        root : root,
                        bass : this.fretIdxToNote(this.posToFretIdx(bassPos.string,bassPos.fret)),
                        fretRange : {min:i,max:i + ops.vFretSize-1},
                        bassInterval : bassPos.interval,
                        voicingUID : voicingUID
                    }
                    
                    return voicing                    
                }))
            }
        }
        const voicingConfig : VoicingConfig = {
            tune : this.tune.join("-"),
            id : voicingConfigID,
            vStringSize : ops.vStringSize,
            vFretSize : ops.vFretSize,
            chord : ops.chordName,
            omits : ops.omits.join("-") 
        }
        return {voicings : voicingSet,voicingConfig : voicingConfig}
    }
}

