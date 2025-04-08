import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {HeaderAPIKeyStrategy} from 'passport-headerapikey';
import {KeyService} from '@/module/key/key.service';

@Injectable()
export class KeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'key') {
  constructor(private readonly keyService: KeyService) {
    super(
        {
          header: 'key',
          prefix: '',
        },
        false,
    );
  }

  async validate(apiKey: string) {
    return await this.keyService.validateKey(apiKey);
  }
}
