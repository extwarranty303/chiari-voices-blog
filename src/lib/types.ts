import { Timestamp } from 'firebase/firestore';

export interface Post {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    publishedAt?: Timestamp;
    tags?: string[];
    imageUrl?: string;
    readTime?: number;
    authorName?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    excerpt?: string;
    authorId?: string;
    featured?: boolean;
}
