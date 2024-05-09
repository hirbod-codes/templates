import { User } from '../Models/user.ts'

export default interface IUserRepository {
    create(user: User): Promise<any | null | undefined>
    createUserReader(fromUserKey: string, toUserKey: string, properties: string[]): Promise<void>
    createUserUpdater(fromUserKey: string, toUserKey: string, properties: string[]): Promise<void>
    createUserDeleter(fromUserKey: string, toUserKey: string): Promise<void>
    readWithIdCode(key: string, code: number): Promise<any | null>
    systemRead(userKeys: string | string[]): Promise<any[] | any | null>
    read(authorKey: string, userKeys: string | string[]): Promise<any[] | null>
    update(authorKey: string, users: any | any[]): Promise<boolean>
    updatePassword(userKey: string, password: string): Promise<any | null>
    updateEmail(userKey: string, email: string): Promise<any | null>
    updateVerificationCode(userKey: string, code: number | null, codeExpiresAt: number | null): Promise<any | null>
    delete(authorKey: string, userKeys: string | string[]): Promise<boolean>
}
