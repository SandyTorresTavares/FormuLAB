import mongoose from 'mongoose';

const formulaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    lab: { type: String, required: true, trim: true, maxlength: 200 },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'Arquivo', trim: true, maxlength: 100 },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Em Análise', trim: true, maxlength: 50 },
    ingredients: {
      type: [{ type: String, trim: true, maxlength: 300 }],
      default: [],
    },
    summary: { type: String, default: '', maxlength: 5000 },
    procedure: { type: String, default: '', maxlength: 20000 },
    patentNotes: { type: String, default: '', maxlength: 5000 },
    extractedText: { type: String, default: '', maxlength: 500000 },
    sourceFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedFile' },
    sourcePages: { type: [{ type: Number, min: 1 }], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = result._id.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  },
);

export default mongoose.model('Formula', formulaSchema);
