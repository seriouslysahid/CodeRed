// Streaming text processing utilities

export interface StreamChunk {
  text: string;
  isComplete: boolean;
  metadata?: Record<string, any>;
}

export interface StreamParserOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  delimiter?: string;
  encoding?: string;
}

export class StreamTextParser {
  private decoder: TextDecoder;
  private buffer: string = '';
  private fullText: string = '';
  private options: StreamParserOptions;

  constructor(options: StreamParserOptions = {}) {
    this.decoder = new TextDecoder(options.encoding || 'utf-8');
    this.options = options;
  }

  processChunk(chunk: Uint8Array): void {
    try {
      // Decode the chunk
      const text = this.decoder.decode(chunk, { stream: true });
      this.buffer += text;

      // Process complete lines if delimiter is specified
      if (this.options.delimiter) {
        this.processDelimitedChunks();
      } else {
        // Process as continuous stream
        this.processContinuousStream(text);
      }
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error : new Error('Stream processing error'));
    }
  }

  private processDelimitedChunks(): void {
    const delimiter = this.options.delimiter!;
    const lines = this.buffer.split(delimiter);
    
    // Keep the last incomplete line in buffer
    this.buffer = lines.pop() || '';

    // Process complete lines
    lines.forEach(line => {
      if (line.trim()) {
        this.processLine(line.trim());
      }
    });
  }

  private processContinuousStream(text: string): void {
    this.fullText += text;
    
    const chunk: StreamChunk = {
      text: text,
      isComplete: false,
    };

    this.options.onChunk?.(chunk);
  }

  private processLine(line: string): void {
    try {
      // Try to parse as JSON (for SSE format)
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        
        if (data === '[DONE]') {
          this.complete();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          this.processJsonChunk(parsed);
        } catch {
          // Not JSON, treat as plain text
          this.processTextChunk(data);
        }
      } else {
        // Plain text line
        this.processTextChunk(line);
      }
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error : new Error('Line processing error'));
    }
  }

  private processJsonChunk(data: any): void {
    const text = data.text || data.content || data.delta?.content || '';
    
    if (text) {
      this.fullText += text;
      
      const chunk: StreamChunk = {
        text: text,
        isComplete: data.finish_reason === 'stop' || data.done === true,
        metadata: data,
      };

      this.options.onChunk?.(chunk);

      if (chunk.isComplete) {
        this.complete();
      }
    }
  }

  private processTextChunk(text: string): void {
    this.fullText += text;
    
    const chunk: StreamChunk = {
      text: text,
      isComplete: false,
    };

    this.options.onChunk?.(chunk);
  }

  complete(): void {
    // Process any remaining buffer
    if (this.buffer.trim()) {
      this.processTextChunk(this.buffer);
      this.buffer = '';
    }

    this.options.onComplete?.(this.fullText);
  }

  getFullText(): string {
    return this.fullText;
  }

  reset(): void {
    this.buffer = '';
    this.fullText = '';
  }
}

// Utility function to create a stream reader with text parsing
export async function createStreamReader(
  stream: ReadableStream<Uint8Array>,
  options: StreamParserOptions = {}
): Promise<{
  reader: ReadableStreamDefaultReader<Uint8Array>;
  parser: StreamTextParser;
  start: () => Promise<void>;
  stop: () => void;
}> {
  const reader = stream.getReader();
  const parser = new StreamTextParser(options);
  let isReading = false;

  const start = async (): Promise<void> => {
    if (isReading) return;
    isReading = true;

    try {
      while (isReading) {
        const { done, value } = await reader.read();

        if (done) {
          parser.complete();
          break;
        }

        if (value) {
          parser.processChunk(value);
        }
      }
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Stream reading error'));
    } finally {
      isReading = false;
    }
  };

  const stop = (): void => {
    isReading = false;
    reader.cancel();
  };

  return { reader, parser, start, stop };
}

// Server-Sent Events (SSE) parser
export class SSEParser extends StreamTextParser {
  constructor(options: Omit<StreamParserOptions, 'delimiter'> = {}) {
    super({
      ...options,
      delimiter: '\n',
    });
  }
}

// Utility for handling different streaming formats
export function detectStreamFormat(firstChunk: string): 'sse' | 'json-lines' | 'plain-text' {
  if (firstChunk.includes('data: ')) {
    return 'sse';
  }
  
  if (firstChunk.trim().startsWith('{') && firstChunk.trim().endsWith('}')) {
    return 'json-lines';
  }
  
  return 'plain-text';
}

// Rate limiting for stream processing
export class StreamRateLimiter {
  private lastProcessTime = 0;
  private minInterval: number;

  constructor(maxUpdatesPerSecond = 30) {
    this.minInterval = 1000 / maxUpdatesPerSecond;
  }

  shouldProcess(): boolean {
    const now = Date.now();
    if (now - this.lastProcessTime >= this.minInterval) {
      this.lastProcessTime = now;
      return true;
    }
    return false;
  }

  reset(): void {
    this.lastProcessTime = 0;
  }
}

// Timeout handler for streams
export function createStreamTimeout(
  timeoutMs: number,
  onTimeout: () => void
): { start: () => void; clear: () => void; extend: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const start = () => {
    clear();
    timeoutId = setTimeout(onTimeout, timeoutMs);
  };

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const extend = () => {
    start(); // Restart the timeout
  };

  return { start, clear, extend };
}