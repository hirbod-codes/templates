import arango from 'arangojs'
import { GeneratedAqlQuery } from 'arangojs/aql.js'
import { CollectionType, DocumentCollection, EdgeCollection } from 'arangojs/collection.js'
import type ArangoError from 'arangojs/error.d.ts'
import { Graph } from 'arangojs/graph.js'
import { DocumentCollectionNames, EdgeCollectionNames, GraphNames } from './names.ts'

export async function getDb(url: string | string[], databaseName: string, password: string): Promise<arango.Database> {
    console.log(`Initializing database...`);

    const systemDB = new arango.Database({
        url: url,
        auth: {
            username: "root",
            password: password
        },
        arangoVersion: 308090
    })

    let db = new arango.Database({
        url: url,
        databaseName: databaseName,
        auth: {
            username: "root",
            password: password
        },
        arangoVersion: 308090
    })

    try {
        if (!(await systemDB.listDatabases()).includes(databaseName)) {
            console.log(`"${databaseName}" database doesn\'t exist, creating...`);
            db = await systemDB.createDatabase(databaseName, [{ username: "root", passwd: password }])
        }
    } catch (error) {
        if ((error as ArangoError.ArangoError).code === 401) {
            console.log(`invalid user credentials provided, updating credentials...`);
            await new arango.Database({
                url: url,
                auth: {
                    username: "root",
                    password: ""
                },
                arangoVersion: 308090
            }).updateUser("root", password)

            if (!(await systemDB.listDatabases()).includes(databaseName)) {
                console.log(`"${databaseName}" database doesn\'t exist, creating...`);
                db = await systemDB.createDatabase(databaseName, [{ username: "root", passwd: password }])
            }
        }
        else
            throw error
    }

    await getUsersCollection(db)

    await getReadsCollection(db)
    await getUpdatesCollection(db)
    await getDeletesCollection(db)

    await getReadsGraph(db)
    await getUpdatesGraph(db)
    await getDeletesGraph(db)

    console.log(`Database initialized.`);
    return db
}

export async function getUsersCollection(db: arango.Database): Promise<DocumentCollection<any>> {
    const collection = await getCollection(db, DocumentCollectionNames.USERS, false);
    try {
        await collection.index('username-unique')
    } catch (error) {
        if ((error as ArangoError.ArangoError).code == 404) {
            console.log('"username-unique" index doesn\'t exist, creating...');
            await collection.ensureIndex({ type: 'persistent', fields: ['username'], unique: true, name: 'username-unique', deduplicate: false, estimates: true })
        }
    }

    try {
        await collection.index('email-unique')
    } catch (error) {
        if ((error as ArangoError.ArangoError).code == 404) {
            console.log('"email-unique" index doesn\'t exist, creating...');
            await collection.ensureIndex({ type: 'persistent', fields: ['email'], unique: true, name: 'email-unique', deduplicate: false, estimates: true })
        }
    }

    return collection
}

export async function getReadsCollection(db: arango.Database): Promise<EdgeCollection<any>> {
    const collection = await getCollection(db, EdgeCollectionNames.READS, true)
    try {
        await collection.index('from-to-unique')
    } catch (error) {
        if ((error as ArangoError.ArangoError).code == 404) {
            console.log('"username-unique" index doesn\'t exist, creating...');
            await collection.ensureIndex({ type: 'persistent', fields: ['_from', '_to'], unique: true, name: 'from-to-unique', deduplicate: false, estimates: true })
        }
    }
    return collection
}
export async function getUpdatesCollection(db: arango.Database): Promise<EdgeCollection<any>> {
    const collection = await getCollection(db, EdgeCollectionNames.UPDATES, true)
    try {
        await collection.index('from-to-unique')
    } catch (error) {
        if ((error as ArangoError.ArangoError).code == 404) {
            console.log('"username-unique" index doesn\'t exist, creating...');
            await collection.ensureIndex({ type: 'persistent', fields: ['_from', '_to'], unique: true, name: 'from-to-unique', deduplicate: false, estimates: true })
        }
    }
    return collection
}
export async function getDeletesCollection(db: arango.Database): Promise<EdgeCollection<any>> {
    const collection = await getCollection(db, EdgeCollectionNames.DELETES, true)
    try {
        await collection.index('from-to-unique')
    } catch (error) {
        if ((error as ArangoError.ArangoError).code == 404) {
            console.log('"username-unique" index doesn\'t exist, creating...');
            await collection.ensureIndex({ type: 'persistent', fields: ['_from', '_to'], unique: true, name: 'from-to-unique', deduplicate: false, estimates: true })
        }
    }
    return collection
}

export function getCollection(db: arango.Database, collectionName: string, isEdgeCollection: boolean): Promise<EdgeCollection<any>>
export function getCollection(db: arango.Database, collectionName: string, isEdgeCollection: boolean): Promise<DocumentCollection<any>>
export async function getCollection(db: arango.Database, collectionName: string, isEdgeCollection: boolean = false): Promise<DocumentCollection<any> | EdgeCollection<any>> {
    let collection: DocumentCollection<any> | EdgeCollection<any> = db.collection(collectionName)
    if (!await collection.exists()) {
        console.log(`"${collectionName}" collection doesn\'t exist, creating...`);
        if (isEdgeCollection)
            collection = await db.createCollection(collectionName, { type: CollectionType.EDGE_COLLECTION })
        else
            collection = await db.createCollection(collectionName, { type: CollectionType.DOCUMENT_COLLECTION })
    }

    // await collection.truncate()
    return collection
}

export async function getReadsGraph(db: arango.Database): Promise<Graph> { return await getGraph(db, GraphNames.READS, EdgeCollectionNames.READS, DocumentCollectionNames.USERS, DocumentCollectionNames.USERS) }
export async function getUpdatesGraph(db: arango.Database): Promise<Graph> { return await getGraph(db, GraphNames.UPDATES, EdgeCollectionNames.UPDATES, DocumentCollectionNames.USERS, DocumentCollectionNames.USERS) }
export async function getDeletesGraph(db: arango.Database): Promise<Graph> { return await getGraph(db, GraphNames.DELETES, EdgeCollectionNames.DELETES, DocumentCollectionNames.USERS, DocumentCollectionNames.USERS) }

export async function getGraph(db: arango.Database, graphName: string, edgeCollectionName: string, fromCollections: string | string[], toCollections: string | string[]): Promise<Graph> {
    let graph = db.graph(graphName)
    if (!await graph.exists()) {
        console.log(`"${graphName}" graph doesn\'t exist, creating...`);
        graph = await db.createGraph(graphName, [{ collection: edgeCollectionName, from: fromCollections, to: toCollections }])
    }

    return graph
}

export async function readQuery(db: arango.Database, query: any): Promise<any[]> {
    return (await db.query(query)).all()
}

export const writeQuery = async (db: arango.Database, query: GeneratedAqlQuery<any>): Promise<any[]> => {
    return (await db.query(query)).all()
}
