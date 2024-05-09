import { Env, Hono } from 'hono'
import { BlankSchema } from 'hono/types'

export function testRoutes(): Hono<Env, BlankSchema, "/"> {
    let app = new Hono()

    // app.use(async (c, next) => {
    //     console.log(1);
    //     return await next()
    // }).get('/test1', (c) => c.text('test1'))

    // app.use(async (c, next) => {
    //     console.log(2);
    //     return await next()
    // }).get('/test2', (c) => c.text('test2'))

    const r1 = app.route('').use(async (c, next) => {
        console.log('m1');
        return await next()
    })

    r1.get(
        '/t1',
        async (c, next) => {
            console.log('t1-1');
            return await next()
        },
        async (c, next) => {
            console.log('t1-2');
            return await next()
        },
        (c) => {
            return c.text('t1')
        }
    )

    app.get(
        '/t2',
        (c) => {
            return c.text('t2')
        }
    )


    return app
}
