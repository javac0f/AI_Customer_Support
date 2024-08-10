import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = ''

//POST FUNCTION (HANDLES INCOMING REQUESTS)
export async function POST(req){
    const openai = new OpenAI() //OPENAI model object
    /*
    const ollama = new ChatOllama({
        baseURL: process.env.OLLAMA_BASE_URL,
        model:"mistral",
    })
    */
    const data = await req.json()

    // GENERATE ANSWER USING OPENAI (COMPLETION)
    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: 'gpt-4o-mini',
        stream: true,
    })


    //EXPORT TO FRONT-END (STREAM)
    const stream = new readableStream({
        async start(controller){
        const encoder = new TextEncoder()
        try{
            for await(const chunk of completion){
                const content = chunk.choices[0]?.delta?.content  //extract chunk content
                
                if(content){
                    const text = encoder.encode(content)
                    AbortController.enqueue(text)
                }
            }
        }catch(err){
            controller.error(err)
        }finally{
            controller.closer()
        }

        
        //SEND RESPONSE (RETURN STREAM)
        return new NextResponse(stream)
        }
    })






}