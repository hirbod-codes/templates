import { ArangoError } from "arangojs/error.js"

export async function errorWrapper(action: () => Promise<any>, errorCallback: () => Promise<any> = async () => { }): Promise<any> {
    try {
        return await action()
    } catch (error) {
        console.error('error in account creation transaction.\n', JSON.stringify(error) + '\n', error)

        const errorNum = Number((error as ArangoError).errorNum)
        if ([1200, 1202, 1203, 1204, 1205, 1207, 1208, 1210, 1216, 1221, 1222, 1226, 1227].includes(errorNum))
            return await errorCallback()
        else
            throw error
    }
}
