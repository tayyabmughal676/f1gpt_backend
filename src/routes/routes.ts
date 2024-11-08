import {Router} from "express";
import {chatWithPrompt, scrapeDataAndVector} from "../controllers/chatController";

const v1F1ChatRoutes: Router = Router();

// @ts-ignore
v1F1ChatRoutes.route("/f1gpt/training").get(scrapeDataAndVector)
// @ts-ignore
v1F1ChatRoutes.route("/f1gpt/chat").post(chatWithPrompt)

export default v1F1ChatRoutes;