import dotenv from 'dotenv';

dotenv.config({
    path: './.env',
});

export const MONGO_URI_CLOUD = process.env.MONGO_URI_CLOUD;
export const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL;