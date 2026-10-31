import mongoose from 'mongoose';

const uploadedFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, maxlength: 255 },
    storedName: { type: String, required: true, unique: true },
    size: { type: Number, required: true, min: 1 },
    mimeType: {
      type: String,
      required: true,
      enum: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    status: { type: String, default: 'received', enum: ['received', 'reviewed'] },
    selectedPages: {
      type: [{
        pageNumber: { type: Number, required: true, min: 1 },
        text: { type: String, required: true, maxlength: 30000 },
      }],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model('UploadedFile', uploadedFileSchema);
