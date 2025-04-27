import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get application information',
    description: 'Returns basic information about the application.',
  })
  @ApiOkResponse({
    description: 'Application info returned successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            application: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                version: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string' },
                environment: { type: 'string' },
              },
            },
            links: {
              type: 'object',
              properties: {
                website: { type: 'string' },
                documentation: { type: 'string' },
                github: { type: 'string' },
                discord: { type: 'string' },
                x: { type: 'string' },
                instagram: { type: 'string' },
              },
            },
            author: { type: 'string' },
            license: { type: 'string' },
            copyright: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Invalid request parameters' },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 500 },
            message: { type: 'string', example: 'Something went wrong on the server' },
            error: { type: 'string', example: 'Internal Server Error' },
          },
        },
      },
    },
  })
  getAppInfo(): any {
    const packageInfo = require('../package.json');
    return {
      data: {
        application: {
          name: packageInfo.name,
          version: packageInfo?.version || 'dev',
          description: packageInfo.description,
          status: 'operational',
          environment: process.env.NODE_ENV || 'development',
        },
        links: {
          website: packageInfo.homepage,
          documentation: `${packageInfo.homepage}/docs`,
          github: packageInfo.repository || 'https://github.hayasedb.com',
          discord: 'https://discord.hayasedb.com',
          x: 'https://x.hayasedb.com',
          instagram: 'https://instagram.hayasedb.com',
        },
        author: packageInfo.author,
        license: packageInfo.license,
        copyright: `© ${new Date().getFullYear()} HayaseDB`,
      },
    };
  }
}
