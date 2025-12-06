import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class BullMQService implements OnModuleInit, OnModuleDestroy {
    private connection: Redis;
    private queues: Map<string, Queue> = new Map();
    private workers: Map<string, Worker> = new Map();

    constructor() {
        this.connection = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: null,
        });
    }

    async onModuleInit() {
        console.log('BullMQ Service initialized');
    }

    async onModuleDestroy() {
        // Close all workers
        for (const [name, worker] of this.workers.entries()) {
            await worker.close();
            console.log(`Worker ${name} closed`);
        }

        // Close all queues
        for (const [name, queue] of this.queues.entries()) {
            await queue.close();
            console.log(`Queue ${name} closed`);
        }

        // Close Redis connection
        await this.connection.quit();
        console.log('Redis connection closed');
    }

    /**
     * Get or create a queue
     */
    getQueue(name: string): Queue {
        if (!this.queues.has(name)) {
            const queue = new Queue(name, {
                connection: this.connection,
                defaultJobOptions: {
                    attempts: parseInt(process.env.BULLMQ_MAX_RETRIES || '5', 10),
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: 100, // Keep last 100 completed jobs
                    removeOnFail: 500, // Keep last 500 failed jobs
                },
            });

            this.queues.set(name, queue);
            console.log(`Queue ${name} created`);
        }

        return this.queues.get(name)!;
    }

    /**
     * Register a worker for a queue
     */
    registerWorker<T = any>(
        queueName: string,
        processor: (job: Job<T>) => Promise<void>,
        options?: {
            concurrency?: number;
            limiter?: {
                max: number;
                duration: number;
            };
        }
    ): Worker {
        if (this.workers.has(queueName)) {
            console.warn(`Worker for queue ${queueName} already exists`);
            return this.workers.get(queueName)!;
        }

        const worker = new Worker(
            queueName,
            async (job: Job<T>) => {
                try {
                    await processor(job);
                } catch (error) {
                    console.error(`Error processing job ${job.id} in queue ${queueName}:`, error);
                    throw error; // Re-throw to trigger retry
                }
            },
            {
                connection: this.connection,
                concurrency: options?.concurrency || parseInt(process.env.BULLMQ_CONCURRENCY || '5', 10),
                limiter: options?.limiter,
            }
        );

        // Event listeners for monitoring
        worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed in queue ${queueName}`);
        });

        worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed in queue ${queueName}:`, err);
        });

        this.workers.set(queueName, worker);
        console.log(`Worker registered for queue ${queueName}`);

        return worker;
    }

    /**
     * Add a job to queue
     */
    async addJob<T = any>(
        queueName: string,
        jobName: string,
        data: T,
        options?: {
            delay?: number;
            priority?: number;
            repeat?: {
                pattern: string; // Cron pattern
                tz?: string;
            };
        }
    ): Promise<Job<T>> {
        const queue = this.getQueue(queueName);

        return queue.add(jobName, data, options);
    }

    /**
     * Get job counts for a queue
     */
    async getQueueCounts(queueName: string) {
        const queue = this.getQueue(queueName);

        return {
            waiting: await queue.getWaitingCount(),
            active: await queue.getActiveCount(),
            completed: await queue.getCompletedCount(),
            failed: await queue.getFailedCount(),
            delayed: await queue.getDelayedCount(),
        };
    }
}
