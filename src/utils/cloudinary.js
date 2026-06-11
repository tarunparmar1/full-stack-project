import {V2 as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({
      cloud_name = process.env.CLOUDINARY_CLOUD_NAME,
      api_key = process.env.CLOUDINARY_API_KEY,
      api_secret =CLOUDINARY_API_SECRET
});

const uplodOnCloudinary = async (localFilePath) => {
// file upload on cloudinary
      try{
            if(!localFilePath)return null
            const response = await cloudinary.uploder.upload
            (localFilePath,{
                 resource_type: "auto"
            })
            //file uploaded 
            console.log("file upload on cloudinary",response.url);
            return response;
      }
      catch(error){
            fs.unlink(localFilePath)  // remove the localy save temp file as the uploder opretaion got faild
            return null;


      }
}


export {uplodOnCloudinary}
