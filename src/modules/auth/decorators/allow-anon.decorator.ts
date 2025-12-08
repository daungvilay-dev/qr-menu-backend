import { SetMetadata } from '@nestjs/common'

import { ALLOW_ANON_KEY } from '../auth.constant'

/**
 * Add this decorator when the interface does not need to detect whether the user has operation permissions
 */
export const AllowAnon = () => SetMetadata(ALLOW_ANON_KEY, true)
