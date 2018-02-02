import Agenda from 'Agenda';
import { prepareUserRecommendations } from '../../modules/server/prepareUserRecommendations';

const mongoUrl = process.env.MONGO_URL;
const agenda = new Agenda({ db: { address: mongoUrl } });

agenda.define('prepareUserRecommendations', (job, done) => {
  // call from module
  prepareUserRecommendations(job);
  done();
});

agenda.on('ready', () => {
    // 0 8 * * * - runs at 8am, 30 2 * * * - 2.30 am everyday, 0 18 * * * - 6 PM everyday
    // */3 * * * * - every 3 minutes
  agenda.every('*/3 * * * *', 'prepareUserRecommendations');
  agenda.start();
});
