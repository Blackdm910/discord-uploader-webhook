# Discord Uploader

This Next.js application allows users to upload files and send them directly to a designated Discord channel via webhook. It supports batch uploads, SHA3-256 hashing, and provides a copyable list of file URLs.

## Features

-   **File Upload:** Users can upload multiple files at once.
-   **Discord Upload:** Uploads are sent directly to a Discord channel using a webhook URL.
-   **SHA3-256 Hashing:** Calculates the SHA3-256 hash of the uploaded files.
-   **URL Generation:** Provides a list of Discord file URLs.
-    **Copyable URLs:** Allows users to easily copy the generated Discord file URLs.
-   **File Size Limit**: Limits uploads to 10MB per file.

## UI Styling

-   Primary color: Black amoled dominant.
-   Accent: Purple (#800080) to highlight successful uploads and link generation.
-   Clean, sans-serif font for easy readability.
-   Simple, intuitive layout with a clear call-to-action for uploading files and displaying the generated URL.
-   Use minimalist icons to represent file types and actions.

## Tech Stack

-   Next.js
-   React
-   Tailwind CSS
-   ShadCN UI Components
-   lucide-react icons
-   file-type

## How to Use

1. Clone this repo:
```bash
   git clone https://github.com/Blackdm910/discord-uploader-webhook.git
   ```

2. Install dependencies:

```bash
pnpm install
```


3. Setup your .env:

```bash
NEXT_PUBLIC_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```


4. Run the dev server:

```bash
pnpm dev
```

---

## License

MIT
Use at your own risk.
