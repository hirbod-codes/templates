import * as yup from "yup";

const passwordRegEx = /[a-zA-Z%&|$#@!_\. -]/
const numericRegEx = /[0-9]/
const alphaRegEx = /[a-zA-Z]/
const alphaNumericRegEx = /[a-zA-Z0-9]/

export const _key = yup.string().matches(numericRegEx, { excludeEmptyString: true })
export const username = yup.string().trim().min(4).matches(/[a-zA-Z0-9_.-]/, { excludeEmptyString: true })
export const email = yup.string().trim().email()
export const password = yup.string().trim().min(8).matches(passwordRegEx, { name: 'password', message: 'invalid password', excludeEmptyString: true })
export const hashedPassword = yup.string()
export const firstName = yup.string().trim().min(2).matches(alphaRegEx, { excludeEmptyString: true })
export const lastName = yup.string().trim().min(4).matches(alphaRegEx, { excludeEmptyString: true })
export const isActivated = yup.boolean()
export const verificationCode = yup.number().min(100000).max(999999)
export const verificationCodeExpiresAt = yup.number()
export const loggedOut = yup.boolean()
export const updatedAt = yup.number()
export const createdAt = yup.number()

export const userSchema = yup.object().required().shape({
    _key: _key.optional().nonNullable(),
    username: username.required(),
    email: email.required(),
    password: hashedPassword.required(),
    firstName: firstName.optional().nullable(),
    lastName: lastName.optional().nullable(),
    isActivated: isActivated.required().nonNullable().default(false),
    verificationCode: verificationCode.required().nullable().default(null),
    verificationCodeExpiresAt: verificationCodeExpiresAt.required().nullable().default(null),
    loggedOut: loggedOut.nonNullable().default(true),
    updatedAt: updatedAt.required().nonNullable(),
    createdAt: createdAt.required().nonNullable(),
})

export interface User extends yup.InferType<typeof userSchema> { }

export const userReadableProperties = [
    "username",
    "email",
    "firstName",
    "lastName",
    "updatedAt",
    "createdAt",
]

export const userUpdatableProperties = [
    "firstName",
    "lastName",
]
