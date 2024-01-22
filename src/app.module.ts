import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoicingModule } from './guitarVoicing/guitarVoicing.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientMiddleware } from './middleware/client.middleware';

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
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(ClientMiddleware)
      .forRoutes("guitarVoicing")
  }
}
