export interface LoggerData {
  title: string;
  active: boolean;
  datapath: string;
}

export type KeyLogger =
  | "permissions.accessDenied"
  | "bot.middleware.getTypeDisabled"
  | "bot.middleware.userCheck"
  | "bot.middleware.emptyRole"
  | "bot.middleware.typeCheck"
  | "bot.middleware.getType"
  | "bot.commands"
  | "bot.callbacks";

export const loggerDatapaths: Record<KeyLogger, LoggerData> = {
  "permissions.accessDenied": {
    title: "Отказ в доступе",
    active: true,
    datapath: "permissions.accessDenied",
  },
  "bot.middleware.userCheck": {
    title: "Проверка пользователя (middleware)",
    active: true,
    datapath: "bot.middleware.userCheck",
  },
  "bot.middleware.typeCheck": {
    title: "Проверка типа (middleware)",
    active: false,
    datapath: "bot.middleware.typeCheck",
  },
  "bot.middleware.getType": {
    title: "Получение типа (middleware)",
    active: true,
    datapath: "bot.middleware.getType",
  },
  "bot.middleware.emptyRole": {
    title: "Пустая роль (middleware)",
    active: true,
    datapath: "bot.middleware.emptyRole",
  },
  "bot.middleware.getTypeDisabled": {
    title: "Получение типа отключено (middleware)",
    active: true,
    datapath: "bot.middleware.getTypeDisabled",
  },
  "bot.commands": {
    title: "Команды бота",
    active: true,
    datapath: "bot.commands",
  },
  "bot.callbacks": {
    title: "CallbackQuery обработчики",
    active: true,
    datapath: "bot.callbacks",
  },
} as const;
