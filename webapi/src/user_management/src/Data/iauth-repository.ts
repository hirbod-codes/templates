import { LoginData } from '../Models/auth.ts'

export default interface IUserRepository {
    activateEmail(userKey: string): Promise<boolean>
    loggingIn(data: LoginData): Promise<any | null>
    loggedIn(userKey: string): Promise<any | null>
    logout(userKey: string): Promise<boolean>
}
