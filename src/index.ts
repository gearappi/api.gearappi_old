if (!process.env.SERVICE) {
  throw new Error(`
        Environment variable SERVICE must be defined.
        Available options:
            notifacation-service
    `);
}

function getServicePath(service: string): string {
  switch (service) {
    case 'user-api':
      return `./api/${service}`;
    case 'notifacation-service':
      return `./service/${service}`;
  }
}

import(getServicePath(process.env.SERVICE));
