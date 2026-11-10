// Все строки интерфейса собраны здесь. Чтобы добавить язык, создайте объект
// с той же структурой (типа Dictionary) и добавьте его в `dictionaries`.

export const ru = {
  meta: {
    title: 'привет',
    description: 'яяяяяяя делаю говноооо',
  },
  card: {
    status: 'Не беспокоить',
    contactsHeading: 'Контакты',
    email: 'Почта',
    telegram: 'Telegram',
    github: 'GitHub',
    openLink: (label: string) => `Открыть: ${label}`,
    copyContacts: 'Скопировать контакты',
    copied: 'Скопировано!',
    copyError: 'Не удалось скопировать',
    openSettings: 'Открыть настройки',
    openLocked: 'Открыть закрытое меню',
    avatarAlt: (name: string) => `Фотография: ${name}`,
    copyTemplate: (p: { name: string; title: string; email: string; telegram: string; github: string }) =>
      `${p.name}\n${p.title}\nПочта: ${p.email}\nTelegram: ${p.telegram}\nGitHub: ${p.github}`,
  },
  music: {
    play: 'Включить музыку',
    pause: 'Выключить музыку',
    hint: 'Нажмите, чтобы включить музыку',
  },
  settings: {
    title: 'Настройки',
    appearance: 'Внешний вид',
    dim: 'Затемнение фона',
    cardOpacity: 'Прозрачность карточки',
    theme: 'Тема',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    themeSystem: 'Системная',
    sound: 'Звук',
    volume: 'Громкость музыки',
    reset: 'Сбросить настройки',
    done: 'Готово',
    close: 'Закрыть настройки',
    dragHandle: 'Потяните вниз, чтобы закрыть',
  },
  lock: {
    title: 'Закрытое меню',
    subtitle: 'Введите пароль для доступа',
    placeholder: 'Пароль',
    label: 'Пароль доступа',
    submit: 'Войти',
    wrong: 'Неверный пароль. Попробуйте ещё раз.',
    empty: 'Введите пароль',
    close: 'Закрыть',
    show: 'Показать пароль',
    hide: 'Скрыть пароль',
  },
  dashboard: {
    title: 'Личное пространство',
    badge: 'Доступ открыт',
    logout: 'Выйти',
    back: 'Назад к визитке',
  },
  chat: {
    title: 'ИИ-ассистент',
    subtitle: 'Работает через сервер сайта — VPN не нужен',
    provider: 'Выбор модели',
    placeholder: 'Напишите сообщение…',
    inputLabel: 'Сообщение для ассистента',
    inputHint: 'Enter — отправить, Shift+Enter — новая строка',
    send: 'Отправить',
    stop: 'Остановить ответ',
    clear: 'Очистить чат',
    keyToggle: 'Настройки API-ключа',
    keyLabel: (provider: string) => `Ваш API-ключ ${provider}`,
    keyHint:
      'Ключ хранится только в этом браузере (localStorage) и используется, если на сервере не задан ключ.',
    keySave: 'Сохранить',
    keyRemove: 'Удалить',
    keySaved: 'Ключ сохранён в браузере',
    keyNone: 'Ключ в браузере не задан',
    emptyTitle: 'Чем могу помочь?',
    emptyText: 'Задайте вопрос или выберите одну из подсказок ниже.',
    suggestions: [
      'Придумай короткое описание для моей визитки',
      'Помоги составить сопроводительное письмо',
      'Объясни разницу между REST и GraphQL',
    ],
    typing: 'Ассистент печатает…',
    you: 'Вы',
    assistant: 'Ассистент',
    dismissError: 'Скрыть ошибку',
    errors: {
      no_key: 'API-ключ не задан. Добавьте ключ в переменные окружения или вставьте свой в настройках ключа.',
      invalid_key: 'Неверный API-ключ. Проверьте ключ и попробуйте снова.',
      rate_limit: 'Слишком много запросов. Подождите немного и повторите.',
      insufficient_balance: 'На балансе аккаунта провайдера недостаточно средств.',
      network: 'Ошибка сети. Проверьте подключение к интернету и повторите попытку.',
      bad_request: 'Некорректный запрос. Попробуйте переформулировать сообщение.',
      unknown: 'Что-то пошло не так. Попробуйте ещё раз.',
    },
  },
}

export type Dictionary = typeof ru

export const dictionaries = { ru } satisfies Record<string, Dictionary>

export type Locale = keyof typeof dictionaries

export const DEFAULT_LOCALE: Locale = 'ru'

export const t: Dictionary = dictionaries[DEFAULT_LOCALE]
