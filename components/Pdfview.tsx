
"use client"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"


import {Document, Page, pdfjs} from "react-pdf"
import { useEffect, useState } from "react"
import { version as pdfjsVersion } from 'pdfjs-dist/package.json';

import { Button } from "./ui/button"
import { Loader2Icon,  RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
function Pdfview({url}: {url:string}) {

    const [file, setFile] = useState<Blob | null>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>();
    const [scale, setScale] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(1);


    useEffect(()=>{
        const fetchFile = async()=>{
            console.log(url,'---url')
            const response = await fetch(url);
            console.log(response,'--response')
            const file = await response.blob()
            setFile(file);
        }
         fetchFile();
    }, [url]);

    const onDocumentLoadSuccess = ({numPages}:{numPages:number}):void=>{
        setNumPages(numPages);
    }
  return (
    <div className="flex flex-col justify-center items-center w-full">
        <div className="flex flex-col">
            <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={pageNumber === 1}
                  onClick={()=>{
                    if(pageNumber >1){
                        setPageNumber(pageNumber - 1)
                    }
                  }}

                  >
                    Previous
                 </Button>
                 <p className="flex items-center justify-center" >
                    {pageNumber} of {numPages}
                 </p>
                 <Button
                  variant="outline"
                  disabled={pageNumber === numPages}
                  onClick={()=>{
                    if(numPages){
                        if(pageNumber < numPages){
                        setPageNumber(pageNumber + 1)
                        }
                    }
                  }}

                  >
                    Next
                 </Button>
            </div>
        </div>
        {!file ? (
            <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600"/>
        ):(
          <div className="">

            <Document
                loading={null}
                file={file}
                rotate={rotation}
                onLoadSuccess={onDocumentLoadSuccess}
                className="m-4 overflow-scroll"
            >
            <Page className="shadow-lg" scale={scale} pageNumber={pageNumber}/>
           </Document>
           </div>

        )}
    </div>
  )
}

export default Pdfview