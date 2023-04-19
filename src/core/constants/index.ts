export const GENA_ID = '282952551,765917456,172272059,758116042';
export const GROUP_ID = 219481464;

export const MESSAGE_TEXT = (name: string, id: number, title: string) => encodeURIComponent(
  `❗Новая заявка 

  
  @id${id} (${name}) оставил заявку по вашей ссылке «${title}» 


  📝Написать клиенту: vk.me/id${id}
  💡 Ответьте как можно скорее, ведь от скорости зависит ваша конверсия`);

export const CLAIM_TEXT = (name: string, id: number, url: string) => encodeURIComponent(
  `Жалоба на данную заявку: vk.com/app51586799#${url}

    От @id${id} (${name})
    
    Проверить, при наличии нарушении заблокировать
    `);

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
