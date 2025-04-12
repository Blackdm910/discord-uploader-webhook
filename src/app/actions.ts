'use server';

// import {promises as fs} from 'fs';
// import path from 'path';
// import {revalidatePath} from 'next/cache';
// import {v4 as uuidv4} from 'uuid';
import {DiscordUploadResponse} from '@/services/types';
import {Buffer} from 'buffer';
import {uploadToDiscord} from '@/services/discord';
import {FileTypeResult, fileTypeFromBuffer} from 'file-type';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL 
async function sha3_256(message: ArrayBuffer): Promise<string> {
  // Convert message to Uint8Array
  const data = new Uint8Array(message);

  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convert bytes to hex string
  const hashHex = hashArray.map(b => b.toString(16)).join('');
  return hashHex;
}

async function processFile(file: File): Promise<{file: string; hash: string; fileUrl: string}> {
  const buffer = await file.arrayBuffer();
  return processBuffer(buffer, file.name);
}

async function processBuffer(buffer: ArrayBuffer, filename: string): Promise<{file: string; hash: string; fileUrl: string}> {
  const hash = await sha3_256(buffer);

  let fileTypeResult: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
  let actualFilename = filename;

  if (fileTypeResult) {
    actualFilename = filename.replace(/\.[^/.]+$/, "") + `.${fileTypeResult.ext}`;
  }

  // Simulate Discord upload
  let discordResponse: DiscordUploadResponse;
  try {
    discordResponse = await uploadToDiscord(Buffer.from(buffer), actualFilename, DISCORD_WEBHOOK_URL);
  } catch (discordError: any) {
    if (discordError instanceof Error) {
      throw new Error(`Discord upload failed: ${discordError.message}`);
    } else {
      throw new Error(`Discord upload failed: An unknown error occurred.`);
    }
  }

  if (!discordResponse?.fileUrl) {
    throw new Error('Failed to retrieve file URL from Discord response.');
  }

  return {file: filename, hash: hash, fileUrl: discordResponse.fileUrl};
}

export async function uploadFiles(
  selectedFiles: File[]
): Promise<{ urls: string[] | string; error?: string }> {
  try {
    const results: string[] = [];

    for (const file of selectedFiles) {
      try {
        const result = await processFile(file);
        results.push(result.fileUrl);
      } catch (processError: any) {
        console.error(`Error processing file ${file.name}:`, processError);
        return {urls: `Error processing file ${file.name}: ${processError.message}`, error: processError.message};
      }
    }

    return {urls: results};
  } catch (error: any) {
    if (error instanceof Error) {
      console.error('Upload failed:', error);
      return {urls: null as any, error: `Failed to upload: ${error.message}`};
    } else {
      console.error('Upload failed: An unknown error occurred');
      return {urls: null as any, error: 'Failed to upload: An unknown error occurred'};
    }
  }
}
