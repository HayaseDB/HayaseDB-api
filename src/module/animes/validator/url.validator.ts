import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Normalizes and validates YouTube URLs
 * @param validationOptions Options for the validation decorator
 * @returns PropertyDecorator
 */
export function IsYouTubeUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;

      const match = value.match(
        /youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/?|(?:watch\?v=|video_id=|shorts\/))([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/,
      );
      if (match) {
        const videoId = match[1] || match[2];
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
      return value;
    })(object, propertyName);

    registerDecorator({
      name: 'isYouTubeUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/?|(?:watch\?v=|video_id=|shorts\/))([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11}))(\?.*)?$/.test(
            value,
          );
        },
        defaultMessage(args: ValidationArguments): string {
          return typeof validationOptions?.message === 'string'
            ? validationOptions.message
            : `${args.property} must be a valid YouTube video URL.`;
        },
      },
    });
  };
}

export function IsCrunchyrollUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;

      let normalizedUrl = value.trim();

      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      normalizedUrl = normalizedUrl
        .replace(
          /^https?:\/\/(www\.)?crunchyroll\.com\/[a-z]{2}\//,
          'https://crunchyroll.com/',
        )
        .replace(
          /^https?:\/\/(www\.)?crunchyroll\.com\/series\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?(\?utm_source=[^ ]*)?$/,
          'https://crunchyroll.com/',
        );

      const [baseUrl, queryParams] = normalizedUrl.split('?');
      let normalizedQueryParams = '';

      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        if (params.has('utm_source')) {
          normalizedQueryParams = `utm_source=${params.get('utm_source')}`;
        }
      }

      return `${baseUrl}${normalizedQueryParams ? `?${normalizedQueryParams}` : ''}`;
    })(object, propertyName);

    registerDecorator({
      name: 'isCrunchyrollUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const crunchUrlRegex =
            /^https?:\/\/(www\.)?crunchyroll\.com\/series\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?(\?utm_source=[^ ]*)?$/;
          return crunchUrlRegex.test(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return (
            <string>validationOptions?.message ||
            `${args.property} must be a valid Crunchyroll series or watch URL.`
          );
        },
      },
    });
  };
}
