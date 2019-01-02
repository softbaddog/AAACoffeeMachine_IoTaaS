var MachineMode = {
  POWER_OFF: 0,
  POWER_ON: 1,
  SELF_CHECKING: 2,
  PRE_HEATING: 3,
  FINISHED_PRE_HEATING: 4,
  WORKING_STATUS: 5,
  DESCALING: 6,
  STAND_BY: 7
};

var NetworkMode = {
  ONLINE: 0,
  OFFLINE: 1
}

var ButtonPressId = {
  SHORT_COFFEE: 1,
  LONG_COFFEE: 2,
  TEA: 3,
  MILK_DRINKS: 4,
  CUSTOM: 5
};

var SelectorFunction = {
  CLEANING: 1,
  GALAO: 2,
  CAPPUCCINO: 3
};

var ErrorCode = {
  SELF_ALARM: 1,
  NTC_FAULT_ALARM: 2,
  WATER_SHORTAGE_ALARM: 3,
  GARBAGE_LOST_ALARM: 4,
  GARBAGE_FULL_ALARM: 5,
  STEAM_KEY_ALARM: 6,
};