export interface StreamPost {
  id: string;
  link: string;
  title: string;
  content: string;
  picture: string;
  published: string;
  updated: string;
  sponsored_link: string;
  sponsored_logo: string;
}

export type FeedConfig = {
  [key: string]: {
    feedFilter: {
      context: string;
      tag: string;
    };
  };
};

export type G$FeedConfig = FeedConfig & {
  context: string;
  tag?: string;
};
