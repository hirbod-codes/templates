import * as dgraph from 'dgraph-js-http';
import https from 'https'
import fs from 'fs'

export const getDGraphClient = async (hostAddress: string, userId: string, password: string): Promise<dgraph.DgraphClient> => {
    const ca = fs.readFileSync('./security/dgraph_certificates/ca.crt')
    const cert = fs.readFileSync('./security/dgraph_certificates/client.ratel.crt')
    const key = fs.readFileSync('./security/dgraph_certificates/client.ratel.key')

    const agent = new https.Agent({
        cert,
        ca,
        key,
    })
    const clientStub = new dgraph.DgraphClientStub(hostAddress, {}, { agent });

    await clientStub.login(userId, password);

    return new dgraph.DgraphClient(clientStub);
};

export const createData = async (dgraphClient: dgraph.DgraphClient) => {
    const txn = dgraphClient.newTxn();
    try {
        const p = {
            name: "Alice",
            age: 26,
            married: true,
            loc: {
                type: "Point",
                coordinates: [1.1, 2],
            },
            dob: new Date(1980, 1, 1, 23, 0, 0, 0),
            friend: [
                {
                    name: "Bob",
                    age: 24,
                },
                {
                    name: "Charlie",
                    age: 29,
                }
            ],
            school: [
                {
                    name: "Crown Public School",
                }
            ]
        };

        const assigned = await txn.mutate({ setJson: p });

        await txn.commit();

        console.log(`Created person named "Alice" with uid = ${assigned.data.uids["blank-0"]}\n`);

        console.log("All created nodes (map from blank node names to uids):");
        Object.keys(assigned.data.uids).forEach((key) => console.log(`${key} => ${assigned.data.uids[key]}`));
        console.log();
    } finally {
        await txn.discard();
    }
}

export const queryData = async (dgraphClient: dgraph.DgraphClient) => {
    const query = `query all($a: string) {
        all(func: eq(name, $a)) {
            uid
            name
            age
            married
            loc
            dob
            friend {
                name
                age
            }
            school {
                name
            }
        }
    }`;
    const vars = { $a: "Alice" };
    const res = await dgraphClient.newTxn().queryWithVars(query, vars);
    const ppl: any = res.data;

    console.log(`Number of people named "Alice": ${ppl.all.length}`);
    ppl.all.forEach((person: any) => console.log(person));
}

export const dropAll = async (dgraphClient: dgraph.DgraphClient) => {
    await dgraphClient.alter({ dropAll: true });
}

export const setSchema = async (dgraphClient: dgraph.DgraphClient) => {
    const schema = `
        name: string @index(exact) .
        age: int .
        married: bool .
        loc: geo .
        dob: datetime .
    `;
    await dgraphClient.alter({ schema: schema });
}

export default { getDGraphClient, createData, queryData, dropAll, setSchema }
