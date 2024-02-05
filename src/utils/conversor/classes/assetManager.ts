import * as path from "path"
import { ChordSymbolsJSON, Note } from "../interfaces/conversorDefs"

export class AssetManager {
    notes: Note[]
    intervalSTs: { [key: string]: number }
    avoidNotes: { [key: string]: string[] }
    chordSymbols: ChordSymbolsJSON
    chordLayoutSortedKeys: string[]
    constructor() {
        const theory = require(path.join(__dirname, "..", "assets", "theory.json"))
        const chordSymbols = require(path.join(__dirname, "..", "assets", "chordSymbols.json"))
        if (!theory || !chordSymbols) { throw new Error("no se han podido cargar los recursos para instanciar correctamente la clase Conversor") }
        this.notes = theory["notes"]
        this.avoidNotes = theory["avoidNotes"]
        this.intervalSTs = theory["intervals"]
        this.chordLayoutSortedKeys = theory["chordIntervalLayout"]
        this.chordSymbols = chordSymbols
    }

    sortNotes (root : Note) {
        const firstNoteIdx = this.notes.indexOf(root)
        const newNoteOrder = this.notes.slice(firstNoteIdx, this.notes.length)
            .concat(this.notes.slice(0, firstNoteIdx))
        return newNoteOrder
    }
}