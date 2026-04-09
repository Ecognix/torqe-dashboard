import { createClient } from '@/lib/supabase/client';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  body: string;
  snippet: string;
  date: string;
  attachments: string[];
}

/**
 * Decode Gmail message body from base64url
 */
export function decodeGmailBody(data: string): string {
  // Replace base64url chars with standard base64
  let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) base64 += '=';
  
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return atob(base64);
  }
}

/**
 * Parse Gmail message headers
 */
export function parseGmailHeaders(headers: Array<{ name: string; value: string }>) {
  const result: Record<string, string> = {};
  for (const header of headers) {
    result[header.name.toLowerCase()] = header.value;
  }
  return result;
}

/**
 * Extract email from "Name <email@domain.com>" format
 */
export function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

/**
 * Extract name from "Name <email@domain.com>" format
 */
export function extractName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.split('@')[0];
}

/**
 * Get message body (prefer plain text, fallback to html)
 */
export function getMessageBody(payload: any): { text: string; html?: string } {
  let text = '';
  let html = '';

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = decodeGmailBody(part.body.data);
      }
      if (part.mimeType === 'text/html' && part.body?.data) {
        html = decodeGmailBody(part.body.data);
      }
      // Handle nested parts
      if (part.parts) {
        const nested = getMessageBody(part);
        if (nested.text && !text) text = nested.text;
        if (nested.html && !html) html = nested.html;
      }
    }
  } else if (payload.body?.data) {
    text = decodeGmailBody(payload.body.data);
  }

  return { text, html };
}
