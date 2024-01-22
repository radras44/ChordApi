import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type VoicingConfigDocument = HydratedDocument<VoicingConfig>

@Schema()
export class VoicingConfig {
    @Prop({name : "id",required : true,unique : true})
    configID : string
    @Prop({name: "tune",required:true})
    tune : string
    @Prop({name : "chord",required:true})
    chord : string
    @Prop({name : "vStringSize",required : true})
    vStringSize : number
    @Prop({name : "vFretSize",required : true})
    vFretSize : number    
    @Prop({name : "omits"})
    omits : string
    @Prop({name : "avoidNotes"})
    avoidNotes : boolean
}

export const VoicingConfigSchema = SchemaFactory.createForClass(VoicingConfig)