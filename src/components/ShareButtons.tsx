import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share';

interface Post {
    id: string;
    title: string;
    slug?: string;
  }

interface ShareButtonsProps {
  post: Post;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ post }) => {
  const shareUrl = `${window.location.origin}/post/${post.slug || post.id}`;

  return (
    <div className="flex items-center gap-2">
      <TwitterShareButton url={shareUrl} title={post.title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <FacebookShareButton url={shareUrl} hashtag={post.title.replace(/\s/g, '')}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <LinkedinShareButton url={shareUrl} title={post.title}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <EmailShareButton url={shareUrl} subject={post.title}>
        <EmailIcon size={32} round />
      </EmailShareButton>
    </div>
  );
};
