import mongoose, { Schema, Document, Model } from "mongoose";

// --- User ---
export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  aiApiKey?: string;
  aiModel?: string;
  image?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  aiApiKey: { type: String },
  aiModel: { type: String },
  image: { type: String },
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

// --- Resource ---
export interface IResource extends Document {
  title: string;
  url: string;
  type: string;
  moduleId: mongoose.Types.ObjectId;
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
}, { timestamps: true });

resourceSchema.set('toObject', { virtuals: true });
resourceSchema.set('toJSON', { virtuals: true });

export const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>("Resource", resourceSchema);

// --- Quiz ---
export interface IQuiz extends Document {
  question: string;
  options: string; // JSON stringified
  correctAnswer: string;
  moduleId: mongoose.Types.ObjectId;
}

const quizSchema = new Schema<IQuiz>({
  question: { type: String, required: true },
  options: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
}, { timestamps: true });

quizSchema.set('toObject', { virtuals: true });
quizSchema.set('toJSON', { virtuals: true });

export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", quizSchema);

// --- Module ---
export interface IModule extends Document {
  title: string;
  content?: string;
  order: number;
  pathwayId: mongoose.Types.ObjectId;
}

const moduleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  content: { type: String },
  order: { type: Number, required: true },
  pathwayId: { type: Schema.Types.ObjectId, ref: "Pathway", required: true },
}, { timestamps: true });

// Virtuals to populate resources and quizzes
moduleSchema.virtual('resources', {
  ref: 'Resource',
  localField: '_id',
  foreignField: 'moduleId'
});
moduleSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'moduleId'
});
moduleSchema.set('toObject', { virtuals: true });
moduleSchema.set('toJSON', { virtuals: true });

export const Module: Model<IModule> = mongoose.models.Module || mongoose.model<IModule>("Module", moduleSchema);

// --- Pathway ---
export interface IPathway extends Document {
  title: string;
  description?: string;
  goal: string;
  userId: mongoose.Types.ObjectId;
}

const pathwaySchema = new Schema<IPathway>({
  title: { type: String, required: true },
  description: { type: String },
  goal: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Virtual for modules
pathwaySchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'pathwayId',
  options: { sort: { order: 1 } }
});
pathwaySchema.set('toObject', { virtuals: true });
pathwaySchema.set('toJSON', { virtuals: true });

export const Pathway: Model<IPathway> = mongoose.models.Pathway || mongoose.model<IPathway>("Pathway", pathwaySchema);
