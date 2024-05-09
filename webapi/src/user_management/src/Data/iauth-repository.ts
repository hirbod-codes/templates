import { LoginData } from '../Models/auth.ts'

export default interface IUserRepository {
    activateUser(userKey: string): Promise<boolean>
    loggingIn(data: LoginData): Promise<any>
    loggedIn(userKey: string): Promise<any>
    logout(userKey: string): Promise<boolean>
}
