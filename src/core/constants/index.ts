export const MESSAGE_TEXT = (name: string, id: number, title: string) =>
  `❗Новая заявка 
  <br>
  <br>
  @id${id} (${name}) оставил заявку по вашей ссылке «${title}» 
  <br>
  <br>
  📝Написать клиенту: vk.me/id${id}
  <br>
  💡 Ответьте как можно скорее, ведь от скорости зависит ваша конверсия`;
