import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { OpenAIEmbeddings } from "@langchain/openai"
import { createStuffDocumentsChain} from "langchain/chains/combine_documents";
import { ChatPromptTemplate} from "@langchain/core/prompts";
import {createRetrievalChain} from "langchain/chains/retrieval"
import {createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever"
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from './pinecone'
import {PineconeStore} from "@langchain/pinecone"
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";


const model = new ChatOpenAI({
     apiKey:process.env.OPENAI_API_KEY,
     model: "gpt-4o-mini" }
    
    );

 export const indexName= "papafam"  
 
 const fetchMessagesFromDb =async(docId: string)=>{

    const {userId} = await auth()
    if(!userId){
        throw new Error("User not found")
    }
    console.log("Fetching chat history from the firestore database");
    const chats = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .get();

    const chatHistory = chats.docs.map((doc:any)=>{    
        return doc.data().role === "human"
                ? new HumanMessage(doc.data().message)
                : new AIMessage(doc.data().message)
    })

    console.log(`---- Fetched last ${chatHistory.length} messages successfully `)

    return chatHistory;

 }

 async function nameSpaceExists(index: Index, namespace: string){
    if(namespace === null) throw new Error("No namespace value provided");
    const { namespaces }  = await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined;

 }

 async function generateDocs(docId: string){
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not found")
    }

    const firebaseRef = await adminDb.collection('users').doc(userId).collection('files').doc(docId).get()
    const downloadUrl = firebaseRef.data()?.downloadUrl
    if(!downloadUrl){
        throw new Error("Now download URL found");
    }
    console.log("--Download URL fetched successfully")
    // Fetch the pdf from specified URL
    const response = await fetch(downloadUrl);

    // Load the PDF into PDFDocument object

    const data = await response.blob();


    // Load the PDF document from the specified path
    console.log("Load the PDF")
    const loader = new PDFLoader(data);
    const docs = await loader.load()

    console.log("---Splitting the document into smaller parts...---");
    const splitter = new RecursiveCharacterTextSplitter()
    
    const splitDocs = await splitter.splitDocuments(docs)
    console.log(`Split the documents into ${splitDocs.length} parts`)

    return splitDocs;
 }

 export async function generateEmbeddingsInPineCodeVectorStore(docId: string){

    const {userId} = await auth();
    if(!userId){
        throw new Error("User not found")
    }
   let pineconeVectorStore

   console.log("generate embeddings");
   const embeddings = new OpenAIEmbeddings();

   const index = await pineconeClient.index(indexName);
   const nameSpaceAlreadyExists = await nameSpaceExists(index, docId)
   if(nameSpaceAlreadyExists){
    console.log(`----Namespace -- ${docId} already exists, reusing existing embeddings`);

    pineconeVectorStore  = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex:index,
        namespace:docId
    })
    return pineconeVectorStore;
   } else {
    // If the namespace does not exists, download the PDF from firestore via the stored download
    // url & generate embeddings and store them in the pinecone vector store.

    const splitDocs = await generateDocs(docId);

    console.log(`--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store`)

    pineconeVectorStore = await PineconeStore.fromDocuments(
        splitDocs, embeddings,{pineconeIndex:index, namespace: docId}
    )
    
   }
 }


 const generateLangchainCompletion= async(docId: string, question:string)=>{

    let pineconeVectorStore;
    pineconeVectorStore = await generateEmbeddingsInPineCodeVectorStore(docId);
    if(!pineconeVectorStore){
        throw new Error("Pine vector store not found")
    }

    // Create a retriever to search through vector store
    console.log("----Creating a retriever");
    const retriever = pineconeVectorStore.asRetriever();

    // Fetch the chat history from database

    const chatHistory = await fetchMessagesFromDb(docId)

    // Define a prompt template for generating search queries based on a conversational history

    console.log("---Defining a prompt template----");

    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory,
        ["user", "{input}"],
        [
          "user",
          `Given the above conversation, generate a search query to look up in order to get
           information relevant to coversation`
        ]
    ])

    // Create a history aware-retreiver that uses the model, retreiver, prompt
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm:model,
        retriever: retriever,
        rephrasePrompt: historyAwarePrompt
    })

    console.log("---Defining a prompt template for answering questions");
    const historyAwareRetrieverPrompt = await ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ],
        ...chatHistory,
        ["user", "{input}"]
      
    ]);

    console.log("---Creating Document combining chain----");
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm:model,
        prompt:historyAwareRetrieverPrompt
    })

    console.log("---Create main retreival chain----");
    const conversationRetreivalChain = await createRetrievalChain({
        retriever:historyAwareRetrieverChain,
        combineDocsChain:historyAwareCombineDocsChain
    })

    console.log("---Running the chain with a sample conversation---");
    const reply = await conversationRetreivalChain.invoke({
        chat_history:chatHistory,
        input:question
    })

    console.log(reply.answer);
    return reply.answer;
    
 }

 export {model, generateLangchainCompletion}