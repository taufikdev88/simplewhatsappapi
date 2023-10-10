import mongoose from "mongoose";

// create an interface representing document in mongoDB
interface IOtpValid {
    otpId: string,
    sender: string;
    recipient: string;
    callbackType: string;
    callbackUrl: string;
    isValidated: boolean;
}

interface OtpValidModelInterface extends mongoose.Model<OtpValidDoc> {
    build(attr: IOtpValid): OtpValidDoc
}

interface OtpValidDoc extends mongoose.Document {
    otpId: string,
    sender: string;
    recipient: string;
    callbackType: string;
    callbackUrl: string;
    isValidated: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// create a schema corresponding to the document interface
const otpValidSchema = new mongoose.Schema<OtpValidDoc>({
    otpId: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    recipient: {
        type: String,
        required: true,
    },
    callbackType: {
        type: String,
        required: false,
    },
    callbackUrl: {
        type: String,
        required: false,
    },
    isValidated: {
        type: Boolean,
        required: true,
        default: false
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

otpValidSchema.statics.build = (attr: IOtpValid) => {
    return new OtpValid(attr);
}

// create a model
const OtpValid = mongoose.model<OtpValidDoc, OtpValidModelInterface>('OtpValidated', otpValidSchema);

export { OtpValid }