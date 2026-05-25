"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./src/models/User"));
dotenv_1.default.config();
async function check() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const users = await User_1.default.find({}, 'name email');
        console.log('Registered Users:');
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));
    }
    catch (err) {
        console.error(err);
    }
    finally {
        mongoose_1.default.disconnect();
    }
}
check();
