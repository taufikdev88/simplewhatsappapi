import mongoose, { connect } from "mongoose";
import bluebird from "bluebird";
import logger from "../util/logger";

export const databaseConnect = async (dbConnectionString: string | undefined) => {
  try {
    if (!dbConnectionString){
      throw new Error('DB_CONNECTION_STRING NOT DEFINED');
    }

    mongoose.Promise = bluebird;
    
    await connect(dbConnectionString as string);
    logger.info('mongodb connected');
  }
  catch (err: any){
    console.error(err.message);
  }
}