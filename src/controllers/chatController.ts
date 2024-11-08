import {Request, Response} from "express"
import {DataAPIClient} from "@datastax/astra-db-ts";
import OpenAI from "openai";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
// @ts-ignore
import {PuppeteerWebBaseLoader} from "langchain/document_loaders/web/puppeteer";
import "dotenv/config"
import log from "../logger";

// similarity metric
type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

// env variables
const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

// openai client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
})

// sample data and urls to scrape
const f1Data = [
    "https://www.google.com/search?q=latest+formula+1+news",
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://www.formula1.com/en/latest/all",
    "https://www.formula1.com/en/racing/2024.html",
    "https://www.motorsport.com/f1/news/",
    "https://www.skysports.com/f1",
    "https://www.formula1.com/en/latest",
    "https://www.newsnow.co.uk/h/Sport/F1",
    "https://www.bbc.com/sport/formula1",
    "https://www.planetf1.com/",
    "https://www.planetf1.com/news",
    "https://www.gptoday.com/news/recent/",
];

// Astra DB client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// @ts-ignore
const db = client.db(ASTRA_DB_API_ENDPOINT, {
    namespace: ASTRA_DB_NAMESPACE
})

// text splitter
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

// scrape data and vector data
export const scrapeDataAndVector = async (req: Request, res: Response) => {
    try {

        // create collection
        const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
            // @ts-ignore //ASTRA_DB_COLLECTION
            const res = await db.createCollection(ASTRA_DB_COLLECTION, {
                vector: {
                    dimension: 1536,
                    metric: similarityMetric,
                }
            })
            log.info(`res::${JSON.stringify(res)}`)
        }

        // load sample data
        const loadSampleData = async () => {
            // @ts-ignore
            const collection = db.collection(ASTRA_DB_COLLECTION);

            for await (const url of f1Data) {
                const content = await scrapePage(url);
                const chunks = await splitter.splitText(content);

                for await (const chunk of chunks) {
                    const embedding = await openai.embeddings.create({
                        model: "text-embedding-3-small",
                        input: chunk,
                        encoding_format: "float",
                    })

                    const vector = embedding.data[0].embedding;
                    const res = await collection.insertOne({
                        $vector: vector,
                        text: chunk,
                    })
                    log.info(`res:: ${JSON.stringify(res)}`)
                }
            }
        }

        // scrape page
        const scrapePage = async (url: string) => {
            const loader = new PuppeteerWebBaseLoader(url, {
                launchOptions: {
                    headless: true
                },
                gotoOptions: {
                    waitUntil: "domcontentloaded"
                },
                evaluate: async (page: any, browser: any) => {
                    const result = await page.evaluate(() => document.body.innerHTML)
                    await browser.close();
                    return result
                }
            });
            return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
        }

        /// create collection and load sample data
        await createCollection().then(() => {
            loadSampleData();
        })

        return res.status(200).json({
            code: 1,
            message: `F1gpt training data scrapping started`,
            data: {
                message: `F1gpt training data scrapping started`,
            }
        })
    } catch (e) {
        log.error(`Error:: ${e}`);
        return res.status(500).json({
            code: 0,
            "message": "Error to fetch data",
            data: {
                message: "Error to fetch data"
            }
        })
    }
}

/// chat with prompt
export const chatWithPrompt = async (req: Request, res: Response) => {
    try {
        const {message} = await req.body;

        if (!message) {
            return res.status(400).json({
                code: 0,
                "message": "Message is required",
                data: {
                    message: "Message is required"
                }
            })
        }

        let docContext = "";
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
            encoding_format: "float",
        })

        try {
            const collection = db.collection("f1gpt");
            // @ts-ignore
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding
                },
                limit: 10
            })

            const documents = await cursor.toArray();
            const docsMap = documents?.map(doc => doc.text);
            docContext = JSON.stringify(docsMap);
            log.info(`docContext:: ${docContext}`)
        } catch (e) {
            log.error(`error to querying database ${e}`)
            docContext = "";
        }

        // make chat
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        `You are an AI assistant who knows everything about Formula One. 
                        Use below context to augment what you know about Formula One racing.
                        The context will provide you with the most recent page data from wikipedia, the official F1 website and others.
                        If the context doesn't include the information you need answer based on your existing knowledge and don't mention the source of your information or what the context does or doesn't include.
                        Format responses using markdown where applicable and don't return images.
                        -------------
                        START CONTEXT
                        ${docContext}
                        "END CONTEXT"
                        ----------------
                        'QUESTION: ${message} 
                        ---------------`
                }
            ],
        });

        // response
        const chat = completion.choices[0]?.message?.content?.trim() || "No response generated";
        log.info(`${chat}:: ${JSON.stringify(chat)}`)

        // success
        return res.status(200).json({
            code: 1,
            message: "Success",
            data: {
                message: chat,
            },
        });
    } catch (e) {
        log.error(`error to chat with prompt:: ${e}`);
        return res.status(500).json({
            code: 0,
            "message": "Error to chat with prompt",
            data: {
                message: "Error to chat with prompt"
            }
        });
    }

}