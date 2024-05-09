import * as yup from "yup";
import { loginDataSchema } from "./Models/auth.ts";
import jwt from "jsonwebtoken";

function testSchemas() {
  let a: any = {
    username: 'null',
    password: 'passaaaaaa',
  }

  const schema = loginDataSchema
  // const schema = yup.object().required().shape({
  //   name: yup.number().required(),
  //   age: yup.number().required().test('equal-1', '', (value, context) => {
  //     console.log(context.parent.name);
  //     console.log(typeof context.parent.name);
  //     console.log(value);
  //     console.log(typeof value);

  //     if (value != context.parent.name)
  //       return false
  //     else
  //       return true
  //   })
  // })

  try {
    let r = schema.isValidSync(a, { strict: false, stripUnknown: true, })
    console.log('r ==> \n', r);

    schema.validateSync(a)

    let validatedPayload = schema.cast(a, { stripUnknown: true })
    console.log('validatedPayload ==> \n', validatedPayload);
  } catch (error) {
    console.error(error);
  }
}

// function testJwt() {
//   let now = moment.utc()
//   let ts = now.unix()

//   let token = jwt.sign({}, 'secret', { algorithm: 'HS512', expiresIn: 10, jwtid: '123123123' })

//   let result: any = jwt.verify(token, 'secret', { algorithms: ['HS512'], maxAge: 10 })

//   console.log(`
//     now: ${now}
//     ts: ${ts}
//     token: ${token}
//     result: ${JSON.stringify(result)}
//     exp: ${moment.utc(result['exp'] * 1000)}
//     iat: ${moment.utc(result['iat'] * 1000)}
//   `);
// }

// testJwt()
