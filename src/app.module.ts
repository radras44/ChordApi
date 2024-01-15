import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoicingModule } from './voicing/voicing.module';
import { MongooseModule } from '@nestjs/mongoose';

console.log(process.env.MONGO_URI)
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI,{
      dbName : "music_instructor"
    }),
    VoicingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
