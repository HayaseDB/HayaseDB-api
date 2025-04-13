export const generateUsername = (): string => {
  const animeCharacters = ['Nagatoro', 'Senpai', 'Gamo', 'Yoshi', 'Sakura'];

  const randomCharacter =
    animeCharacters[Math.floor(Math.random() * animeCharacters.length)];
  const randomDigits = Math.floor(1000 + Math.random() * 9000);

  return `${randomCharacter}${randomDigits}`;
};
