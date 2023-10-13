import logger from './logger';
import dotenv from 'dotenv';
import fs from 'fs';
import { makeString } from './random-generator';

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.debug("Using .env.example file to supply config environment variables");
  dotenv.config({ path: ".env.example" });  // you can delete this after you create your own .env file!
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const SESSION_SECRET: string = process.env["SESSION_SECRET"] ?? makeString();
export const DB_CONNECTION_STRING: string | undefined = process.env["DB_CONNECTION_STRING"];
export const PATH_BASE: string = process.env["PATH_BASE"] ?? ""