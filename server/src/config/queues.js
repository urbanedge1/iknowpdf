import Queue from 'bull';
import { getRedisClient } from './redis.js';
import { logger } from '../utils/logger.js';
import { processPDFJob } from '../services/pdfProcessor.js';

let pdfProcessingQueue;
let emailQueue;

export async function setupQueues() {
  try {
    const redisConfig = {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD || undefined
      }
    };

    // PDF Processing Queue
    pdfProcessingQueue = new Queue('pdf processing', redisConfig);
    
    pdfProcessingQueue.process('process-pdf', 5, async (job) => {
      return await processPDFJob(job.data);
    });

    pdfProcessingQueue.on('completed', (job, result) => {
      logger.info(`PDF processing job ${job.id} completed:`, result);
    });

    pdfProcessingQueue.on('failed', (job, err) => {
      logger.error(`PDF processing job ${job.id} failed:`, err);
    });

    // Email Queue
    emailQueue = new Queue('email', redisConfig);
    
    emailQueue.process('send-email', 10, async (job) => {
      const { sendEmail } = await import('../services/emailService.js');
      return await sendEmail(job.data);
    });

    emailQueue.on('completed', (job, result) => {
      logger.info(`Email job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error(`Email job ${job.id} failed:`, err);
    });

    logger.info('Queues initialized successfully');
  } catch (error) {
    logger.error('Failed to setup queues:', error);
    throw error;
  }
}

export function getPDFProcessingQueue() {
  if (!pdfProcessingQueue) {
    throw new Error('PDF processing queue not initialized');
  }
  return pdfProcessingQueue;
}

export function getEmailQueue() {
  if (!emailQueue) {
    throw new Error('Email queue not initialized');
  }
  return emailQueue;
}