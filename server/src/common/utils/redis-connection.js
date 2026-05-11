import Redis from "ioredis";

function createRedisConnection(isSubscriber = false){
    return new Redis({
        host:'localhost',
        port:'6379',
        enableReadyCheck: !isSubscriber
    })
}
export const redis = createRedisConnection()
export const publisher = createRedisConnection()
export const subscriber = createRedisConnection(true)