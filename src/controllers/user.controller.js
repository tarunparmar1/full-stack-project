import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uplodOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import  jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})
       
    return { accessToken, refreshToken}
  } catch (error) {

    throw new ApiError(500, "something went to worng while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async(req,res) =>{
  const {fullName,email,username,password} = req.body
  // console.log("email :", email);

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
   let coverImageLocalpath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length> 0){
    coverImageLocalpath = req.files.coverImage[0].path
   }

   if(!avatarLocalPath){
    throw new ApiError(400,"avatar fils is requerd")
   }

  //  console.log("req.files:", req.files);


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

const loginUser = asyncHandler(async(req,res) =>{
 const {email, username, password} = req.body

 if(!username && !email ){
  throw new ApiError(400, "username or email is requird")
 }

 const user = await User.findOne({
  $or:[{username}, {email}]
 }).select("+password");
 if(!user){
  throw new ApiError(404, "User does not exist")
 }
 const isPasswordValid = await user.isPasswordCorrect(password)
 
 if(!isPasswordValid ){
  throw new ApiError(404, "User does not exist")
 }
 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

 const option = {
  httpOnly: true,
  secure: true 
 }
 return res
 .status(200)
 .cookie("accessToken", accessToken,option)
 .cookie("refreshToken", refreshToken,option)
 .json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,
      refreshToken
    },
    "user logged in successful"
  )
 )


})

const logoutUser = asyncHandler(async(req,res) => {
await User.findByIdAndUpdate(
  req.user._id,{
    $set:{
      refreshToken: undefined
    }
  },
  {
    new: true
  }
)


 const option = {
  httpOnly: true,
  secure: true 
 }

 return res
 .status(200)
 .clearCookie("accessToken", option)
 .clearCookie("refreshToken", option)
 .json(
  new ApiResponse(200,{},"User logged out")
 )
})

const refreshAccessToken = asyncHandler(async (req,res) =>
{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request")
  }
 try {
   const decodedToken = Jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new ApiError(401,"Invalide refresh token")
   }
 
   if(incomingRefreshToken != user?.refreshToken){
     throw new ApiError(401, "refresh token is expired or used")
   }
 
   const options = {
     httpOnly:true,
     secure:true
   }
  const {accessToken, newRefreshToken} =  await generateAccessAndRefreshTokens(user._id)
 
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newRefreshToken, options)
 .json(
   200,
   {
      accessToken,
      refreshToken: newRefreshToken
   },
   "access token refreshed"
 )
 } catch (error) {
  throw new ApiError(401, error?.message || "invalide refresh token")
 }
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}