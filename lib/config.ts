// Личные данные и основные настройки визитки. Редактируйте здесь.
// Внимание: этот файл попадает в браузер — НЕ храните здесь секретные API-ключи.
// Серверные ключи ИИ находятся в `lib/config.server.ts`.

export const PROFILE = {
  name: 'dev.magician',
  title: 'музыкант, немношка программист',
  bio: 'Unsupported charachters',
  avatar: '/avatar.png',
  email: 'sadpigeone27@gmail.com',
  /** Имя пользователя Telegram без @ */
  telegram: 'sadpigeone2007',
  /** Имя пользователя GitHub */
  github: 'sorry, later',
} as const

export const BACKGROUND_URL = 'https://i.pinimg.com/736x/e8/74/24/e8742492de02f9415dda42d21989be68.jpg'

// Заменить на прямую ссылку на .mp3 (положить файл в /public/music/ и указать путь),
// например: '/music/track.mp3'. Ссылка на страницу Яндекс Музыки не является аудиофайлом.
export const MUSIC_URL = '/public/zhanna.mp3'

// TODO: Это защита только на стороне клиента — пароль виден в коде сборки.
// Позже можно добавить настоящую серверную авторизацию.
// ОБЯЗАТЕЛЬНО измените пароль: задайте NEXT_PUBLIC_ACCESS_PASSWORD или замените значение ниже.
export const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'onehungreed100'

export const AI_SYSTEM_PROMPT = `Ты — дружелюбный и полезный ИИ-ассистент на личном сайте-визитке (${PROFILE.name}, ${PROFILE.title}). Отвечай по-русски, ясно и по делу. Используй Markdown для списков, кода и выделения, когда это уместно.`
