import { Request, Response } from 'express';
import axios from 'axios';

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, noteContext, history } = req.body;

    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    const title = noteContext?.title || '';
    const tags = noteContext?.tags?.join(', ') || '';
    let body = noteContext?.body || '';
    
    // strip HTML tags
    body = body.replace(/<[^>]*>?/gm, '');
    // truncate to 1000 chars
    if (body.length > 1000) {
      body = body.substring(0, 1000);
    }

    const systemPrompt = `You are Kairo AI, a helpful writing assistant inside Kairo, a collaborative notes app. Help the user with their note. Be concise and useful.
Current note context:
Title: ${title}
Tags: ${tags}
Content: ${body}`;

    const validHistory = Array.isArray(history) ? history.slice(-10) : [];

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...validHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = groqResponse.data?.choices?.[0]?.message?.content || '';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Kairo AI error:', error);
    res.status(500).json({ message: 'Kairo AI request failed' });
  }
};
