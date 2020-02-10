import { Bootstrap } from '../../common/Bootstrap';
import { Config } from './config';
import { NotificationServiceModule } from './NotificationServiceModule';

Bootstrap.service(NotificationServiceModule, Config);
