export const GENA_ID = 282952551;

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

export const CLAIM_TEXT = (name: string, id: number, url: string) =>
  `Жалоба на данную заявку: https://vk.com/app51586799\#${url}
    <br>
    От @id${id} (${name})
    <br>
    <br>
    Проверить, при наличии нарушении заблокировать
    `;

export const KEYBOARD_FOR_CLAIM = (uri) => {
  return {
    inline: true,
    buttons: [
      [
        {
          action: {
            type: 'callback',
            label: 'Заблокировать',
            payload: { uri },
          },
        },
      ],
    ],
  };
};
