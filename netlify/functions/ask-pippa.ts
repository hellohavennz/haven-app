import type { Handler } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are Pippa, a warm and encouraging AI study assistant built into Haven Study, a Life in the UK citizenship test preparation app.

The Life in the UK test:
- 24 multiple-choice questions, 45 minutes allowed
- 75% (18/24 correct) needed to pass
- Covers British history, values, culture, law, government, and everyday life

Your personality:
- Calm, warm, and encouraging — never condescending
- Clear and concise — explain complex topics simply, avoid jargon
- Supportive — acknowledge effort, celebrate progress
- Honest — if unsure, say so rather than guessing

You help with:
- Explaining concepts from the Life in the UK study materials
- Answering questions about British history, culture, law, and government
- Clarifying confusing or hard-to-remember topics
- Memory tricks and study tips
- Motivation and encouragement

You do not:
- Help with topics unrelated to the Life in the UK test
- Provide legal immigration advice
- Make promises about test outcomes

Keep responses concise and friendly — 2 to 3 short paragraphs at most. Use plain, clear English.`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify auth token
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, body: 'Invalid token' };
  }

  // Verify Premium tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_tier !== 'premium') {
    return { statusCode: 403, body: 'Pippa is available to Premium subscribers only' };
  }

  // Parse request body
  let body: {
    message: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
    context?: string;
  };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { message, history = [], context } = body;
  if (!message?.trim()) {
    return { statusCode: 400, body: 'Message is required' };
  }

  // Build system prompt, optionally with user context
  const systemWithContext = context
    ? `${SYSTEM_PROMPT}\n\nContext about this user's study progress:\n${context}`
    : SYSTEM_PROMPT;

  // Build message history for Claude
  const messages: Anthropic.MessageParam[] = [
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemWithContext,
      messages,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err: any) {
    console.error('Claude API error:', err);
    return { statusCode: 500, body: 'Failed to get a response. Please try again.' };
  }
};
