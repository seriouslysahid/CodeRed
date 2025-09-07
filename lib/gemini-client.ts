// lib/gemini-client.ts
// Resilient AI client with retry logic, circuit breaker, and fallback

import { log } from './logger';

// Circuit breaker state
let circuitOpenUntil = 0;
let consecutiveFailures = 0;
const MAX_FAILURES = 3;
const CIRCUIT_TIMEOUT = 30_000; // 30 seconds

// Configuration from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const PROJECT = process.env.GEMINI_PROJECT;
const LOCATION = process.env.GEMINI_LOCATION ?? 'us-central1';
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

// Types
export interface LearnerForNudge {
  name: string;
  completionPct: number;
  quizAvg: number;
  missedSessions: number;
  riskLabel?: 'low' | 'medium' | 'high';
}

// Simple retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on permanent errors (4xx except 429)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        const statusMatch = error.message.match(/HTTP (\d+)/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1]);
          if (status >= 400 && status < 500 && status !== 429) {
            throw error; // Don't retry 4xx errors except 429
          }
        }
      }
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        log.warn(`Retry attempt ${attempt + 1} after ${delay}ms`, { error: error.message });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Check if circuit breaker is open
export function isCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

// Record failure and potentially open circuit
function recordFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_FAILURES) {
    circuitOpenUntil = Date.now() + CIRCUIT_TIMEOUT;
    log.warn('Circuit breaker opened', { 
      consecutiveFailures, 
      timeoutMs: CIRCUIT_TIMEOUT 
    });
  }
}

// Record success and reset circuit
function recordSuccess(): void {
  consecutiveFailures = 0;
  if (circuitOpenUntil > 0) {
    log.info('Circuit breaker reset after successful call');
    circuitOpenUntil = 0;
  }
}

// Generate fallback template message
export function fallbackTemplate(learner: any, reason = ''): string {
  const name = learner?.name ?? 'Learner';
  const firstName = name.split(' ')[0];
  
  // Choose encouragement based on learner data
  let encouragement = "keep up the great work";
  let action = "complete a quick lesson";
  
  if (learner?.completionPct !== undefined) {
    if (learner.completionPct < 25) {
      encouragement = "every journey starts with a single step";
      action = "start with one 5-minute lesson";
    } else if (learner.completionPct < 50) {
      encouragement = "you're building great momentum";
      action = "complete one more module today";
    } else if (learner.completionPct < 75) {
      encouragement = "you're over halfway there";
      action = "take a quick practice quiz";
    } else {
      encouragement = "you're so close to the finish line";
      action = "finish strong with one final push";
    }
  }
  
  // Add risk-specific messaging
  if (learner?.riskLabel === 'high' && learner?.missedSessions > 5) {
    encouragement = "it's never too late to get back on track";
  } else if (learner?.riskLabel === 'low') {
    encouragement = "keep up the excellent work";
  }
  
  const templates = [
    `Hey ${firstName}, ${encouragement}! Try to ${action}. Small steps win! 🚀`,
    `Hi ${firstName}! ${encouragement} - ready to ${action}? 💪`,
    `${firstName}, ${encouragement}! How about you ${action}? You've got this! ⭐`,
    `Quick nudge, ${firstName}! ${encouragement}. Time to ${action}? 🎯`
  ];
  
  // Select template deterministically based on name
  const templateIndex = Math.abs(firstName.length) % templates.length;
  const message = templates[templateIndex];
  
  log.info('Generated fallback nudge', { 
    learnerName: firstName,
    reason: reason || 'fallback',
    templateIndex,
    textLength: message.length
  });
  
  return message;
}

// Build prompt for AI generation
function buildNudgePrompt(learner: LearnerForNudge): string {
  const riskContext = learner.riskLabel ? ` Risk level: ${learner.riskLabel}.` : '';
  
  return `You are a friendly, encouraging educational coach. Generate a personalized nudge for this learner:

Learner: ${learner.name}
Progress: ${learner.completionPct}% complete
Quiz Performance: ${learner.quizAvg}% average
Missed Sessions: ${learner.missedSessions}${riskContext}

Requirements:
- Write a short, encouraging message (20-160 characters)
- Include exactly ONE clear, actionable micro-step
- Use an upbeat, supportive tone
- Personalize using the learner's name
- Focus on small, achievable actions

Examples of good micro-steps:
- "Complete one 5-minute lesson"
- "Take a quick practice quiz"
- "Review yesterday's notes"
- "Watch one short video"

Generate only the nudge text, no explanations or formatting.`;
}

// Call Gemini API with retry logic
async function callGeminiAPI(prompt: string): Promise<string> {
  if (!API_KEY || !PROJECT) {
    throw new Error('Gemini API not configured');
  }

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.7,
        topP: 0.95
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response format from Gemini API');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

// Main nudge generation function
export async function generateNudge(prompt: string, meta: any = {}): Promise<string> {
  // TEST_MODE returns canned response
  if (process.env.TEST_MODE === 'true') {
    const learnerId = meta?.learnerId ?? 'anon';
    return `TEST NUDGE: Quick reminder — keep going! (${learnerId})`;
  }
  
  // Check circuit breaker
  if (isCircuitOpen()) {
    log.info('Circuit breaker open, using fallback', { meta });
    return fallbackTemplate(meta.learner, 'circuit-open');
  }
  
  try {
    // Attempt AI generation with retry
    const result = await retryWithBackoff(() => callGeminiAPI(prompt), 3);
    recordSuccess();
    
    log.info('AI nudge generated successfully', { 
      textLength: result.length,
      learnerId: meta?.learnerId 
    });
    
    return result;
  } catch (error) {
    recordFailure();
    
    log.warn('AI generation failed, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
      learnerId: meta?.learnerId,
      consecutiveFailures
    });
    
    return fallbackTemplate(meta.learner, String(error));
  }
}

// Streaming nudge generation (simplified for now)
export async function streamNudge(prompt: string, meta: any = {}): Promise<ReadableStream> {
  // TEST_MODE returns fake stream
  if (process.env.TEST_MODE === 'true') {
    const encoder = new TextEncoder();
    const testMessage = `TEST STREAM: Quick reminder — keep going! (${meta?.learnerId ?? 'anon'})`;
    
    return new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks
        const chunks = testMessage.split(' ');
        let index = 0;
        
        const sendChunk = () => {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(`data: {"text":"${chunks[index]} "}\n\n`));
            index++;
            setTimeout(sendChunk, 100); // 100ms delay between chunks
          } else {
            controller.enqueue(encoder.encode(`data: {"done":true}\n\n`));
            controller.close();
          }
        };
        
        sendChunk();
      }
    });
  }
  
  // For now, fall back to non-streaming and convert to stream
  try {
    const result = await generateNudge(prompt, meta);
    const encoder = new TextEncoder();
    
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: {"text":"${result}"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"done":true}\n\n`));
        controller.close();
      }
    });
  } catch (error) {
    const encoder = new TextEncoder();
    const fallback = fallbackTemplate(meta.learner, String(error));
    
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: {"error":"${error}","fallback":"${fallback}"}\n\n`));
        controller.close();
      }
    });
  }
}

// Helper function to generate nudge with learner context
export async function generateLearnerNudge(learner: LearnerForNudge): Promise<string> {
  const prompt = buildNudgePrompt(learner);
  return generateNudge(prompt, { learner, learnerId: learner.name });
}