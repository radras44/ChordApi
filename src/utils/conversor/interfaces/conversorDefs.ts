

export interface ChordSymbolsJSON {
    tension : {[key : string] : ChordSymbol}
    add: {[key : string] : ChordSymbol}
    sus: {[key : string] : ChordSymbol}
    tetrad: {[key : string] : ChordSymbol}
    other: {[key : string] : ChordSymbol}
    triad: {[key : string] : ChordSymbol}
    implicator: {[key : string] : ChordSymbol}
}
export interface ChordSymbol {
    includes : ChordSymbolInterval[]
    excludes? : ChordSymbolInterval[] 
}
export interface ChordSymbolInterval {
    name : String,
    type : string,
    priority? : boolean
}

export type Tune = Note[]

export interface GuitarConversorConstructor {
    tune? : Tune,
    fretRange? : FretRange
}

export interface FretRange {
    min : number
    max : number
    diff? : number
}

export interface GuitarPos {
    string : number
    fret : number
    interval? : string
    text? : string
}

export interface VoicingConfig {
    tune: string
    configID: string
    vStringSize : number
    vFretSize : number
    chord : string
    omits : string
    avoidNotes : boolean
}

export interface VoicingDef {
    voicingConfig_id : string
    stringComb? : string
    root? : string
    bass? : string
    bassInterval? : string
    positions : GuitarPos[]
    fretRange : FretRange
}

export interface GetVoicingOps {
    vStringSize? : number,
    vFretSize : number,
    omits : string[],
    chordName : string
    avoidNotes? : boolean
    transportable? : boolean
    stringComb? : string
}

export type Note =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";



    