import { Context, Markup, Scenes } from "telegraf";
import { BotContext } from "@/types";
import { constants } from "@/config";
import { Product } from "@/types/product";
import { products } from "@/database";
import { parseCallbackData } from "@/utils/parseCallbackData";

type State = {
  address: string;
  phone: string;
  product: Product;
  name: string;
  username: string;
};

let state: Partial<State> = {};

export const orderWizard = new Scenes.WizardScene<BotContext>(
  "orderWizard",

  // Step 1 - ask the user for the delivery address.
  async (ctx: BotContext) => {
    const { id } = parseCallbackData<{ id: string }>((ctx.callbackQuery as any).data, /^order:/);
    const product = products.find((p) => p.id === Number(id));

    state.product = product;

    await ctx.reply(ctx.i18n.t("order.delivery-address"));
    return ctx.wizard.next();
  },

  // Step 2 - ask the user for the phone number
  async (ctx) => {
    state.address = (ctx.message as any).text;
    await ctx.reply(ctx.i18n.t("order.phone"));
    return ctx.wizard.next();
  },

  async (ctx) => {
    state.phone = (ctx.message as any).text;

    await ctx.reply(ctx.i18n.t("order.username"));
    return ctx.wizard.next();
  },

  async (ctx) => {
    state.username = (ctx.message as any).text;

    await ctx.reply(ctx.i18n.t("order.name"));
    return ctx.wizard.next();
  },

  async (ctx) => {
    state.name = (ctx.message as any).text;

    await ctx.replyWithPhoto(state.product!.image, {
      caption: ctx.i18n.t("order.confirmation", {
        address: state.address,
        phone: state.phone,
        name: state.name,
        username: state.username,
        productName: state.product?.name,
        productPrice: state.product?.price,
      }),
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("✅ Подтвердить", "confirm_order")],
        [Markup.button.callback("✏️ Изменить", "edit_order")],
        [Markup.button.callback("❌ Отменить", "cancel_order")],
      ]).reply_markup,
    });
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!("callback_query" in ctx.update)) return;

    const action = (ctx.update.callback_query as any).data;

    if (action === "confirm_order") {
      await ctx.deleteMessage();

      await ctx.telegram.sendPhoto(constants.ADMIN_ID, state.product!.image, {
        caption: ctx.i18n.t("order.card", {
          state,
        }),
      });

      await ctx.reply(ctx.i18n.t("order.success"), {
        reply_markup: Markup.inlineKeyboard([Markup.button.callback("Главное меню", "start")])
          .reply_markup,
      });
      return ctx.scene.leave();
    }

    if (action === "edit_order") {
      await ctx.reply(ctx.i18n.t("order.retry.delivery-address"));
      ctx.wizard.selectStep(1);
      return;
    }

    if (action === "cancel_order") {
      await ctx.reply(ctx.i18n.t("order.cancelled"));
      return ctx.scene.leave();
    }
  }
);
