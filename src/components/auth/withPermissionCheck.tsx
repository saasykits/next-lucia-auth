/*
@Author: siddiquiaffan
*/

import React from 'react'
import type { Role } from '@/server/db/schema'
import { checkAccess } from '@/lib/auth/check-access'
import { redirect } from 'next/navigation'

type Options = ({
    Fallback: React.FC
}) | ({
    redirect: string
})

const DefaultFallback = () => <div>Permission denied</div>

/**
 * 
 * A high order component which takes a component and roles as arguments and returns a new component.
 * @example 
 * ```
 * withPermissionCheck(
 *     MyComponent,
 *     ['user', 'moderator'],
 *     { Fallback: () => <div>Permission denied</div> }
 *  )
 * ```
 */

// eslint-disable-next-line
const withPermissionCheck = <T extends Record<string, any>>(Component: React.FC<T>, roles: Role[], options?: Options): React.FC<T> => {

    return async (props: T) => {

        const hasPermission = await checkAccess(roles)

        if (!hasPermission) {
            if (options && 'redirect' in options) {
                redirect(options.redirect)
            } else {
                const Fallback = options?.Fallback ?? DefaultFallback
                return <Fallback />
            }
        }

        return <Component {...props} />
    }
};


export default withPermissionCheck
