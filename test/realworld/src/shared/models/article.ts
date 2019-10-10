import { Author } from "./author";

export interface Article {
  title?: string;
  slug?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tagList?: string[];
  description?: string;
  author?: Author;
  favorited?: boolean;
  favoritesCount?: number;
}
