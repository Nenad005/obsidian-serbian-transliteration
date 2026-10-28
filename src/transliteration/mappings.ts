export const cyrillicToLatin: Readonly<Record<string, string>> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž',
  з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n',
  њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u',
  ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};

export const latinToCyrillic: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(cyrillicToLatin).map(([cyrillic, latin]) => [latin, cyrillic]),
);
