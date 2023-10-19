import { LogType, TextColor } from "../enums";

export const LOGGER_CONFIG: Record<LogType, TextColor> = {
  [LogType.INFO]: TextColor.GREEN,
  [LogType.DEBUG]: TextColor.MAGENTA,
  [LogType.ERROR]: TextColor.RED,
};
