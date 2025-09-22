import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

// We can do a loose check to see if the response looks like the Paginated<T> structure
// from nestjs-paginate: { data, meta, ...maybe links }
function isPaginatedResponse(value: any): boolean {
  return (
    value
    && typeof value === 'object'
    && 'data' in value
    && 'meta' in value
  )
}

@Injectable()
export class PaginatedResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        // If it's not a paginated response, just return it as is
        if (!isPaginatedResponse(value)) {
          return value
        }

        // Otherwise, destructure and rename `data` -> `items`
        const { data, ...rest } = value
        return {
          items: data,
          ...rest,
        }
      }),
    )
  }
}
