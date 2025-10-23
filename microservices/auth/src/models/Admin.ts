import mongoose, { Document, Schema } from 'mongoose';
import { ObjectId } from 'mongoose';

export interface IAdmin extends Document {
    _id: ObjectId;
    email: string;
    passwordHash: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        trim: true
    },
    passwordHash: { 
        type: String, 
        required: true,
        select: false
    },
    name: { 
        type: String,
        trim: true,
        maxlength: 50
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc: any, ret: any) {
            if (ret.passwordHash) delete ret.passwordHash;
            if (ret.__v) delete ret.__v;
            return ret;
        }
    }
});

// Index for better query performance
AdminSchema.index({ email: 1 });

export default mongoose.model<IAdmin>('Admin', AdminSchema);