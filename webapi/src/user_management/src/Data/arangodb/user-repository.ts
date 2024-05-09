import arango, { Database, aql } from 'arangojs'
import { User, userReadableProperties, userUpdatableProperties } from '../../Models/user.ts'
import IUserRepository from '../iuser-repository.ts'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection.js'
import { Graph } from 'arangojs/graph.js'
import { readQuery, writeQuery } from '../../Database/arango-context.ts'
import { errorWrapper } from "../data-helpers.ts";

export default class UserRepository implements IUserRepository {
    private _db: Database
    private _usersDocument: DocumentCollection
    private _edgeReads: EdgeCollection
    private _edgeUpdates: EdgeCollection
    private _edgeDeletes: EdgeCollection
    private _graphReads: Graph
    private _graphUpdates: Graph
    private _graphDeletes: Graph

    constructor(db: arango.Database, usersDocument: DocumentCollection, edgeReads: EdgeCollection, edgeUpdates: EdgeCollection, edgeDeletes: EdgeCollection, graphReads: Graph, graphUpdates: Graph, graphDeletes: Graph) {
        this._db = db
        this._usersDocument = usersDocument
        this._edgeReads = edgeReads
        this._edgeUpdates = edgeUpdates
        this._edgeDeletes = edgeDeletes
        this._graphReads = graphReads
        this._graphUpdates = graphUpdates
        this._graphDeletes = graphDeletes
    }

    async create(user: User): Promise<any | null | undefined> {
        const trx = await this._db.beginTransaction(
            {
                write: [
                    this._usersDocument,
                    this._edgeReads,
                    this._edgeUpdates,
                    this._edgeDeletes,
                ],
                read: [
                    this._usersDocument,
                    this._edgeReads,
                    this._edgeUpdates,
                    this._edgeDeletes,
                ]
            }
        )

        return await errorWrapper(
            async () => {
                let newUser: any[]

                newUser = await trx.step(async () => await writeQuery(this._db, aql`INSERT ${user} INTO ${this._usersDocument} RETURN NEW`))

                await trx.step(async () => await writeQuery(this._db, aql`INSERT {_from: ${newUser[0]._id}, _to: ${newUser[0]._id}, properties: ${userReadableProperties}} INTO ${this._edgeReads}`))

                await trx.step(async () => await writeQuery(this._db, aql`INSERT {_from: ${newUser[0]._id}, _to: ${newUser[0]._id}, properties: ${userUpdatableProperties}} INTO ${this._edgeUpdates}`))

                await trx.step(async () => await writeQuery(this._db, aql`INSERT {_from: ${newUser[0]._id}, _to: ${newUser[0]._id}} INTO ${this._edgeDeletes}`))

                const transactionResult = await this._db.transaction(trx.id).commit()

                console.debug('transactionResult.status: ', transactionResult.status)
                console.debug('user: ', user)

                if (transactionResult.status == 'aborted')
                    throw new Error('query failed')

                return newUser[0]
            },
            async () => {
                await this._db.transaction(trx.id).abort()
                return null
            }
        )
    }

    async createUserReader(fromUserKey: string, toUserKey: string, properties: string[]): Promise<void> {
        await errorWrapper(async () => {
            if (!properties || properties.length == 0)
                throw new Error("Invalid properties provided.")

            let relationship = {
                _from: `${this._usersDocument}/${fromUserKey}`,
                _to: `${this._usersDocument}/${toUserKey}`,
                properties: properties
            }

            await writeQuery(this._db, aql`INSERT ${relationship} INTO "${this._edgeReads}" RETURN NEW`)
        })
    }

    async createUserUpdater(fromUserKey: string, toUserKey: string, properties: string[]): Promise<void> {
        await errorWrapper(async () => {
            if (!properties || properties.length == 0)
                throw new Error("Invalid properties provided.")

            let relationship = {
                _from: `${this._usersDocument}/${fromUserKey}`,
                _to: `${this._usersDocument}/${toUserKey}`,
                properties: properties
            }

            await writeQuery(this._db, aql`INSERT ${relationship} INTO "${this._edgeUpdates}" RETURN NEW`)
        })
    }

    async createUserDeleter(fromUserKey: string, toUserKey: string): Promise<void> {
        await errorWrapper(async () => {
            let relationship = {
                _from: `${this._usersDocument}/${fromUserKey}`,
                _to: `${this._usersDocument}/${toUserKey}`,
            }

            await writeQuery(this._db, aql`INSERT ${relationship} INTO "${this._edgeDeletes}" RETURN NEW`)
        })
    }

    async readWithIdCode(key: string, code: number): Promise<any | null> {
        return await errorWrapper(
            async () => {
                return (await readQuery(this._db, aql`
                    FOR user IN ${this._usersDocument} 
                        FILTER user._key == ${key} && user.verificationCode == ${code}
                    RETURN user
                `))[0]
            },
            async () => null)
    }

