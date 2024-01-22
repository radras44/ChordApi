import { ChordSymbol, Note, ChordSymbolsJSON, ChordSymbolInterval } from "../interfaces/conversorDefs"
import * as path from 'path';
export class Conversor {
    chordIntervalsLayout : {[key : string] : string | null}
    notes : Note[]
    intervalSTs : {[key : string] : number}
    chordSymbols : ChordSymbolsJSON
    chordSymbolList : {[key : string] : ChordSymbol} 
    avoidNotes : {[key : string] : string[]}
    chordLayoutSortedKeys : string[]
    constructor () {
        const theory = require(path.join(__dirname,"..","assets","theory.json"))
        const chordSymbols = require(path.join(__dirname,"..","assets","chordSymbols.json"))
        if(!theory || !chordSymbols){throw new Error("no se han podido cargar los recursos para instanciar correctamente la clase Conversor")}
        this.chordLayoutSortedKeys = theory["chordIntervalLayout"]
        this.chordIntervalsLayout = {}
        this.chordLayoutSortedKeys.forEach(e => {
            this.chordIntervalsLayout[e] = e == "1" ? e : null
        })
  
        this.notes = theory["notes"]
        this.avoidNotes = theory["avoidNotes"]
        this.intervalSTs = theory["intervals"]
        this.chordSymbols = chordSymbols
        this.chordSymbolList = this.genChordSymbolList()
    }

    genChordSymbolList () : {[key : string] : ChordSymbol} {
        if(!this.chordSymbols){return}
        const result = {}
        let symbolSet
        for(const k in this.chordSymbols){
            symbolSet = this.chordSymbols[k]
            for(const symbol in symbolSet){
                result[symbol] = {...this.chordSymbols[k][symbol]}
            }
        }
        return result
    }

    sortNotes (note : Note) {
        const firstNoteIdx = this.notes.indexOf(note)
        const newNoteOrder = this.notes.slice(firstNoteIdx,this.notes.length)
        .concat(this.notes.slice(0,firstNoteIdx))
        return newNoteOrder
    }

    getRootNote(chord : string) {
        let rootNote = null
        if (chord.charCodeAt(0) >= "A".charCodeAt(0) && chord.charCodeAt(0) <= "Z".charCodeAt(0)) {
            if (chord[1] == "#" || chord[1] == "b") {
                rootNote = chord.substring(0, 2)
            } else {
                rootNote = chord[0]
            }
        }
        return rootNote
    }

    
    applyAvoidNotes (intervals : string[]) {
        let result : string[] = [...intervals]
        for(const k in this.avoidNotes){
            if(!result.includes(k)){
                continue
            }
            this.avoidNotes[k].forEach(i => {
                if(!result.includes(i)){
                    return
                }
                result = result.filter(e => e !== i)
            })
        }
        return result
    }

    chordToIntervals(chord : string,avoidNotes : boolean) : 
    {
        rootNote : Note,
        intervals : string[],
        error : string | null
    } {        
        let chordFragments : string[] = []

        let rootNote : Note = this.getRootNote(chord)
        chord = chord.replace(rootNote,"")
        if(chord.length == 0){
            return {
                rootNote : rootNote,
                intervals : ["1","3","5"],
                error : null
            }
        }
        chord = chord.toLocaleLowerCase()
        let set : {[key : string] : ChordSymbol} 
        for(const k in this.chordSymbols){
            set = this.chordSymbols[k]
            for(const symbolName in set){
                if(chord.includes(symbolName)){
                    chord = chord.replace(symbolName,"")
                    chordFragments.push(symbolName)
                }
            }
        }
        if(chord.length > 0){
            return {rootNote : "A",intervals : [],error : `the chord contain not allowed symbols:${chord}`}
        }

        let symbol : ChordSymbol
        let interval : ChordSymbolInterval
        let chordLayout = new Object({...this.chordIntervalsLayout})
        let toRemove : ChordSymbolInterval[] = []
        for(const frag of chordFragments){
            if(!(frag in this.chordSymbolList)){
                continue
            }
            symbol = {...this.chordSymbolList[frag]}
            if(symbol.excludes){
                toRemove = toRemove.concat([...symbol.excludes])
            }
            for(const k in symbol.includes){
                interval = symbol.includes[k]
                if(!(interval.type in chordLayout)){
                    continue
                }
                if(!chordLayout[interval.type]){
                    chordLayout[interval.type] = interval.name
                    continue
                }
                if(interval.priority){
                    chordLayout[interval.type] = interval.name
                }
                   
            }
        }

        for(const interval of toRemove){
            if(!(interval.type in chordLayout)){
                continue
            }
            if(interval.priority){
                chordLayout[interval.type] = null
            }else{
                chordLayout[interval.type] = chordLayout[interval.type] === interval.name ? null : chordLayout[interval.type]
            }
        }

        let intervals = []
        this.chordLayoutSortedKeys.forEach(k => {
            if(chordLayout[k]){
                intervals.push(chordLayout[k])
            }
        }) 

        if(!avoidNotes){
            intervals = this.applyAvoidNotes(intervals)
        }

        return {intervals,rootNote,error : null}
    }
}

