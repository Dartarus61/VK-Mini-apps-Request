export const MESSAGE_TEXT = (name: string, id: number, title: string) =>
  `❗Новая заявка\n 
  \n\r
  @id${id} (${name}) оставил заявку по вашей ссылке «${title}»\n 
  \n\r
  📝Написать клиенту: vk.me/id${id}\n\r
  💡 Ответьте как можно скорее, ведь от скорости зависит ваша конверсия`;
