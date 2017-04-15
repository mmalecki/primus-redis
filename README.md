# primus-redis
[![Build Status](https://travis-ci.org/mmalecki/primus-redis.png)](https://travis-ci.org/mmalecki/primus-redis)

`primus-redis` is a Redis store for [Primus](https://github.com/primus/primus).
It takes care of distributing messages to other instances using [Redis Pub/Sub](http://redis.io/topics/pubsub).

*Note:* this is a very simple module for broadcasting all your messages over
Redis to *all* connected clients. If you're looking for room functionality,
see [`primus-redis-rooms`](https://github.com/mmalecki/primus-redis-rooms).

## Usage

```js
var http = require('http');
var Primus = require('primus');
var PrimusRedis = require('primus-redis');

var server = http.createServer();
var primus = new Primus(server, {
  redis: {
    createClient: createClient,
    channel: 'primus' // Optionale, defaults to `'primus'`
  }
});

// Create redis client.
function createClient() {
  var client = redis.createClient({
    host: 'localhost'
  });

  // You can choose another db.
  client.select(1);

  return client;
}

primus.use('redis', PrimusRedis);
```

## License

MIT