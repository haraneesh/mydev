import '../imports/startup/client/index';
import '../imports/startup/both/config/index';
import '../imports/infra/serviceWorkerInit';
import { intializeGlobalStores } from '../imports/ui/stores/GlobalStore';

intializeGlobalStores();
