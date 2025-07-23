const transliterationMap: { [key: string]: string } = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ' ': '_',
  '-': '_',
  '(': '',
  ')': '',
  '.': '_',
  ',': '_',
  '/': '_',
  '\\': '_',
  '!': '',
  '?': '',
  '«': '',
  '»': '',
  '"': '',
  "'": '',
};

export const transliterate = (text: string): string => {
  return text
    .toLowerCase()
    .split('')
    .map((char) => transliterationMap[char] || char)
    .join('')
    .replace(/[^a-z0-9_]/g, '_') // заменяем все недопустимые символы на _
    .replace(/_+/g, '_') // убираем множественные _
    .replace(/^_|_$/g, ''); // убираем _ в начале и конце
};
