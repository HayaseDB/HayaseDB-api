import 'reflect-metadata';

export function Required(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata('hayase:required', true, target, propertyKey);
  };
}
