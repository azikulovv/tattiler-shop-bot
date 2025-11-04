import path from "path";
import { products } from "@/database";
import { Context, Input, Markup } from "telegraf";
import { parseCallbackData } from "@/utils/parseCallbackData";
import { BotContext } from "@/types";

export const productCallback = async (ctx: BotContext) => {
  await ctx.answerCbQuery();

  const { id, page } = parseCallbackData<{ id: string; page: string }>(
    (ctx.callbackQuery as any).data,
    /^product:/
  );

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return await ctx.reply(ctx.i18n.t("product.error.not-found"));
  }

  const imagePath = path.resolve("src", "assets", "products", product.image || "no-image.jpeg");
  const image = product.image.startsWith("http") ? product.image : Input.fromLocalFile(imagePath);

  const caption = ctx.i18n.t("product.title", {
    name: product.name,
    price: product.price,
    description: product.description,
  });

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(ctx.i18n.t("product.inline-button.order"), `order:id=${product.id}`)],
    [Markup.button.callback(ctx.i18n.t("product.inline-button.back"), `catalog:page=${page}`)],
  ]);

  try {
    await ctx.editMessageMedia(
      {
        type: "photo",
        media: image,
        caption,
        parse_mode: "HTML",
      },
      { reply_markup: keyboard.reply_markup }
    );
  } catch (err) {
    console.error("❌ Error when updating the product card:", err);
    await ctx.reply(ctx.i18n.t("product.error.displaying"));
  }
};
