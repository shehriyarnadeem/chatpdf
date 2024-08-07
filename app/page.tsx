import {
  BrainCogIcon,
  ZapIcon,
  GlobeIcon
} from "lucide-react"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";


const features = [
  {
    name:"Store your PDF documents",
    description:"Store all your documents here",
    icon: GlobeIcon
  },
  {
    name:"Blazing your PDF documents",
    description:"Store all your documents here",
    icon: BrainCogIcon
  },
  {
    name:"Unique your PDF documents",
    description:"Store all your documents here",
    icon: ZapIcon
  },
  {
    name:"Okay take your PDF documents",
    description:"Store all your documents here",
    icon: GlobeIcon
  },
]

export default function Home() {
  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl"> 
         <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                 Your interactive document companion
             </h2>
             <p className="mt-2 text-3xl font-bold tracking-light text-gray-900 sm:text-6xl ">
              Transform Your PDFs into interactive Conversations
             </p>
             <p>
              Introducing{" "}
              <br />
              <br />Upload your document, and our chatbox will answer
              questions, summarize content and answer all your Qs. Ideal for everyone, <span className="text-indigo-600">
                Chat with Pdf
              </span>{" "}
              turns static document into{" "}
              <span className="font-bold">dynamic conversations</span>,
              enhancing productivity 10x fold effortlessly
             </p>
             </div>
             <Button asChild className="mt-10">
                <Link href="/dashboard">Get started</Link>
             </Button>
         </div>
         <div className="relative overflow-hidden pt-16">
           <div className="mx-auto max-w-7xl px-6 lg:px-8">
             <Image
              alt="App screenshot"
              src="https://i.imgur.com/VciRSTI.jpeg"
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
              <div className="relative">
                <div className="absolute bottom-0 inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]">
                </div>
              </div>
           </div>

         </div>

      </div>
    </main>
  );
}
