"use client"

import { generateEmbeddings } from "@/actions/generateEmbeddings"
import { db, storage } from "@/firebase"
import { useUser } from "@clerk/nextjs"
import { doc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { useRouter } from "next/router"
import { useState } from "react"
const { v4: uuidv4 } = require('uuid');

export enum StatusText {
    UPLOADING = "Uplading file",
    UPLOADED = "File uploaded successfully",
    SAVING = "Saving file to database",
    GENERATING = "Generating embeddings",


}

export type Status = StatusText[keyof StatusText]

function useUpload() {

    const [progress, setProgress] = useState<number | null>(null)
    const [fileId, setFileId] = useState<string | null>(null)
    const [status, setStatus] = useState<Status | null>(null)

    const {user} = useUser()

    const handleUpload = async (file:File) =>{
        if(!file || !user) return;

        console.log(file,'file here')

        // TODO: FREE/PRO plan validation check ... tommorow

        const fileToUploadTO = uuidv4()

        const storageRef = ref(storage, `users/${user.id}/files/${fileToUploadTO}`)
        console.log(storageRef,'storage ref');

        const uploadTask = uploadBytesResumable(storageRef, file);

        console.log(uploadTask,'uploadTasl');

        uploadTask.on("state_changed", (snapshot) =>{
            const percent  = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) *100)

            setStatus(StatusText.UPLOADING);
            setProgress(percent);
            console.log(percent,'--percent');
        }, (error) =>{
            console.log("error uploading the file", error)
        }, async () =>{
            setStatus(StatusText.UPLOADED)
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(downloadUrl,'--downloadUrl');
            setStatus(StatusText.SAVING);
            const response = await setDoc(doc(db,'users',user.id, 'files', fileToUploadTO), {
                name: file.name,
                size: file.size,
                type: file.type,
                downloadUrl: downloadUrl,
                ref: uploadTask.snapshot.ref.fullPath,
                createdAt: new Date()
            });

            console.log(response,'---response');

            setStatus(StatusText.GENERATING)
            // todo generate AI embeddings;
           await generateEmbeddings(fileToUploadTO)

            setFileId(fileToUploadTO);

        }
    )
    }
    return {status, progress, fileId, handleUpload}
}

export default useUpload