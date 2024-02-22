import { ratelimit } from "@/lib/ratelimit";

export async function GET(req: Request ) {
    try {
    //   const res = await req.()

      const ip = req.headers.get('x-forwarded-for') ?? ''
   
      const data = await ratelimit.limit(ip)
      if(!data.success) {
        return new Response("You can only send 1 req / 30min.", {
          status: 429,
        })
      }
  
    return new Response(JSON.stringify({status:"OK"}))

    }catch(err) {
      console.log('Error has occured : ' , err)
    }
}


export async function POST(req: Request ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res = await req.json()

      const ip = req.headers.get('x-forwarded-for') ?? ''
      // you can use the response or the user id here instead of ip - 
    //   const {id} = res - by sending as the user id as a post requst 
      const data = await ratelimit.limit(ip)
      if(!data.success) {
        return new Response("You can only send 1 req / 30min.", {
          status: 429,
        })
      }
  
    return new Response(JSON.stringify({status:"OK" , ...res}))

    }catch(err) {
      console.log('Error has occured : ' , err)
    }
}