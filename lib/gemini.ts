// lib/gemini.ts
// Google Gemini AI integration for nudge generation with streaming support

import { log } from './logger';
import { ExternalServiceError } from './errors';

// Configuration from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const PROJECT = process.env.GEMINI_PROJECT;
const LOCATION = process.env.GEMINI_LOCATION ?? 'us-central1';
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

// Learner interface for nudge generation
export interface LearnerForNudge {
  name: string;
  completionPct: number;
  quizAvg: number;
  missedSessions: number;
  riskLabel?: 'low' | 'medium' | 'high';
}

// Nudge generation result
export interface NudgeResult {
  text: string;
  source: 'gemini' | 'template';
  streaming: boolean;
}

// Check if Gemini is properly configured
export function isGeminiConfigured(): boolean {
  return !!(API_KEY && PROJECT);
}

// Build a personalized prompt for nudge generation
export function buildNudgePrompt(learner: LearnerForNudge): string {
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

// Attempt to generate nudge using Gemini with streaming
export async function streamGemini(prompt: string): Promise<ReadableStream> {
  if (!isGeminiConfigured()) {
    throw new ExternalServiceError('Gemini', 'Missing API key or project configuration');
  }

  log.info('Attempting Gemini streaming generation', { 
    model: MODEL, 
    location: LOCATION,
    promptLength: prompt.length 
  });

  // Vertex AI REST endpoint for streaming generation
  // Note: This is a simplified implementation. In production, consider using:
  // 1. Google Cloud Client Libraries with proper OAuth
  // 2. Service Account authentication instead of API keys
  // 3. Proper error handling for different response formats
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // In production, use proper OAuth token
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
          topP: 0.95,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      log.error('Gemini API error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      throw new ExternalServiceError('Gemini', `HTTP ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new ExternalServiceError('Gemini', 'No response body received');
    }

    log.info('Gemini streaming started successfully');
    return response.body;

  } catch (error) {
    log.error('Gemini streaming failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      model: MODEL 
    });
    
    if (error instanceof ExternalServiceError) {
      throw error;
    }
    
    throw new ExternalServiceError('Gemini', 
      error instanceof Error ? error.message : 'Unknown streaming error'
    );
  }
}

// Non-streaming Gemini generation as fallback
export async function generateGeminiNudge(prompt: string): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new ExternalServiceError('Gemini', 'Missing API key or project configuration');
  }

  log.info('Attempting non-streaming Gemini generation');

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  try {
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
      throw new ExternalServiceError('Gemini', `HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new ExternalServiceError('Gemini', 'Invalid response format');
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();
    log.info('Gemini generation successful', { textLength: generatedText.length });
    
    return generatedText;

  } catch (error) {
    log.error('Non-streaming Gemini generation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    if (error instanceof ExternalServiceError) {
      throw error;
    }
    
    throw new ExternalServiceError('Gemini', 
      error instanceof Error ? error.message : 'Unknown generation error'
    );
  }
}

// Generate fallback nudge using templates
export function fallbackNudge(learner: LearnerForNudge): string {
  const firstName = learner.name.split(' ')[0];
  
  // Choose action based on completion and risk level
  let action: string;
  let encouragement: string;
  
  if (learner.completionPct < 25) {
    action = 'start with one 5-minute lesson';
    encouragement = "every journey starts with a single step";
  } else if (learner.completionPct < 50) {
    action = 'complete one more module today';
    encouragement = "you're building great momentum";
  } else if (learner.completionPct < 75) {
    action = 'take a quick practice quiz';
    encouragement = "you're over halfway there";
  } else {
    action = 'finish strong with one final push';
    encouragement = "you're so close to the finish line";
  }
  
  // Add risk-specific messaging
  if (learner.riskLabel === 'high' && learner.missedSessions > 5) {
    encouragement = "it's never too late to get back on track";
  } else if (learner.riskLabel === 'low') {
    encouragement = "keep up the excellent work";
  }
  
  const templates = [
    `Hey ${firstName}, ${encouragement}! Try to ${action}. Small steps win! 🚀`,
    `Hi ${firstName}! You're at ${Math.round(learner.completionPct)}% - ${encouragement}. ${action.charAt(0).toUpperCase() + action.slice(1)}? 💪`,
    `${firstName}, ${encouragement}! How about you ${action}? You've got this! ⭐`,
    `Quick nudge, ${firstName}! ${encouragement}. Ready to ${action}? 🎯`
  ];
  
  // Select template based on learner ID hash (deterministic but varied)
  const templateIndex = Math.abs(learner.name.length + learner.completionPct) % templates.length;
  const selectedTemplate = templates[templateIndex];
  
  log.info('Generated fallback nudge', { 
    learnerName: firstName,
    completionPct: learner.completionPct,
    riskLabel: learner.riskLabel,
    templateIndex,
    textLength: selectedTemplate.length
  });
  
  return selectedTemplate;
}

// Main nudge generation function with fallback logic
export async function generateNudge(learner: LearnerForNudge, preferStreaming = true): Promise<NudgeResult> {
  const prompt = buildNudgePrompt(learner);
  
  // Try Gemini first if configured
  if (isGeminiConfigured()) {
    try {
      if (preferStreaming) {
        // For streaming, we return the stream and let the caller handle it
        const stream = await streamGemini(prompt);
        return {
          text: '', // Will be populated by stream consumer
          source: 'gemini',
          streaming: true
        };
      } else {
        // Non-streaming generation
        const text = await generateGeminiNudge(prompt);
        return {
          text,
          source: 'gemini',
          streaming: false
        };
      }
    } catch (error) {
      log.warn('Gemini generation failed, falling back to template', {
        error: error instanceof Error ? error.message : 'Unknown error',
        learnerName: learner.name
      });
    }
  } else {
    log.info('Gemini not configured, using template fallback');
  }
  
  // Fallback to template-based generation
  const text = fallbackNudge(learner);
  return {
    text,
    source: 'template',
    streaming: false
  };
}

/*
PRODUCTION MIGRATION NOTES:

To migrate to official Google Cloud Client Libraries:

1. Install the official SDK:
   npm install @google-cloud/aiplatform

2. Set up service account authentication:
   - Create a service account in Google Cloud Console
   - Grant "Vertex AI User" role
   - Download the service account key JSON
   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable

3. Replace the fetch-based implementation with:
   import { PredictionServiceClient } from '@google-cloud/aiplatform';
   
   const client = new PredictionServiceClient({
     apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`
   });

4. Required IAM roles:
   - Vertex AI User (roles/aiplatform.user)
   - Service Account Token Creator (if using impersonation)

5. OAuth vs API Key tradeoffs:
   - OAuth: More secure, supports fine-grained permissions, automatic token refresh
   - API Key: Simpler setup, but less secure and harder to rotate
   - Recommendation: Use service account with OAuth for production
*/
