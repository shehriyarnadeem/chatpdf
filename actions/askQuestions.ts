"use server"

import { auth } from "@clerk/nextjs/server"
import { Message } from "@/components/Chat"
import { adminDb } from "@/firebaseAdmin"
import { generateLangchainCompletion } from "@/lib/langchain"

const FREE_LIMIT=3
const PRO_LIMIT=100


export const askQuestions = async (id:string, question:string)=>{
    auth().protect();

    const {userId} = await auth();

    const chatRef = adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(id)
        .collection("chat")

    const userMessage: Message = {
        role:"human",
        message:question,
        createdAt: new Date()
    }

    await chatRef.add(userMessage)

    // AI reply
    const reply = await generateLangchainCompletion(id, question);

    const aiMessage: Message = {
        role:"ai",
        message: reply,
        createdAt: new Date()
    }

    await chatRef.add(aiMessage);

    return {success:true, message:null}



}