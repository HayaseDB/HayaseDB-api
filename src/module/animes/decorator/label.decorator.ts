import 'reflect-metadata';

export function Label(label: string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata('hayase:label', label, target, propertyKey);
  };
}
