/**
 * Extracts text from an AI SDK UI message.
 * @param {import("ai").UIMessage} message The message to read
 * @returns {string} The message text
 */
export const getMessageText = (message) =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

/**
 * Formats a message into a string.
 * @param {import("ai").UIMessage} message The message to format
 * @returns {string} The formatted message
 */
export const formatMessage = (message) =>
  `${message.role}: ${getMessageText(message)}`;
