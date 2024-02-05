async function activator() {
    const url = "https://chord-api-t0te.onrender.com/guitarVoicing/getByConfig"
    const API_KEY = process.env.CLIENT_API_KEY || null
    const config = {
        chordName: "Cm",
        vFretSize: 4,
        omits: [],
        transportable: true,
        stringComb: "123"
    }
    try {
        console.log("iniciando activator")
        if(!API_KEY){
            throw new Error("variable de entorno no encontrada")
        }
        const req = await fetch(url,{
            method : "POST",
            body : JSON.stringify(config),
            headers : {
                "Content-Type" : "application/json",
                "authorization" : API_KEY 
            }
        })
        const res = await req.json()
        if(res.status){
            console.log("activator status:",res.status)
        }
    } catch (error) {
        console.log(error)
    } finally {
        console.log("Activator finished")
    }
}

export function activatorLoop () {
    console.log("starting activator loop")
    activator()
    setInterval(()=>{
        activator()
    },1000 * 60 * 14)
}