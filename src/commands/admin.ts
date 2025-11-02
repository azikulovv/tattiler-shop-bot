import { Markup } from "telegraf";
import type { BotContext } from "../types";
import { isAdmin } from "../utils/isAdmin";

export const adminCommand = (ctx: BotContext) => {
  isAdmin(ctx);

  return ctx.reply(
    "🔐 Панель администратора:",
    Markup.inlineKeyboard([[Markup.button.callback("👥 Пользователи", "admin_users")]])
  );
};
