export const MESSAGE_TEXT = (name: string, id: number, title: string) => {
  const str = `❗Новая заявка 

  @id${id} (${name}) оставил заявку по вашей ссылке ${title}» 
  
  📝Написать клиенту: vk.me/id${id}
  💡 Ответьте как можно скорее, ведь от скорости зависит ваша конверсия`;
  return new DOMParser().parseFromString(str, 'text/html');
};

/* '❗Новая заявка\n\n\r ' +
  '@id' +
  id +
  ' (' +
  name +
  ') оставил заявку по вашей ссылке «' +
  title +
  '»\n\n\r' +
  '📝Написать клиенту: vk.me/id' +
  id +
  '\n\r💡 Ответьте как можно скорее, ведь от скорости зависит ваша конверсия'; */
