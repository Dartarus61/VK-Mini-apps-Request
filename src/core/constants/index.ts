export const GENA_ID = 174261333;

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

export const CLAIM_TEXT = (name: string, id: number, uri: string) =>
  `Жалоба на данную заявку
    <br>
    От @id${id} (${name})
    <br>
    id заявки = ${uri}
    <br>
    <br>
    Проверить, при наличии нарушении заблокировать
    `;

export const KEYBOARD_FOR_CLAIM = {
  inline: true,
  buttons: [
    [
      {
        action: {
          type: 'callback',
          label: 'Заблокировать',
          payload: { uri: 333 },
        },
      },
    ],
  ],
};
