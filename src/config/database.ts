import mongoose, { connect } from "mongoose";
import bluebird from "bluebird";

export const databaseConnect = async (dbConnectionString: string | undefined) => {
  try {
    if (!dbConnectionString){
      throw new Error('DB_CONNECTION_STRING NOT DEFINED');
    }

    mongoose.Promise = bluebird;
    
    await connect(dbConnectionString as string);
    console.log('mongodb connected');
  }
  catch (err: any){
    console.error(err.message);
  }
}