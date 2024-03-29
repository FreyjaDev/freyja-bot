export interface UserRating {
  id: string;
  userId: string;
  guildId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  rank?: number;
}
