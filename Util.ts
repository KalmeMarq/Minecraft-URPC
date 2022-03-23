export class Util {
  public static parseJSONC(string: string) {
    let cursor = -1;
    let currentChar = '';

    const advance = () => (currentChar = string[++cursor]);
    const peek = (offset: number = 1) => string[cursor + offset];
    const canRead = () => cursor < string.length && currentChar !== undefined && currentChar !== null;
    const isNumber = () => '0123456789.'.includes(currentChar);
    const isLetter = () => 'abcdefghojklmnopqrstuvwxyzABCDEFGHOJKLMNOPQRSTUVWXYZ'.includes(currentChar);
    const isEOL = () => currentChar === '\n';
    const isEOMC = () => peek(-1) === '*' && currentChar === '/';

    advance();

    let json = '';

    while (canRead()) {
      if (currentChar === ' ' || currentChar === '\n' || currentChar === '\t' || currentChar === '\r') {
        advance();
      } else if (currentChar === '/' && peek() === '/') {
        do {
          advance();
        } while (!isEOL() && canRead());
      } else if (currentChar === '/' && peek() === '*') {
        do {
          advance();
        } while (!isEOMC() && canRead());
        advance();
      } else if (currentChar === '{' || currentChar === '}' || currentChar === '[' || currentChar === ']' || currentChar === ':' || currentChar === ',') {
        json += currentChar;
        advance();
      } else if (currentChar === '"') {
        let str = '"';

        do {
          advance();
          str += currentChar;
        } while (currentChar !== '"' && canRead());

        json += str;
        advance();
      } else if (isNumber()) {
        let str = '';
        let periods = 0;

        do {
          str += currentChar;

          if (currentChar === '.') ++periods;
          if (periods > 1) throw SyntaxError('Number can only have one decimal point');
          advance();
        } while (isNumber() && canRead());

        json += str;
      } else if (isLetter()) {
        let str = '';

        do {
          str += currentChar;
          advance();
        } while (isLetter() && canRead());

        str = str.toLowerCase();

        if (str === 'true' || str === 'false') json += str;
        else throw SyntaxError(`Expected true or false but found ${str}`);
      } else {
        throw Error(`Char ${currentChar} is not allowed!`);
      }
    }

    return JSON.parse(json);
  }

  public static parseLang(string: string) {
    const obj: Record<string, string> = {};

    string.split('\n').forEach((line) => {
      if (line.startsWith('#') || line.trim() === '') return;
      line = line.replace(/[\t]{1,}#/, '');
      if (line.lastIndexOf('##') > -1) line = line.slice(0, line.lastIndexOf('##'));
      const sep = line.replace(/\t#/, '').split('=');

      obj[sep[0]] = sep[1] ? sep.slice(1).join('=') : '';
    });

    return obj;
  }
}
