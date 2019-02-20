import { Application } from './Application';

const application = new Application();

console.log('Starting an application...');

application.run()
  .then(() => {
    console.log('Successfully started the application');
  })
  .catch((e) => {
    console.error(`Failed to start the application: ${e.message}`);
    console.error(e.stack);
  });
