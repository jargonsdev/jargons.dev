import { Message } from "ai";

/**
 * Formats a message into a string
 * @param {Message} message The message to format
 * @returns The formatted message
 */
export const formatMessage = (message) => {
  return `${message.role}: ${message.content}`;
};
