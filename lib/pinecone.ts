import { Pinecone } from '@pinecone-database/pinecone';


if(!process.env.PINECONE_SECRET_KEY){
    throw new Error('Pine code secret key not set')
}
const pindCodeClient = new Pinecone({
  apiKey: 'a2785324-40db-4314-8f9c-7823907b36af'
});

export default pindCodeClient;