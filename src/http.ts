import { UserRating } from './interfaces';

const getBaseUrl = (): string => {
  return process.env.FREYJA_API_URL!;
};

export const fetchUserRating = async (guildId: string, userId: string) => {
  const response = await fetch(
    `${getBaseUrl()}/guilds/${guildId}/users/${userId}`,
  );
  return (await response.json()) as UserRating;
};

export const addGameResult = async (
  guildId: string,
  winUserId: string,
  loseUserId: string,
) => {
  await fetch(`${getBaseUrl()}/guilds/${guildId}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      winUserId,
      loseUserId,
    }),
  });
};

export const fetchGuildLeaderboard = async (guildId: string) => {
  const response = await fetch(`${getBaseUrl()}/guilds/${guildId}/leaderboard`);
  return (await response.json()) as UserRating[];
};
