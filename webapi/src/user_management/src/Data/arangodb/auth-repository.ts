import * as yup from "yup";
import IAuthRepository from '../iauth-repository.ts'
import { LoginData } from '../../Models/auth.ts';
import { readQuery, writeQuery } from '../../Database/arango-context.ts';
import { DocumentCollection } from 'arangojs/collection.js'
import arango, { Database, aql } from 'arangojs';
import { ArangoError } from "arangojs/error.js";

export default class AuthRepository implements IAuthRepository {
    private _db: Database
    private _usersDocument: DocumentCollection

    constructor(db: arango.Database, usersDocument: DocumentCollection) {
        this._db = db
        this._usersDocument = usersDocument
    }

    private async errorWrapper(action: () => Promise<any>, errorCallback: () => Promise<any> = async () => { }): Promise<any> {
        try {
            return await action()
        } catch (error) {
            console.error('error in account creation transaction.\n', JSON.stringify(error) + '\n', error)

            await errorCallback()

            const errorNum = Number((error as ArangoError).errorNum)
            if ([1200, 1202, 1203, 1204, 1205, 1207, 1208, 1210, 1216, 1221, 1222, 1226, 1227].includes(errorNum))
                return null
            else
                throw error
        }
    }

    async activateUser(key: string): Promise<boolean> {
        return await this.errorWrapper(async () => {
            const result = await writeQuery(this._db, aql`
                UPDATE {_key: ${key}, isActivated: true} INTO ${this._usersDocument}
                RETURN NEW
            `)

            return result[0].isActivated
        })
    }

    async loggingIn(data: LoginData): Promise<any> {
        return await this.errorWrapper(async () => {
            const value = data.username ?? data.email
            if (data.username)
                return (await readQuery(this._db, aql`
                    FOR user IN ${this._usersDocument}
                        FILTER user.isActivated == true && user.username == ${value}
                        RETURN user
                `))[0]
            else
                return (await readQuery(this._db, aql`
                    FOR user IN ${this._usersDocument}
                        FILTER user.isActivated == true && user.email == ${value}
                        RETURN user
                `))[0]
        })
    }

    async loggedIn(userKey: string): Promise<any> {
        return await this.errorWrapper(async () => {
            return (await readQuery(this._db, aql`
                UPDATE { _key: ${userKey}, loggedOut: false } IN ${this._usersDocument}
                RETURN NEW
            `))[0]
        })
    }

    async logout(key: string): Promise<boolean> {
        return await this.errorWrapper(async () => {
            key = yup.string().required().min(1).cast(key)
            const result = await readQuery(this._db, aql`
                UPDATE { _key: ${key}, loggedOut: true } IN ${this._usersDocument}
                RETURN NEW
            `)

            return result[0].loggedOut
        })
    }
}
