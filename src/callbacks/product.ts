import { Context, Input, Markup } from "telegraf";
import path from "path";
import { products } from "../data/products";

/**
 * Безопасно извлекает параметры из callback data
 * Пример: "product:id=3&page=1"
 */
function parseCallbackData(ctx: Context): { id: number; page: number } {
  try {
    const raw = (ctx.callbackQuery as any)?.data ?? "";
    const query = raw.replace(/^product:/, "");
    const params = Object.fromEntries(new URLSearchParams(query));

    return {
      id: Number(params.id) || 0,
      page: Number(params.page) || 1,
    };
  } catch (err) {
    console.error("❌ Error parsing callback data:", err);
    throw new Error("Couldn't process product data");
  }
}

/**
 * Обработчик карточки товара
 * — Показывает изображение, описание и кнопки действий
 */
export const productCallback = async (ctx: Context) => {
  await ctx.answerCbQuery(); // Закрываем "loading" у кнопки

  const { id, page } = parseCallbackData(ctx);
  const product = products.find((p) => p.id === id);

  if (!product) {
    await ctx.reply("⚠️ The product has not been found or is outdated.");
    return;
  }

  const imagePath = path.resolve("src", "assets", "products", product.image || "no-image.jpeg");

  const caption =
    `🔥 <b>${product.name}</b>\n\n` +
    `${product.description}\n\n` +
    `💰 <b>${product.price}</b>\n` +
    `⚡ Стиль, который выделяет. Возьми свой прямо сейчас!`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("💰 Купить", `order:id=${product.id}`)],
    [Markup.button.callback("⬅️ Назад", `catalog:page=${page}`)],
  ]);

  try {
    await ctx.editMessageMedia(
      {
        type: "photo",
        media: Input.fromLocalFile(imagePath),
        caption,
        parse_mode: "HTML",
      },
      { reply_markup: keyboard.reply_markup }
    );
  } catch (err) {
    console.error("❌ Error when updating the product card:", err);
    await ctx.reply("An error occurred when displaying the product. Try again later.");
  }
};
