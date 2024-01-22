import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voicing } from 'src/schemas/voicing.schema';
import { VoicingConfig } from 'src/schemas/voicingCFG.schema';
import { GuitarConversor } from 'src/utils/conversor/classes/guitarConversor';
import { GetVoicingOps, VoicingDef } from 'src/utils/conversor/interfaces/conversorDefs';

@Injectable()

export class VoicingService extends GuitarConversor {
    constructor(
        @InjectModel(Voicing.name) private voicingModel: Model<Voicing>,
        @InjectModel(VoicingConfig.name) private voicingConfigModel: Model<VoicingConfig>
    ) {
        super({
            fretRange: { min: 0, max: 12 },
            tune: ["E", "A", "D", "G", "B", "E"]
        })
    }

    async getByChord(ops): Promise<{
        result: {
            length: number,
            voicings: VoicingDef[] | Voicing[],
            config: VoicingConfig
        },
        error: string | null
    }> {
        const decodedChord = this.chordToIntervals(ops.chordName, ops.avoidNotes)
        const result = this.getVoicings(decodedChord.rootNote, decodedChord.intervals, ops)
        if(result.error){
            throw new BadRequestException("somthing bad happend",{description : result.error})
        }
        return {
            result: {
                length: result.voicings.length,
                voicings: result.voicings,
                config: result.voicingConfig
            },
            error: null
        }
    }
}
