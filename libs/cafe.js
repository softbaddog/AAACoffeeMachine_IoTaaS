var MachineMode = {
  0: "POWER_OFF",
  1: "POWER_ON",
  2: "SELF_CHECKING",
  3: "PRE_HEATING",
  4: "FINISHED_PRE_HEATING",
  5: "WORKING_STATUS",
  6: "DESCALING",
  7: "STAND_BY"
};

var NetworkMode = {
  0: ONLINE,
  1: OFFLINE
};

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