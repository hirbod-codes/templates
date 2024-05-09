import * as yup from "yup"
import jwt from 'jsonwebtoken'
import { _key } from '../Models/user.ts'
import { Context } from 'hono'

const jwtPayloadSchema = yup.object().required().shape({
    jti: _key.required(),
    exp: yup.number().required(),
    iat: yup.number().required(),
})

export interface JwtPayload extends yup.InferType<typeof jwtPayloadSchema> { }

export function getJwtPayload(token: string, jwtSecret: string, maxAge: number): JwtPayload | null
export function getJwtPayload(c: Context<any, any, {}>, jwtSecret: string, maxAge: number): JwtPayload | null
export function getJwtPayload(c: Context<any, any, {}> | string, jwtSecret: string, maxAge: number): JwtPayload | null {
    try {
        let token: string
        if (yup.object<Context<any, any, {}>>().isValidSync(c)) {
            let isToken = (c as Context<any, any, {}>).req.header('Authorization')?.split(' ')[1] ?? null
            if (!isToken)
                return null
            else
                token = isToken
        } else
            token = c as string

        const p = jwt.verify(token!, jwtSecret, { algorithms: ["HS512"], maxAge: maxAge })

        if (!jwtPayloadSchema.isValidSync(p, { strict: false }))
            return null

        return jwtPayloadSchema.cast(p, { assert: false, stripUnknown: true })
    } catch (error) {
        console.error('error while verifying jwt payload', JSON.stringify(error), error)
        return null
    }
}

export function generateJwtToken(id: string, secret: string, maxAge: number): string { return jwt.sign({}, secret, { algorithm: 'HS512', expiresIn: maxAge, jwtid: id }) }
