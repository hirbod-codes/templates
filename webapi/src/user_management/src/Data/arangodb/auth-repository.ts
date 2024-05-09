import * as yup from "yup";
import IAuthRepository from '../iauth-repository.ts'
import { LoginData } from '../../Models/auth.ts';
import { readQuery, writeQuery } from '../../Database/arango-context.ts';
import { DocumentCollection } from 'arangojs/collection.js'
import arango, { Database, aql } from 'arangojs';
import { errorWrapper } from "../data-helpers.ts";

export default class AuthRepository implements IAuthRepository {
    private _db: Database
    private _usersDocument: DocumentCollection

    constructor(db: arango.Database, usersDocument: DocumentCollection) {
        this._db = db
        this._usersDocument = usersDocument
    }

    async activateEmail(key: string): Promise<boolean> {
        return await errorWrapper(
            async () => {
                const result = await writeQuery(this._db, aql`
                    UPDATE {_key: ${key}, isActivated: true} INTO ${this._usersDocument}
                    RETURN NEW
                `)

                return result[0].isActivated
            },
            async () => false
        )
    }

    async loggingIn(data: LoginData): Promise<any> {
        return await errorWrapper(
            async () => {
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
            },
            async () => null
        )
    }

    async loggedIn(userKey: string): Promise<any> {
        return await errorWrapper(
            async () => {
                return (await readQuery(this._db, aql`
                    UPDATE { _key: ${userKey}, loggedOut: false } IN ${this._usersDocument}
                    RETURN NEW
                `))[0]
            },
            async () => null
        )
    }

    async logout(key: string): Promise<boolean> {
        return await errorWrapper(
            async () => {
                key = yup.string().required().min(1).cast(key)
                const result = await readQuery(this._db, aql`
                    UPDATE { _key: ${key}, loggedOut: true } IN ${this._usersDocument}
                    RETURN NEW
                `)

                return result[0].loggedOut
            },
            async () => null
        )
    }
}
