import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;

const extractText =async(filepath:string , mimetype:string)=>{
    const buffer =fs.readFileSync(filepath)
        if(mimetype.includes(".pdf")){
 const data = await pdfParse(buffer)
   return data.text;
        }else{
                const result = await mammoth.extractRawText({ path:filepath });
                  return result.value;
        }
           

   

}

 export const parseResumeFile =async(filePath: string, mimetype: string)=>{
  const text = await extractText(filePath, mimetype);
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
      const skillsList = ["python","javascript","react","node","aws","docker"];
       const foundSkills = skillsList.filter(s => text.toLowerCase().includes(s));

       return{
          rawText: text,
    emails,
    phones,
    skills: Array.from(new Set(foundSkills)),
    summary: text.split("\n").slice(0, 5).join(" ")
       }
}
