"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function run() {
    try {
        const email = `test_${Date.now()}@example.com`;
        console.log('Registering user:', email);
        await axios_1.default.post('http://localhost:8000/api/auth/register', {
            name: 'Test User',
            email: email,
            password: 'password123'
        });
        console.log('Registered successfully.');
        console.log('Requesting password reset...');
        const res = await axios_1.default.post('http://localhost:8000/api/auth/forgot-password', {
            email: email
        });
        console.log('Reset response:', res.status, res.data);
    }
    catch (err) {
        console.error('Error in flow:', err.response?.status, err.response?.data || err.message);
    }
}
run();
