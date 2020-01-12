agree-with-you
--------------
An annoying Reddit Bot

Listens on port 8000 if environment variable 'PORT' is not set. <br />
Uses Express & faye to get messages containing a Reddit comment and reply text. Will post a comment every 1 second or more. <br />
If too many messages come in at once, add to a pool and process them during quiet periods

**Environment variables required:**

|REDDIT_APP_ID|REDDIT_APP_SECRET|REDDIT_LOGIN_USERNAME|REDDIT_LOGIN_PASSWORD|
|-------------|-----------------|---------------------|---------------------|
