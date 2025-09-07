/**
 * Formats a message into a string
 * @param {import("ai").Message} message The message to format
 * @returns The formatted message
 */
export const formatMessage = (message) => {
  return `${message.role}: ${message.content}`;
};
