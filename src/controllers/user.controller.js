import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uplodOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req,res) =>{
  const {fullName,email,username,password} = req.body
  console.log("email :", email);

  if([fullName,email,username,password].some((field) => 
  field?.trim() ===""))
  {
    throw new ApiError(400,"All fieldare requerd")
  }

  const existedUser = await User.findOne({
    $or: [{username}, {email}]
  })
   if(existedUser){
    throw new ApiError(409, "user whith emali or username already exists")
   }
   const avatarLocalPath =req.files?.avatar?.[0]?.path;
   const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

   if(!avatarLocalPath){
    throw new ApiError(400,"avatar fils is requerd")
   }

   console.log("req.files:", req.files);


const avatar = await uplodOnCloudinary(avatarLocalPath);


const coverImage = await uplodOnCloudinary(coverImageLocalpath);


   if(!avatar){
    throw new ApiError(400,"avatar fils is requerd")
   }
 const user = await User.create({
    fullName,
    avatar:avatar.url,
    password,
    coverImage : coverImage?.url || "",
    email,
    username : username.toLowerCase()
  })
   const createdUser = await  User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500, "somthing went worng while registring  user")
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser, "user register successfully")
   )
})

export {registerUser}