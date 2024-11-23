import '/imports/startup/both/config/index';
import '/imports/infra/serviceWorkerInit';
import './config/toastConfig';

import { intializeGlobalStores } from '/imports/ui/stores/GlobalStore';
intializeGlobalStores();
