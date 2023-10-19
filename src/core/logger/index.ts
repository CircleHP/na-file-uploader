import { singleton } from "tsyringe";
import { stdout } from "node:process";
import { HIDE_CURSOR } from "./constants";
import { ChatCodes, LogType, TextColor } from "./enums";
import { LOGGER_CONFIG } from "./config";

@singleton()
export class Logger {
  constructor() {
    stdout.write(HIDE_CURSOR);
    stdout.cursorTo(0, 0);
    stdout.clearScreenDown();
  }

  info = (msg: string): void => {
    const type = this.getLabel(LogType.INFO);
    const msgStr = `${ChatCodes.RESET}${msg}`;

    stdout.write(`${this.getPrefix()}\t${type} ${msgStr}\n`);
  };

  debug = (msg: string): void => {
    const type = this.getLabel(LogType.DEBUG);
    const msgStr = `${ChatCodes.RESET}${msg}`;

    stdout.write(`${this.getPrefix()}\t${type} ${msgStr}\n`);
  };

  error = (e: any): void => {
    const type = this.getLabel(LogType.ERROR);

    stdout.write(`${this.getPrefix()}\t${type} ${e.name}${ChatCodes.RESET}\n`);
    console.log(e);
  };

  private getLabel = (type: LogType) => {
    return `${LOGGER_CONFIG[type]}[${type}]`;
  };

  private getPrefix = () => {
    const date = `${TextColor.WHITE}${new Date().toUTCString()}`;
    const processStr = `${TextColor.YELLOW}[${process.pid}]`;
    return `${processStr} ${date}`;
  };
}
