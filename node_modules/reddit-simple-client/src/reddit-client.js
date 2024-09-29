import { DefaultOptions } from './reddit/modal/reddit-options.js';
import { SORT_TYPE } from './reddit/modal/sort-type.js';
import { CreateAuth } from './reddit/reddit-auth.js';
import log from './util/log.js';
import parseJSON from './util/parse-json.js';
import { parsePostArray, parseCommentArray } from './util/reddit/reddit-parser.js';
import { getValidValue } from './util/util.js';

// This is the max number of posts Reddit allows to be retrieved at once. If a higher number is used, this is used anyway
export const MAX_NUM_POSTS = 100;
export const MIN_NUM_POSTS = 1;
export const MAX_NUM_COMMENTS = 1000;
export const MIN_NUM_COMMENTS = 10;

const REDDIT_OBJECT = {
  COMMENT: 'COMMENT',
  POST: 'POST'
};

export class RedditClient {
  constructor({ redditOptions = DefaultOptions, redditAuth }) {
    this.redditOptions = redditOptions;
    this.redditAuth = redditAuth;
  }

  /**
   * Returns posts from subreddit
   *
   * @param numberOfPosts {int | MIN_NUM_POSTS} number of posts to retrieve, between 1-100
   * @param subreddit {string} subreddit to get posts from
   * @param sortType {SORT_TYPE | SORT_TYPE.NEW} E.G 'new', or 'hot'
   * @return Promise containing a list of RedditPost objects
  */
  async getPostsFromSubreddit({
    numberOfPosts = MIN_NUM_POSTS,
    subreddit,
    sortType = SORT_TYPE.NEW
  }) {
    numberOfPosts = getValidNumberOfPosts(numberOfPosts);

    const path = '/r/' + subreddit + "/" + sortType + ".json?limit=" + numberOfPosts;
    const dataFromUrl = await this.redditAuth.getListing(path);
    log.debug(dataFromUrl);

    return await getPostObjectsFromRawURLData(dataFromUrl, this.redditOptions.useSimpleReturnValues);
  }

  /**
   * Get a list of the newest comments from Reddit
   *
   * @param numberOfComments {int | MAX_NUM_COMMENTS} A number between 10-1000 (between 1-9 does not work for Reddit)
   * @param options {redditOptions} reddit options
   * @return List of comment objects
  */
  async getLatestCommentsFromReddit({
    numberOfComments = MAX_NUM_COMMENTS,
    subreddit = 'all'
  } = {}) {
    numberOfComments = getValidNumberOfComments(numberOfComments);

    const path = `/r/${subreddit}/comments.json?limit=${numberOfComments}`;
    const dataFromUrl = await this.redditAuth.getListing(path);
    log.debug(dataFromUrl);

    return await getCommentObjectFromRawURLData(dataFromUrl, this.redditOptions.useSimpleReturnValues);
  }

  /**
   * Gets a list of the names of moderators for the subreddit
   *
   * @param subreddit
   * @return Promise containing list of moderator usernames
  */
  async getSubredditModList(subreddit) {
    const path = `/r/${subreddit}/about/moderators.json`;
    const dataFromUrl = await this.redditAuth.getListing(path);

    const jsonData = parseJSON(dataFromUrl);
    log.debug(jsonData);

    if (jsonData && jsonData.data) {
      log.debug(jsonData.data);
      return jsonData.data.children;
    }

    return jsonData;
  }

  async postComment(commentId, textToComment) {
    log.info('trying to post comment : ' + textToComment + ' with id: ' + commentId);
    return await this.redditAuth.postComment(commentId, textToComment);
  }
}

export async function CreateAuthedClient({ redditOptions, redditAuth }) {
  const redditClient = new RedditClient({ redditOptions, redditAuth });
  redditClient.redditAuth = await CreateAuth({ redditAuth });

  return redditClient;
}

/**
 * Returns an object based on the data returned from a Reddit URL.
 *
 * @param rawDataFromURL Data from a Reddit URL, containing all the comment info
 * @param {boolean | false} useSimpleValues
 * @return An array of Post objects containing body, subreddit etc
*/
function getPostObjectsFromRawURLData(rawDataFromURL, useSimpleObjects = false) {
  return getObjectFromRawData(rawDataFromURL, REDDIT_OBJECT.POST, useSimpleObjects);
}

/**
 * Returns an object based on the data returned from a Reddit URL.
 *
 * @param rawDataFromURL Data from a Reddit URL, containing all the comment info
 * @param {boolean | false} useSimpleValues
 * @return A Comment object containing body, subreddit etc
*/
function getCommentObjectFromRawURLData(rawDataFromURL, useSimpleObjects = false) {
  return getObjectFromRawData(rawDataFromURL, REDDIT_OBJECT.COMMENT, useSimpleObjects);
}

/**
 *
 * @param {string} rawDataFromURL
 * @param {REDDIT_OBJECT} redditType
 * @param {boolean | false} useSimpleValues
 */
function getObjectFromRawData(rawDataFromURL, redditType, useSimpleValues = false) {
  const jsonDataFromUrl = parseJSON(rawDataFromURL);

  const result = jsonDataFromUrl.data.children.map(post => {
    if (!useSimpleValues) {
      return post.data;
    }

    switch (redditType) {
      case REDDIT_OBJECT.COMMENT:
        return parseCommentArray(post);
      case REDDIT_OBJECT.POST:
        return parsePostArray(post);
      default:
        throw 'Unknown reddit type: ' + redditType;
    }
  });

  return result;
}

/**
 * This is what happens anyway. Reddit accepts numbers over 100 as 100 and less then 1 as 1
 *
 * @param numberOfPosts
 * @return
 */
function getValidNumberOfPosts(numberOfPosts) {
  return getValidValue(numberOfPosts, MIN_NUM_POSTS, MAX_NUM_POSTS, MIN_NUM_POSTS);
}

/**
 * Reddit accepts numbers over 1000 as 1000 and less then 1 as 1
 *
 * @param numberOfPosts
 * @return
 */
function getValidNumberOfComments(numberOfComments) {
  return getValidValue(numberOfComments, MIN_NUM_COMMENTS, MAX_NUM_COMMENTS, MAX_NUM_COMMENTS);
}
