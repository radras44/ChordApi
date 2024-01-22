import * as dotenv from "dotenv"
dotenv.config()
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const port = process.env.PORT || 3000
  console.log(port)
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  const config = new DocumentBuilder()
    .setTitle('Chord-api')
    .setDescription('Description')
    .setVersion('1.0')
    .addTag('Chord')
    .addTag('Voicing')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();




