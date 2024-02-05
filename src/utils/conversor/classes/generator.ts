import { AssetManager } from "./assetManager";

export class Generator extends AssetManager{
    constructor () {
        super()
    }

    genRandomSheet (size) {
        let notes = []
        if(size > 128){
            return {
                result : null,
                error : "size is too long"
            }
        }
        for(let i = 0 ; i < size ; i++){
            notes.push(this.notes[Math.floor(Math.random()* this.notes.length)])
        }
        return {
            result : notes,
            error : null
        }
    }

    genChordProgresion (root?) {

    }
}