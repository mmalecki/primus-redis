var redis = require('redis'),
    sentinel = require('redis-sentinel');

var PrimusRedis = module.exports = function (primus, options) {
  var write = primus.write,
      publishQueue = [],
      subscribed = false,
      sub, pub, channel;

  function getClient() {
    if (options.redis.sentinel) {
      return sentinel.createClient(
        options.redis.endpoints,
        options.redis.masterName,
        options.redis
      );
    }

    return redis.createClient(options.redis);
  }

  channel = options.redis.channel || 'primus';

  pub = getClient();
  sub = getClient();

  sub.subscribe(channel);
  sub.on('message', function (channel, msg) {
    write.call(primus, msg);
  });
  sub.on('subscribe', function () {
    subscribed = true;
    publishQueue.forEach(function (data) {
      pub.publish(channel, data);
    });
    publishQueue.length = 0;
  });

  Object.defineProperty(primus, 'write', {
    configurable: true,
    value: function write (data) {
      //
      // Waiting until we're subscribed is the best we can do to ensure that
      // messages are delivered.
      //
      if (subscribed) {
        pub.publish(channel, data, function (err) {
          if (err) {
            publishQueue.push(data);
            subscribed = false;
          }
        });
        return;
      }
      publishQueue.push(data);
    }
  });
};

// Hack so that you can `primus.use(require('primus-redis'))`.
PrimusRedis.server = PrimusRedis;
