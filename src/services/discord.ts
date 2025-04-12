'use server';

import {FileTypeResult} from 'file-type';

/**
 * Represents the response from uploading a file to Discord.
 */
export interface DiscordUploadResponse {
  /**
   * The URL of the uploaded file on Discord.
   */
  fileUrl: string;
}

/**
 * Asynchronously uploads a file to a specified Discord channel using a webhook.
 *
 * @param file The file to upload (as a Buffer).
 * @param filename The desired filename for the uploaded file.
 * @param webhookUrl The URL of the Discord webhook.
 * @returns A promise that resolves to a DiscordUploadResponse containing the URL of the uploaded file.
 */
export async function uploadToDiscord(
  file: Buffer,
  filename: string,
  webhookUrl: string
): Promise<DiscordUploadResponse> {
  if (!webhookUrl) {
    throw new Error('Discord webhook URL is not defined.');
  }

  const formData = new FormData();

  // Create a Blob from the Buffer
  const fileBlob = new Blob([file]);

  // Append the file to the FormData
  formData.append('file', fileBlob, filename); // Provide a filename

  // Create a payload_json object
  const payload = {
    content: 'File Upload', // Optional message content
    username: 'Runtime Bot', // Optional username
  };

  // Append the payload_json to the FormData
  formData.append('payload_json', JSON.stringify(payload));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload to Discord: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: { attachments: { url: string }[] } = await response.json();

    if (!data || !data.attachments || !data.attachments[0] || !data.attachments[0].url) {
      throw new Error('Failed to retrieve file URL from Discord response.');
    }

    return {
      fileUrl: data.attachments[0].url,
    };
  } catch (error: unknown) {
    let message = 'An unknown error occurred';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('Error uploading to Discord:', error);
    throw new Error(`Discord upload failed: ${message}`);
  }
}
