
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  author: Author;
  createdAt: Date;
  updatedAt: Date;
};

export type PostStatus = 'draft' | 'published' | 'archived';

export type Author = {
  id: string;
  name: string;
};
