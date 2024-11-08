import express, {Express, NextFunction, Request, Response} from "express"
import cors from "cors"
import * as bodyParser from "body-parser";
import dotenv from "dotenv";
import v1F1ChatRoutes from "./routes/routes";

// load dotenv config
dotenv.config()

/// port and host
const port: number = 3000
const host: string = "localhost"

// express app
const app: Express = express();
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

/// F1 Chatbot with DRAG (Retrieval Augmented Generation)
app.use('/api/v1', v1F1ChatRoutes)

app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    res.json(
        {
            welcome: "Welcome to F1GPT Backend",
            data: {
                version: "1.0.0",
                message: "Highly secure and robust backend system",
                softwareEngineer: "https://github.com/tayyabmughal676",
            },
        }
    )
});


// listen to port
app.listen(port, host, async () => {
    console.info(`Dev Server is running: http://${host}:${port}`)
});