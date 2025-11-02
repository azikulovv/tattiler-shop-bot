import { Context } from "telegraf";
import { constants } from "../config";

export function isAdmin(ctx: Context) {
  if (ctx.from!.id !== Number(constants.ADMIN_ID)) {
    return ctx.reply("⛔ Нет доступа");
  }
}
