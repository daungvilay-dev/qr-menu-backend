import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DataSource, ObjectType, Repository } from 'typeorm'

interface Condition {
  entity: ObjectType<any>
  // If no field is specified, use the current property being validated as the query key
  field?: string
}

/**
 * Check whether a value exists for a given field in the database
 */
@ValidatorConstraint({ name: 'entityItemExist', async: true })
@Injectable()
export class EntityExistConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: string, args: ValidationArguments) {
    let repo: Repository<any>

    if (!value)
      return true
    // Default comparison field is id
    let field = 'id'
    // Get the repository from the provided entity
    if ('entity' in args.constraints[0]) {
      // Condition object provided, field can be specified
      field = args.constraints[0].field ?? 'id'
      repo = this.dataSource.getRepository(args.constraints[0].entity)
    }
    else {
      // Entity class provided directly
      repo = this.dataSource.getRepository(args.constraints[0])
    }
    // Validate by checking whether the record exists
    const item = await repo.findOne({ where: { [field]: value } })
    return !!item
  }

  defaultMessage(args: ValidationArguments) {
    if (!args.constraints[0])
      return 'Model not been specified!'

    return `All instance of ${args.constraints[0].name} must been exists in databse!`
  }
}

/**
 * Validate entity existence
 * @param entity Entity class or validation condition object
 * @param validationOptions
 */
function IsEntityExist(
  entity: ObjectType<any>,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsEntityExist(
  condition: { entity: ObjectType<any>, field?: string },
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsEntityExist(
  condition: ObjectType<any> | { entity: ObjectType<any>, field?: string },
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [condition],
      validator: EntityExistConstraint,
    })
  }
}

export { IsEntityExist }
