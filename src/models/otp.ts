import mongoose from "mongoose";

// create an interface representing document in mongoDB
interface IOtp {
  recipient: string;
  cs: string;
}

interface OtpModelInterface extends mongoose.Model<OtpDoc> {
  build(attr: IOtp): OtpDoc
}

interface OtpDoc extends mongoose.Document {
  recipient: string;
  cs: string;
  isValidated: boolean;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// create a schema corresponding to the document interface
const otpSchema = new mongoose.Schema<OtpDoc>({
  recipient: {
    type: String,
    required: true,
  },
  cs: {
    type: String,
    required: true,
  },
  isValidated: {
    type: Boolean,
    required: true,
    default: false
  },
  expiredAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 2 * 60 * 1000), // default expired 2 min from now
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

otpSchema.statics.build = (attr: IOtp) => {
  return new Otp(attr);
}

// create a model
const Otp = mongoose.model<OtpDoc, OtpModelInterface>('Otp', otpSchema);

export { Otp }