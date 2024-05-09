import { Env, Hono } from 'hono'
import { authenticated, limiter } from '../middlewares.ts'
import { User, _key, email, password, userSchema } from '../Models/user.ts'
import * as bcrypt from 'bcryptjs'
import { DateTime } from 'luxon'
import { loginDataSchema, passwordConfirmation, userRegistrationSchema } from '../Models/auth.ts'
import * as yup from 'yup'
import { getJwtPayload, generateJwtToken } from '../Data/auth-helpers.ts'
import { authRepository, transporter, userRepository } from '../services.ts'
import { BlankSchema } from 'hono/types'
import { env } from 'hono/adapter'
import { envSchema } from '../index.ts'

const sendEmail = async (fromEmail: string, toEmail: string, subject: string, html: string) => await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: subject,
    html: html,
})

export function authRoutes(): Hono<Env, BlankSchema, "/"> {
    let app = new Hono()

    const authenticatedMiddleware = authenticated(userRepository)

    app.post('/register', limiter(5 * 60 * 1000, 10), async (c) => {
        const userRegistration = await c.req.json()

        if (!userRegistrationSchema.isValidSync(userRegistration, { stripUnknown: true }))
            return c.text('', 400)

        let user: User
        try {
            user = userSchema.cast({
                ...userRegistration,
                password: bcrypt.hashSync(userRegistration.password, Number((env<envSchema>(c).SALT_ROUNDS!))),
                isActivated: false,
                loggedOut: false,
                verificationCode: null,
                verificationCodeExpiresAt: null,
                createdAt: DateTime.utc().toUnixInteger(),
                updatedAt: DateTime.utc().toUnixInteger(),
            } as User, { stripUnknown: true })
        } catch (error) { return c.text('', 404) }

        const createdUser = await userRepository.create(user)

        if (!createdUser)
            return c.text('', 400)

        const token = generateJwtToken(createdUser._key!, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).VERIFICATION_JWT_MAX_AGE_SECONDS!))
        const host = env<envSchema>(c).HOST
        const link = `${host}/activate-account?token=${token}`
        console.log(token);
        await sendEmail(env<envSchema>(c).GMAIL_USERNAME, createdUser.email, 'Account activation', `<p><a href="${link}">Please click this link to verify your email.</a></p>`)

        return c.json({ _key: createdUser._key, jwt: generateJwtToken(createdUser._key!, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS!)) })
    })

    app.get('/activate-account', limiter(60 * 1000, 4), async (c) => {
        const { token } = c.req.query()

        const payload = getJwtPayload(token, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).VERIFICATION_JWT_MAX_AGE_SECONDS!))
        if (payload && await authRepository.activateEmail(payload.jti))
            return c.text('', 204)
        else
            return c.text('', 400)
    })

    app.post('/resend-activation-request', limiter(60 * 1000, 1), async (c) => {
        const { key } = c.req.query()

        const user = await userRepository.systemRead(key)
        if (!user)
            return c.text('', 400)

        const token = generateJwtToken(key, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).VERIFICATION_JWT_MAX_AGE_SECONDS!))
        const host = env<envSchema>(c).HOST
        const link = `http://${host}/activate-account?token=${token}`
        console.log(token);
        await sendEmail(env<envSchema>(c).GMAIL_USERNAME, user.email, 'Account activation', `<p><a href="${link}">Please click this link to verify your email.</a></p>`)

        return c.text('', 204)
    })

    app.post('/login', limiter(10 * 60 * 1000, 10), async (c) => {
        const params = await c.req.json()

        if (!loginDataSchema.isValidSync(params, { stripUnknown: true }))
            return c.text('', 400)

        const loginData = loginDataSchema.cast(params, { stripUnknown: true })

        let result: any = await authRepository.loggingIn(loginData)
        console.debug(loginData, result)

        if (!yup.object().shape({ _key: _key.required().nonNullable(), password: yup.string().required() }).isValidSync(result))
            return c.text('', 500)

        if (!bcrypt.compareSync(loginData.password, result.password))
            return c.notFound()

        result = await authRepository.loggedIn(result._key)
        if (!result)
            return c.text('', 500)

        return c.json({ jwt: generateJwtToken(result._key!, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS!)) }, 201)
    })

    app.post('/logout', authenticatedMiddleware, async (c) => {
        const payload = getJwtPayload(c, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS!))
        if (payload == null)
            return c.text('', 403)

        let result: boolean = await authRepository.logout(payload.jti)

        return result ? c.text('', 204) : c.text('', 500)
    })

    app.post('/verification-code', limiter(5 * 60 * 1000, 5), authenticatedMiddleware, async (c) => {
        let userEmail
        try { userEmail = (await c.req.json()).userEmail }
        catch (error) { return c.text('', 400) }

        if (!email.required().isValidSync(userEmail))
            return c.text('', 400)

        const payload = getJwtPayload(c, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS!))
        if (!payload)
            return c.text('', 401)

        const code = Math.floor(Math.random() * 900000) + 100000

        await userRepository.updateVerificationCode(payload.jti, code, DateTime.utc().plus({ seconds: Number(env<envSchema>(c).VERIFICATION_CODE_MAX_AGE_SECONDS!) }).toUnixInteger())

        await sendEmail(env<envSchema>(c).GMAIL_USERNAME, userEmail, 'Verification code', `code: ${code}`)

        return c.text('', 204)
    })

    app.post('/change-password', limiter(5 * 60 * 1000, 10), authenticatedMiddleware, async (c) => {
        let input
        try { input = await c.req.json() }
        catch (error) { return c.text('', 400) }

        if (!yup.object().required().shape({
            code: yup.number().required(),
            password: password.required(),
            passwordConfirmation: passwordConfirmation,
        }).isValidSync(input))
            return c.text('', 400)

        const payload = getJwtPayload(c, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS!))
        if (!payload)
            return c.text('', 500)

        let user = await userRepository.readWithIdCode(payload.jti, input.code)
        if (!user || user.verificationCodeExpiresAt < DateTime.utc().toUnixInteger())
            return c.text('', 400)

        await userRepository.updateVerificationCode(payload.jti, null, null)

        const hashedPassword = bcrypt.hashSync(input.password, Number(env<envSchema>(c).SALT_ROUNDS!))

        let result: any = await userRepository.updatePassword(payload.jti, hashedPassword)
        if (!bcrypt.compareSync(input.password, hashedPassword))
            return c.text('', 500)

        return c.text('', 204)
    })

    app.post('/change-email', limiter(5 * 60 * 1000, 10), authenticatedMiddleware, async (c) => {
        let input
        try { input = await c.req.json() }
        catch (error) { return c.text('', 400) }

        if (!yup.object().required().shape({
            code: yup.number().required(),
            email: email.required(),
        }).isValidSync(input))
            return c.text('', 400)

        const payload = getJwtPayload(c, env<envSchema>(c).JWT_SECRET!, Number(env<envSchema>(c).JWT_MAX_AGE_SECONDS!))
        if (!payload)
            return c.text('', 500)

        let user = await userRepository.readWithIdCode(payload.jti, input.code)
        if (!user)
            return c.text('', 400)

        await userRepository.updateVerificationCode(payload.jti, null, null)

        let result: any = await userRepository.updateEmail(payload.jti, input.email)
        if (result.email != input.email)
            return c.text('', 500)

        return c.text('', 204)
    })

    return app
}
