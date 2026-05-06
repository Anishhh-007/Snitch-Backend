import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGO_URI) {
    throw new Error("MONGO URI is not defined in env variables")
}
if(!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not defined")
}if(!process.env.VITE_URI) {
    throw new Error("JWT secret is not defined")
}if(!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID  is not defined")
}if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET  is not defined")
}

if(!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY  is not defined")
}
if(!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY  is not defined")
}


export const config = {
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    VITE_URI : process.env.VITE_URI,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    MISTRAL_API_KEY:process.env.MISTRAL_API_KEY
}