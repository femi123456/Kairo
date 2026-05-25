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
    const selectedText = noteContext?.selectedText || '';
    let body = noteContext?.body || '';
    
    // strip HTML tags
    body = body.replace(/<[^>]*>?/gm, '');
    // truncate to 1000 chars
    if (body.length > 1000) {
      body = body.substring(0, 1000);
    }

    let systemPrompt = `You are Kairo AI, a helpful writing assistant inside Kairo, a collaborative notes app. Help the user with their note. Be concise and useful.
Always format your responses using markdown. Use bullet points for lists, **bold** for emphasis, headers for sections when appropriate. Keep responses concise — 2 to 4 sentences for simple questions, longer only when generating or rewriting content.
When the user asks to rewrite or improve specific text, only return the rewritten version, nothing else.
Current note context:
Title: ${title}
Tags: ${tags}
Content: ${body}`;

    if (selectedText) {
      systemPrompt += `\n\nThe user has selected this specific text in their note:
'${selectedText}'
When they ask to rewrite, improve, or do anything to 'this' or 'it', they mean this selected text.`;
    }

    const validHistory = Array.isArray(history) ? history.slice(-10) : [];

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
        temperature: 0.7,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    const stream = groqResponse.data;
    let buffer = '';

    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n');
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    });

    stream.on('end', () => {
      // Process any remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
          } catch {
            // Skip
          }
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', () => {
      res.write('data: [ERROR]\n\n');
      res.end();
    });
  } catch (error) {
    console.error('Kairo AI error:', error);
    // If headers already sent (streaming started), just end
    if (res.headersSent) {
      res.write('data: [ERROR]\n\n');
      res.end();
    } else {
      res.status(500).json({ message: 'Kairo AI request failed' });
    }
  }
};

export const formatVoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      res.status(400).json({ message: 'Transcript is required' });
      return;
    }

    const systemPrompt = `You are an AI assistant in a note-taking app. Your job is to take raw, unformatted voice dictation from the user and format it into clean, structured Markdown. 
Rules:
- Fix grammatical errors and punctuation without changing the intended meaning.
- Use headers (##, ###) if the text naturally breaks into sections.
- Use bullet points for lists if the user lists items.
- Output ONLY the formatted markdown, no conversational filler.`;

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const formattedText = groqResponse.data.choices?.[0]?.message?.content || '';
    res.status(200).json({ formattedText });
  } catch (error) {
    console.error('Format voice error:', error);
    res.status(500).json({ message: 'Formatting failed' });
  }
};
