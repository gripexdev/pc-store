import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
	keycloakId: string;
	username: string;
	email: string;
	role: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
	{
		keycloakId: { type: String, required: true, unique: true },
		username: { type: String, required: true },
		email: { type: String, required: true },
		role: { type: String, enum: ["user", "admin"], default: "user" },
	},
	{
		timestamps: true, // automatically manage createdAt and updatedAt
	}
);

export default mongoose.model<IUser>("User", UserSchema);
