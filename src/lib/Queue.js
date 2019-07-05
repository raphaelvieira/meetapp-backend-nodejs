import Bee from 'bee-queue';
import redisConfig from '../config/redis';
import SubscriptionMail from '../app/jobs/SubscriptionMail';

const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    // for each job store on the queue.
    jobs.forEach(({ key, handle }) => {
      // Key - key of Job(SubscriptionMail)
      // handle - Method that execute a job
      this.queues[key] = {
        // in a FIFO store the bee that connect with redis that get and set values on database
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle, // process the job
      };
    });
  }

  // add job to the queue
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // process the jobs on the queue
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      // envent on failed, this.execute handleFailure
      bee.on('failed', this.handleFailure).process(handle);
      // bee.process(handle);
    });
  }

  handleFailure(job, err) {
    // eslint-disable-next-line no-console
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
