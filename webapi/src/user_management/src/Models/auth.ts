import * as yup from "yup";
import { password, email, username, firstName, lastName } from "./user.ts";

export const loginDataSchema = yup.object().required().shape({
    password: password.required(),
    email: email.optional().nullable().test('email-test', (value, context) => !(value && context.parent.username) && (value || context.parent.username)),
    username: username.optional().nullable().test('username-test', (value, context) => !(value && context.parent.email) && (value || context.parent.email)),
})

export interface LoginData extends yup.InferType<typeof loginDataSchema> { }

export const passwordConfirmation = yup.string().required().test('confirmation-test', 'Password confirmation doesn\'t match with password', (value, context) => value == context.parent.password)

export const userRegistrationSchema = yup.object().required().shape({
    password: password.required(),
    passwordConfirmation: passwordConfirmation,
    username: username.required(),
    email: email.required(),
    firstName: firstName.optional(),
    lastName: lastName.optional(),
})

export interface UserRegistration extends yup.InferType<typeof userRegistrationSchema> { }
