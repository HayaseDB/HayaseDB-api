import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { pastel } from 'gradient-string';
import chalk from 'chalk';
import figlet from 'figlet';
import { ValidationPipe } from '@nestjs/common';
import { Response } from 'express';

async function server() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ✅ enables transformation
      whitelist: true, // ✅ strips unknown props
      forbidNonWhitelisted: true, // ❗ optional: throws if unknown props
    }),
  );
  // Swagger Setup for api documentation
  const config = new DocumentBuilder()
    .setTitle('HayaseDB API')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'token',
    )
      .addApiKey(
          { type: 'apiKey'},
          'key',
      )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  const configService = app.get(ConfigService);
  const port: number = configService.getOrThrow('app.port');

  app.use('/doc.json', (req, res: Response) => {
    res.json(document);
  });


    await app.listen(port);


  return app;
}

server()
  .then((app) => {
    const configService = app.get(ConfigService);

    const base_url = configService.get<string>('app.base_url');
    const env = configService.get<string>('app.env');

    console.log(
      pastel.multiline(
        figlet.textSync('HayaseDB', {
          font: 'Slant',
        }),
      ),
    );
    if (env !== 'production') {
      console.log(
        chalk.yellow('🚧 Warning: Server is running in development mode!'),
      );
    }
    console.log();
    console.log(chalk.grey('⚙️ API: ') + `${base_url}`);
    console.log(chalk.grey('📄 DOC: ') + `${base_url}/doc`);
    console.log(chalk.grey('🚀 ') + chalk.green('Server startup successful!'));
  })
  .catch((err) => {
    console.error(chalk.red('❌ Server startup failed:'), err);
    process.exit(1);
  });
