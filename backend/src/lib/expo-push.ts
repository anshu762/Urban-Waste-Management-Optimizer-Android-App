const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_BATCH_SIZE = 100;

type ExpoPushPayload = {
  to: string;
  sound: 'default';
  title: string;
  body: string;
  data?: object;
};

const chunkTokens = (tokens: string[]) => {
  const chunks: string[][] = [];
  for (let index = 0; index < tokens.length; index += EXPO_BATCH_SIZE) {
    chunks.push(tokens.slice(index, index + EXPO_BATCH_SIZE));
  }
  return chunks;
};

export const sendExpoPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: object
): Promise<void> => {
  const uniqueTokens = Array.from(new Set(tokens.filter(Boolean)));
  if (uniqueTokens.length === 0) return;

  for (const tokenChunk of chunkTokens(uniqueTokens)) {
    const messages: ExpoPushPayload[] = tokenChunk.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error('Expo push request failed:', response.status, errorBody);
      }
    } catch (error) {
      console.error('Expo push notification error:', error);
    }
  }
};
