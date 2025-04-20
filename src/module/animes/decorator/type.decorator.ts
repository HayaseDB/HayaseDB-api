import 'reflect-metadata';

type AllowedTypes = 'Uuid' | 'Text' | 'Url' | 'Image' | 'Enum';

export function Type(type: AllowedTypes): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata('hayase:type', { name: type }, target, propertyKey);
  };
}
