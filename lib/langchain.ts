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