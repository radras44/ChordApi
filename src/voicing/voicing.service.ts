import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voicing} from 'src/schemas/voicing.schema';
import { VoicingConfig } from 'src/schemas/voicingCFG.schema';
import { GuitarConversor } from 'src/utils/conversor/classes/guitarConversor';

@Injectable()
export class VoicingService extends GuitarConversor {
    constructor(
        @InjectModel(Voicing.name) private voicingModel : Model<Voicing>,
        @InjectModel(VoicingConfig.name) private voicingConfigModel : Model<VoicingConfig>
        ) {
        super({
            fretRange: { min: 0, max: 24 },
            tune: ["E", "A", "D", "G", "B", "E"]
        })
    }
    async getByChord(chord: string, ops : {
        omits : string[]
        vStringSize : number
        vFretSize : number
    }) {
        let voicingConfigID = super.genVoicingCfgID({...ops,chordName: chord})
        const finded = await this.voicingModel.findOne({
            voicingConfig_id : voicingConfigID
        })
        console.log("finded:",finded)
        if(finded){
            const allFinded = await this.voicingModel.find({
                voicingConfig_id : voicingConfigID
            })
            return allFinded
        }

        const chordDecoded = this.chordToIntervals(chord)
        if(chordDecoded.error){
            console.log("error")
            throw new BadRequestException("somthing bad happend",{description : chordDecoded.error})
        }
        if ((chordDecoded.intervals.length - ops.omits.length) > ops.vStringSize) {
            console.log("error")
            throw new BadRequestException("somthing bad happend",{description : `the length resulting from ${chord} is greater than vStringSize`})
        }
        const result = this.getVoicings(chordDecoded.rootNote, chordDecoded.intervals, {...ops,chordName : chord})
        await this.voicingModel.create(result.voicings)
        await this.voicingConfigModel.create([result.voicingConfig])
        return result.voicings
    }
}
