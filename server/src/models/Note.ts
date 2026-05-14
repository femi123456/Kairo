import mongoose, { Schema } from 'mongoose';

export interface INote {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  tags: string[];
  pageColor: string;
  paperStyle: string;
  fontFamily: string;
  noteWidth: string;
  isPublic: boolean;
  shareId: string | null;
  versions: { body: string; savedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    body: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    pageColor: {
      type: String,
      default: 'default',
      enum: ['default', 'cream', 'yellow', 'green', 'blue', 'pink', 'dark', 'graphite'],
    },
    paperStyle: {
      type: String,
      default: 'blank',
      enum: ['blank', 'lined', 'grid', 'dotted'],
    },
    fontFamily: {
      type: String,
      default: 'sans',
      enum: ['sans', 'serif', 'mono'],
    },
    noteWidth: {
      type: String,
      default: 'normal',
      enum: ['normal', 'wide'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    versions: {
      type: [
        {
          body: { type: String, required: true },
          savedAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1 });

// Max 10 versions stored, oldest dropped when exceeded
noteSchema.pre('save', function () {
  if (this.versions && this.versions.length > 10) {
    this.versions = this.versions.slice(-10);
  }
});

const Note = mongoose.model<INote>('Note', noteSchema);

export default Note;
