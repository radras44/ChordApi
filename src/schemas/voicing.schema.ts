import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { FretRange } from "src/utils/conversor/interfaces/conversorDefs";

export type VoicingDocument = HydratedDocument<Voicing>

@Schema()
export class Voicing {
    @Prop({name : "voicingUID",required:true})
    voicingUID : string
    @Prop({name : "voicingConfig_id",required : true})
    voicingConfig_id : string
    @Prop({name : "stringComb"})
    stringComb : string
    @Prop({name : "bass"})
    bass : string
    @Prop({name : "bassInterval"})
    bassInterval : string
    @Prop({name : "root"})
    root : string
    @Prop({name : "positions",required : true})
    positions : string[]
    @Prop({type : Object,name : "fretRange",required : true})
    fretRange : FretRange
}

export const VoicingSchema = SchemaFactory.createForClass(Voicing)