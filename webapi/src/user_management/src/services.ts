import * as dotenv from 'dotenv'
dotenv.config()
import dbManager from './Database/database-manager.ts'
import { getDeletesCollection, getDeletesGraph, getReadsCollection, getReadsGraph, getUpdatesCollection, getUpdatesGraph, getUsersCollection } from './Database/arango-context.ts'
import UserRepository from './Data/arangodb/user-repository.ts'
import IUserRepository from './Data/iuser-repository.ts'
import IAuthRepository from './Data/iauth-repository.ts'
import { _key } from './Models/user.ts'
import AuthRepository from './Data/arangodb/auth-repository.ts'
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USERNAME!,
        clientId: process.env.GOOGLE_CLOUD_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLOUD_CLIENT_SECRET!,
        refreshToken: process.env.GOOGLE_CLOUD_REFRESH_TOKEN!
    }
})

export const db = await dbManager.arangodb.getDb(process.env.DATABASE_URL!.includes(',') ? process.env.DATABASE_URL!.split(',') : process.env.DATABASE_URL!, process.env.DATABASE_NAME!, process.env.DATABASE_PASSWORD!)

export const userRepository: IUserRepository = new UserRepository(
    db,
    await getUsersCollection(db),
    await getReadsCollection(db),
    await getUpdatesCollection(db),
    await getDeletesCollection(db),
    await getReadsGraph(db),
    await getUpdatesGraph(db),
    await getDeletesGraph(db)
)

export const authRepository: IAuthRepository = new AuthRepository(db, await getUsersCollection(db))
