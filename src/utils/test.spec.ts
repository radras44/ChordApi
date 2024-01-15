import {GuitarConversor} from "./conversor/classes/guitarConversor"
const guitarConversor = new GuitarConversor({
    fretRange : {min : 0,max:5}
})

describe("chordToIntervals",() => {
    it.each([
        ["C13",["1","3","5","b7","9","11","13"]],
        ["Cm",["1","b3","5"]],
        ["C13sus4b9",["1","4","5","b7","b9","11","13"]],
        ["CmMaj9",["1","b3","5","7","9"]],
        ["Cm7b5",["1","b3","b5","b7"]],
        ["CMaj7",["1","3","5","7"]],
        ["Cdim7",["1","b3","b5","bb7"]],
        ["C7+#9",["1","3","#5","b7","#9"]],
        ["C7sus2b9#9",["1","2","5","b7","b9","#9"]],
        ["Cmadd13",["1","b3","5","13"]],
        ["C7#11", ["1", "3", "5", "b7", "#11"]],
        ["Cm11", ["1", "b3", "5", "b7", "9", "11"]],
        ["Cmaj13#11", ["1", "3", "5", "7","9","#11", "13"]],
        ["C7b13", ["1", "3", "5", "b7", "b13"]],
        ["CmMaj7#5", ["1", "b3", "#5", "7"]],
        ["C7#9b13", ["1", "3", "5", "b7", "#9", "b13"]],
        ["Cm7#11", ["1", "b3", "5", "b7", "#11"]],
        ["C9#5", ["1", "3", "#5", "b7", "9"]],
        ["C7b9#11", ["1", "3", "5", "b7", "b9", "#11"]],
        ["Cm7b5b9", ["1", "b3", "b5", "b7", "b9"]]
    ])("should return correct intervals for %s",(chord,expected) => {
        let result = guitarConversor.chordToIntervals(chord)
        console.log("to chord:",chord,"expect:",expected,"\nresult:",result,"\n======================>")
        expect(result.intervals).toEqual(expected)
    })
})
// describe("chordToIntervals", () => {

//     it("should return correct intervals for Cmadd13", () => {
//         const chord = "Cm7b5";
//         const expected = ["1","b3","b5","b7"];  // Asumiendo que este es el intervalo esperado para Cmadd9

//         let result = guitarConversor.chordToIntervals(chord);
//         console.log("to chord:", chord, "expect:", expected, "\nresult:", result, "\n======================>");
        
//         expect(result.intervals).toEqual(expected);
//     });
// });



