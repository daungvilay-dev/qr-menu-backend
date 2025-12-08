import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isNil, merge } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { DataSource, Not, ObjectType } from 'typeorm';

interface Condition {
  entity: ObjectType<any>;
  /** If no field is specified, use the property being validated as the query key */
  field?: string;
  /** Custom error message for validation failure */
  message?: string;
}

/**
 * Validate that a field value is unique
 */
@ValidatorConstraint({ name: 'entityItemUnique', async: true })
@Injectable()
export class UniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    private dataSource: DataSource,
    private readonly cls: ClsService,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    // Build validation config for model and field
    const config: Omit<Condition, 'entity'> = {
      field: args.property,
    };

    const condition = ('entity' in args.constraints[0]
      ? merge(config, args.constraints[0])
      : {
          ...config,
          entity: args.constraints[0],
        }) as unknown as Required<Condition>;

    if (!condition.entity) return false;

    try {
      // Query for existing data; if present, validation fails
      const repo = this.dataSource.getRepository(condition.entity);

      // If no custom message, attempt to read column comment for messaging
      if (!condition.message) {
        const targetColumn = repo.metadata.columns.find(
          (n) => n.propertyName === condition.field,
        );
        if (targetColumn?.comment) {
          args.constraints[0].message = `The same already exists${targetColumn.comment}`;
        }
      }

      let andWhere = {};
      const operateId = this.cls.get('operateId');
      // When editing, exclude current record
      if (Number.isInteger(operateId)) {
        andWhere = { id: Not(operateId) };
      }

      return isNil(
        await repo.findOne({
          where: { [condition.field]: value, ...andWhere },
        }),
      );
    } catch (err) {
      // Validation fails on database errors
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { entity, field, message } = args.constraints[0] as Condition;
    const queryProperty = field ?? args.property;
    // if (!(args.object as any).getManager)
    //   return 'getManager function not been found!'

    if (!entity) return 'Model not been specified!';

    if (message) {
      return message;
    }

    // return `${queryProperty} of ${entity.name} must been unique!`
    return `${queryProperty} of ${entity.name} must been unique!`;
  }
}

/**
 * Validate data uniqueness
 * @param entity Entity class or validation condition object
 * @param validationOptions
 */
function IsUnique(
  entity: ObjectType<any>,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

function IsUnique(
  condition: Condition,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

function IsUnique(
  params: ObjectType<any> | Condition,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [params],
      validator: UniqueConstraint,
    });
  };
}

export { IsUnique };