    systemRead(userKeys: string): Promise<any | null>
    systemRead(userKeys: string[]): Promise<any[] | null>
    async systemRead(userKeys: string | string[]): Promise<any[] | any | null> {
        return await errorWrapper(
            async () => {
                let keys
                if (!Array.isArray(userKeys))
                    keys = [userKeys]
                else
                    keys = userKeys

                const result = await readQuery(this._db, aql`
                    FOR user IN ${this._usersDocument}
                        FILTER user._key IN ${keys}
                        RETURN user
                `)

                if (!result || result.length == 0)
                    return null

                if (Array.isArray(userKeys))
                    return result
                else
                    return result[0]
            },
            async () => null
        )
    }

    async read(authorKey: string, userKeys: string | string[]): Promise<any[] | null> {
        return await errorWrapper(
            async () => {
                let keys
                if (!Array.isArray(userKeys))
                    keys = [userKeys]
                else
                    keys = userKeys

                const userIds = keys.map(k => `${this._usersDocument.name}/${k}`)

                const result = await readQuery(this._db, aql`
                    LET userIds = ${userIds}
                    FOR v, e, p IN 1..1 OUTBOUND ${this._usersDocument}/${authorKey} GRAPH ${this._graphReads.name}
                        FOR edge IN p.edges
                            FILTER edge._from == ${this._usersDocument}/${authorKey} && edge._to IN ${userIds}
                            FOR u IN p.vertices
                                FILTER u._id == edge._to 
                                RETURN KEEP(u, APPEND(FLATTEN(edge.properties), ["_key"]))
                `)

                if (!result || result.length == 0)
                    return null

                if (Array.isArray(userKeys))
                    return result
                else
                    return result[0]
            },
            async () => null
        )
    }

    async update(authorKey: string, users: any | any[]): Promise<boolean> {
        return await errorWrapper(
            async () => {
                if (!Array.isArray(users))
                    users = [users]

                if (users.find((u: any) => !Object.keys(u).includes("_key")))
                    throw new Error("Invalid argument provided.")

                const result = await writeQuery(this._db, aql`
                    LET updates = ${users}
                    LET filteredUpdates = (
                        FOR v, e, p IN 1..1 OUTBOUND ${this._usersDocument}/${authorKey} GRAPH ${this._graphUpdates.name}
                            FOR u IN updates
                                FOR edge IN p.edges
                                    FILTER edge._from == ${this._usersDocument}/${authorKey} && edge._to == u._id && ATTRIBUTES(u, true) ALL IN edge.properties
                                    RETURN u
                    )

                    LET result = (LENGTH(FLATTEN(filteredUpdates)) == LENGTH(updates) 
                    ? (FOR u IN FLATTEN(filteredUpdates)
                        UPDATE u IN ${this._usersDocument}
                        RETURN true)[0]
                    : false)

                    RETURN result
                `)

                return result[0] as boolean
            },
            async () => false
        )
    }

    async updatePassword(userKey: string, password: string): Promise<any | null> {
        return await errorWrapper(
            async () => {
                const result = await writeQuery(this._db, aql`
                    UPDATE {_key: ${userKey}, password: ${password}} IN ${this._usersDocument}
                    RETURN NEW
                `)

                return result[0]
            },
            async () => null
        )
    }

    async updateEmail(userKey: string, email: string): Promise<any | null> {
        return await errorWrapper(
            async () => {
                const result = await writeQuery(this._db, aql`
                    UPDATE {_key: ${userKey}, email: ${email}, isActivated: false} IN ${this._usersDocument}
                    RETURN NEW
                `)

                return result[0]
            },
            async () => null
        )
    }

    async updateVerificationCode(userKey: string, code: number | null, codeExpiresAt: number | null): Promise<any | null> {
        if (code == null)
            codeExpiresAt = null

        return await errorWrapper(
            async () => {
                const result = await writeQuery(this._db, aql`
                    UPDATE {_key: ${userKey}, verificationCode: ${code}, verificationCodeExpiresAt: ${codeExpiresAt}} IN ${this._usersDocument}
                    RETURN NEW
                `)

                return result[0]
            },
            async () => null
        )
    }

    async delete(authorKey: string, userKeys: string | string[]): Promise<boolean> {
        return await errorWrapper(
            async () => {
                if (!Array.isArray(userKeys))
                    userKeys = [userKeys]

                const userIds = userKeys.map(k => `${this._usersDocument.name}/${k}`)

                const result = await writeQuery(this._db, aql`
                    LET userIds = ${userIds}
                    LET possibleKeys = (
                        FOR v, e, p IN 1..1 OUTBOUND ${this._usersDocument}/${authorKey} GRAPH ${this._graphDeletes.name}
                            FOR userId IN userIds
                                FOR edge IN p.edges
                                    FILTER edge._from == ${this._usersDocument}/${authorKey} && edge._to == userId
                                    RETURN userId
                    )

                    LET validKeys = LENGTH(FLATTEN(possibleKeys)) == LENGTH(userKeys) ? possibleKeys : []

                    LET result = (LENGTH(FLATTEN(validKeys)) == LENGTH(userKeys) 
                    ? (FOR key IN FLATTEN(validKeys)
                        REMOVE {_key: key} IN ${this._usersDocument}
                        RETURN true)[0]
                    : false)
                    
                    RETURN result
                `)

                return result[0] as boolean
            },
            async () => false
        )
    }
}
