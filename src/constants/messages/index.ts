import { Locale } from 'discord.js';
import { Messages } from "./message.interface";
import { enMessages } from "./message-en";
import { jaMessages } from "./message-ja";

export const messages: Record<Locale, Messages> = {
  'en-US': enMessages,
  ja: jaMessages,
}