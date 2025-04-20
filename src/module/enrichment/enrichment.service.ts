import { Injectable, Type } from '@nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';
import 'reflect-metadata';

@Injectable()
export class EnrichmentService {
  private getMetadata(target: any, key: string, metadataKey: string) {
    return Reflect.getMetadata(metadataKey, target, key);
  }

  private getFieldType(proto: any, key: string): string | undefined {
    return (
      this.getMetadata(proto, key, 'hayase:type')?.name ||
      this.getMetadata(proto, key, 'design:type')?.name
    );
  }

  private getFieldLabel(proto: any, key: string): string {
    return this.getMetadata(proto, key, 'hayase:label') ?? key;
  }

  private getRequiredFlag(
    proto: any,
    key: string,
    fallback?: boolean,
  ): boolean {
    return this.getMetadata(proto, key, 'hayase:required') ?? fallback ?? false;
  }

  private getElementType(proto: any, key: string): Type<any> {
    return this.getMetadata(proto, key, 'design:elementtype') || Object;
  }

  enrichFields(obj: any, entityClass: Type<any>): any {
    if (!obj || typeof obj !== 'object') {
      return {
        value: obj,
        type: typeof obj,
        name: undefined,
        label: undefined,
        required: false,
      };
    }

    const result = {};
    const proto = entityClass?.prototype;
    const schema = this.getEntitySchema(entityClass);
    const schemaMap = new Map(schema.map((field) => [field.name, field]));

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === undefined) continue;

      const schemaField = schemaMap.get(key) || {};
      const isArray = Array.isArray(value);
      const rawType = this.getMetadata(proto, key, 'design:type');
      const fieldType = this.getFieldType(proto, key);

      const enriched = {
        name: key,
        type: schemaField.type || fieldType || rawType?.name || typeof value,
        label: schemaField.label || this.getFieldLabel(proto, key),
        required:
          schemaField.required !== undefined
            ? schemaField.required
            : this.getRequiredFlag(proto, key),
        children: schemaField.children,
        options: schemaField.options,
        value,
      };

      if (schemaField.options) {
        enriched.options = schemaField.options;
      }

      if (value && typeof value === 'object') {
        if (
          isArray &&
          value.every((item) => item && typeof item === 'object')
        ) {
          const elementType = this.getElementType(proto, key);
          enriched.children = value.map((item: any) =>
            this.enrichFields(item, elementType),
          );
        } else if (!isArray && rawType?.name !== 'Date') {
          const nestedType =
            typeof fieldType === 'function' ? fieldType : Object;
          enriched.children = this.enrichFields(value, nestedType);
        }
      }

      result[key] = enriched;
    }

    return result;
  }

  getEntitySchema(entity: any): Array<Record<string, any>> {
    const schema: Array<Record<string, any>> = [];
    const proto = entity.prototype;

    const addField = (
      key: string,
      options: any,
      isEnum = false,
      enumValues?: any,
      requiredFlag?: boolean,
    ) => {
      const type =
        Reflect.getMetadata('hayase:type', proto, key) ||
        Reflect.getMetadata('design:type', proto, key);
      const label = this.getFieldLabel(proto, key);
      const required = this.getRequiredFlag(proto, key, requiredFlag);

      const field: any = {
        name: key,
        type: type?.name ?? 'unknown',
        label,
        required,
      };

      if (isEnum && enumValues) {
        field.options = Object.values(enumValues);
      }

      schema.push(field);
    };

    const columns = getMetadataArgsStorage().columns.filter(
      (c) => c.target === entity && c.options.select !== false,
    );
    const relations = getMetadataArgsStorage().relations.filter(
      (r) => r.target === entity && r.options?.eager,
    );

    for (const col of columns) {
      addField(
        col.propertyName,
        col.options,
        col.options.type === 'enum',
        col.options.enum,
        col.options.nullable === false,
      );
    }

    for (const rel of relations) {
      addField(
        rel.propertyName,
        rel.options,
        false,
        undefined,
        rel.options?.nullable === false,
      );
    }

    return schema;
  }
}
