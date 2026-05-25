"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_mailjet_1 = __importDefault(require("node-mailjet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailjet = node_mailjet_1.default.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);
async function test() {
    try {
        const res = await mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.MAIL_FROM,
                        Name: 'Kairo'
                    },
                    To: [
                        {
                            Email: 'akinpeluoluwafemidavid@gmail.com',
                            Name: 'Test'
                        }
                    ],
                    Subject: 'Reset your Kairo password',
                    HTMLPart: '<h1>Test</h1>'
                }
            ]
        });
        console.log('Success:', res.body);
    }
    catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}
test();
