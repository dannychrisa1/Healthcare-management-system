'use server'

import { ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PROJECT_ID, PATIENT_COLLECTION_ID, storage, users } from "../appwrite.config"
import { parseStringify } from "../utils";
import { InputFile} from "node-appwrite/file"



export const createUser = async (user: CreateUserParams) => {
    try {

        const newuser =  await users.create(ID.unique(), user.email, user.phone, undefined, user.name)

        return parseStringify(newuser);

    } catch (error:any) {
        if (error && error?.code === 409) {
            const existingUser = await users.list([
                Query.equal("email", [user.email])
            ])

            return existingUser?.users[0]

        }
        console.error("An error occurred while creating a new user:", error);
    }
}

export const getUser = async(userId:string) => {
    try{
        const user = await users.get(userId)   
        return parseStringify(user)
    }catch(error){
        console.log(error)
    }
}
export const getPatient = async(userId:string) => {
  try{
      const patients = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [ Query.equal('userId', userId) ]
      ) 
      return parseStringify(patients.documents[0])
  }catch(error){
      console.log(error)
  }
}

export const registerPatient = async({identificationDocument, ...patient}:RegisterUserParams) => {
    try{
      let file;
      if (identificationDocument instanceof FormData) {
        const blobFile = identificationDocument.get('blobFile') as Blob;
        const fileName = identificationDocument.get('fileName') as string;
  
        if (blobFile && fileName) {
          try {
            const inputFile = InputFile.fromBuffer(blobFile, fileName);
            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile,  ['read("any")'] );
          } catch (error) {
            console.error("Error creating file in storage:", error);
          }
        } else {
          console.log('Blob file or file name is missing.');
        }
      }

     console.log(
        {
            file,
            identificationDocumentId: file?.$id || null,
            identificationDocumentUrl:`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
            ...patient
            
         }
     )

     console.log("Database ID:", DATABASE_ID);
     if (!DATABASE_ID) {
        throw new Error("Database ID is missing. Please ensure DATABABSE_ID is correctly set.");
      }

      const newPatient = await databases.createDocument(
        DATABASE_ID,
        PATIENT_COLLECTION_ID!,
        ID.unique(),
         {
            identificationDocumentId: file?.$id || null,
            identificationDocumentUrl:`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
            ...patient
            
         }
      )
      return parseStringify(newPatient);
    }catch(error){
        console.log(error);
    }
}