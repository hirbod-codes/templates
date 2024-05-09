import { createMiddleware } from "hono/factory"
import IUserRepository from "./Data/iuser-repository.ts"
import jwt, { JwtPayload } from 'jsonwebtoken'
import * as yup from "yup"
import { _key, loggedOut } from "./Models/user.ts"
import { getJwtPayload } from "./Data/auth-helpers.ts"
import { rateLimiter } from "hono-rate-limiter";
import { env } from "hono/adapter"
import { envSchema } from "./index.ts"

export const limiter = (windowMs: number, limit: number = 100) => rateLimiter({
    windowMs: windowMs,
    limit: limit,
    standardHeaders: 'draft-6',
    keyGenerator: (c) => c.req.header("x-forwarded-for")?.split(",")[0].trim() || 'no IP',
    message: `Too many requests! Please try again a few minutes later.`
})

export const authenticated = (userRepository: IUserRepository) => createMiddleware(async (c, next) => {
    try {
        const payload = getJwtPayload(c, env<envSchema>(c).JWT_SECRET, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS))
        if (payload == null) {
            console.debug('no payload');
            return c.text('', 401)
        }

        const user = await userRepository.systemRead(payload.jti!)
        const userSchema = yup.object().required().shape({
            loggedOut: loggedOut,
        })

        if (!userSchema.isValidSync(user)) {
            console.debug('invalid user schema', user);
            return c.text('', 401)
        }

        if (user.loggedOut) {
            console.debug('user logged out');
            return c.text('', 401)
        }

        return await next()
    } catch (error) {
        console.error(error);

        return c.text('', 401)
    }
})

export const isActivated = (userRepository: IUserRepository) => createMiddleware(async (c, next) => {
    try {
        const payload = getJwtPayload(c, env<envSchema>(c).JWT_SECRET, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS))
        if (payload == null)
            return c.text('', 403)

        const user = await userRepository.systemRead(payload.jti)
        const userSchema = yup.array().required().length(1).of(
            yup.object().required().shape({
                isActivated: yup.boolean().required(),
            })
        )

        if (!userSchema.isValidSync(user) || user[0].isActivated != true)
            return c.text('', 403)

        return await next()
    } catch (error) {
        return c.text('', 403)
    }
})

export const isNotActivated = (userRepository: IUserRepository) => createMiddleware(async (c, next) => {
    try {
        let token = c.req.header('Authorization')?.split(' ')[1] ?? null
        if (!token)
            return c.text('', 403)
        const p = jwt.verify(token!, env<envSchema>(c).JWT_SECRET, { algorithms: ["HS512"] }) as JwtPayload

        const schema = yup.object().required().shape({
            jti: yup.string().required(),
        })

        if (!schema.isValidSync(p, { strict: false }))
            return c.text('', 403)

        const payload = schema.cast(p, { assert: false, stripUnknown: true })

        const userSchema = yup.array().required().length(1).of(
            yup.object().required().shape({
                isActivated: yup.boolean().required(),
            })
        )

        const user = userSchema.cast(await userRepository.systemRead(payload.jti))

        if (user == null || !user![0])
            return c.text('', 403)

        if (user[0].isActivated != false)
            return c.text('', 403)

        return await next()
    } catch (error) {
        return c.text('', 403)
    }
})