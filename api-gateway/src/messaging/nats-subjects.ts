export const NATS_SERVICE = 'NATS_SERVICE';

export const NatsSubjects = {
  // Commands
  CREATE_RURAL_PRODUCER: 'rural-producer.create',
  UPDATE_RURAL_PRODUCER: 'rural-producer.update',
  DELETE_RURAL_PRODUCER: 'rural-producer.delete',
  ADD_PLANTING: 'rural-producer.planting.add',
  REMOVE_PLANTING: 'rural-producer.planting.remove',

  // Queries
  GET_RURAL_PRODUCER: 'rural-producer.get',
  LIST_RURAL_PRODUCERS: 'rural-producer.list',
  GET_PROCESS_STATUS: 'process.status.get',

  // Dashboard
  DASHBOARD_METRICS: 'rural-producer.dashboard.metrics',
  DASHBOARD_FARMS_BY_STATE: 'rural-producer.dashboard.farms-by-state',
  DASHBOARD_CROPS_DISTRIBUTION: 'rural-producer.dashboard.crops-distribution',
  DASHBOARD_LAND_USE: 'rural-producer.dashboard.land-use',

  // Users
  CREATE_USER: 'user.create',
  UPDATE_USER: 'user.update',
  GET_USER: 'user.get',
  GET_USER_BY_EMAIL: 'user.get-by-email',
  LIST_USERS: 'user.list',
  VALIDATE_USER: 'user.validate',

  // Reference data
  LIST_CROPS: 'crop.list',
  LIST_HARVEST_SEASONS: 'harvest-season.list',
} as const;
