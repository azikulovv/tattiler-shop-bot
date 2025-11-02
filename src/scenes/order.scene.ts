import { Markup, Scenes } from "telegraf";
import { BotContext } from "../types";

export const orderWizard = new Scenes.WizardScene<BotContext>(
  "orderWizard",

  async (ctx) => {
    await ctx.reply("📍 Куда необходимо доставить?");

    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.session.address = ctx.message?.text;
    await ctx.reply("Введите номер телефона:");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.session.phone = ctx.message?.text;

    await ctx.reply(
      `✅ Проверьте данные:\n\n📍 Адрес: ${ctx.session.address}\n👤 Имя: ${ctx.session.name}\n📞 Телефон: ${ctx.session.phone}`,
      Markup.inlineKeyboard([
        [Markup.button.callback("✅ Подтвердить", "confirm_order")],
        [Markup.button.callback("✏️ Изменить", "edit_order")],
        [Markup.button.callback("❌ Отменить", "cancel_order")],
      ])
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!("callback_query" in ctx.update)) return;

    const action = ctx.update.callback_query.data;

    if (action === "confirm_order") {
      await ctx.reply("🎉 Заказ оформлен! Мы свяжемся с вами в ближайшее время.");
      return ctx.scene.leave();
    }

    if (action === "edit_order") {
      await ctx.reply("✏️ Начнём заново. Введите адрес доставки:");
      ctx.wizard.selectStep(1); // возвращаемся к шагу 1
      return;
    }

    if (action === "cancel_order") {
      await ctx.reply("❌ Заказ отменён. Если захотите начать снова — напишите /start.");
      return ctx.scene.leave();
    }
  }
);
