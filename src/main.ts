import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PORT } from './core/config';
import { ValidationPipe } from './validation/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://188.225.87.70:3000',
      'http://188.225.87.70:5000',
      'https://user174261333-5ipcgaxy.wormhole.vk-apps.com/',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('OOP project')
    .setDescription('The backend Node API description')
    .setVersion('1.0.1')
    .addTag('Dartar')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  //app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, '0.0.0.0', () =>
    console.log(`server started on ${PORT}`),
  );
}
bootstrap();
