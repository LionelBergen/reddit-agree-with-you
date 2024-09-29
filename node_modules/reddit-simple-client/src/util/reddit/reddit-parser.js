export function parsePostArray(rawResponse) {
  const data = rawResponse.data || rawResponse;

  return {
    body: data.selftext,
    subreddit: data.subreddit,
    authorFullname: data.author_fullname,
    postTitle: data.title,
    name: data.name,
    ups: data.ups,
    score: data.score,
    created: data.created_utc,
    id: data.id,
    author: data.author,
    permalink: data.permalink,
    url: 'https://www.reddit.com' + data.permalink
  };
}

export function parseCommentArray(rawResponse) {
  const data = rawResponse.data || rawResponse;
  return {
    body: data.body,
    subreddit: data.subreddit,
    authorFullname: data.author_fullname,
    postTitle: data.link_title,
    name: data.name,
    ups: data.ups,
    score: data.score,
    created: data.created_utc,
    id: data.id,
    author: data.author,
    url: data.link_url,
    permalink: data.permalink
  };
}
