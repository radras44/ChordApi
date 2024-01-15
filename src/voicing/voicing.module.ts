import { Module } from '@nestjs/common';
import { VoicingService } from './voicing.service';
import { VoicingController } from './voicing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Voicing, VoicingSchema } from 'src/schemas/voicing.schema';
import { VoicingConfig, VoicingConfigSchema } from 'src/schemas/voicingCFG.schema';

@Module({
  imports : [MongooseModule.forFeature([
    {name : Voicing.name,schema : VoicingSchema},
    {name : VoicingConfig.name,schema : VoicingConfigSchema}
  ])],
  controllers: [VoicingController],
  providers: [VoicingService],
})
export class VoicingModule {}
