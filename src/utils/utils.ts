import * as fs from "fs";
import csv from "csv-parser";

export const generatePassword = (): string => {
  const getRandomChar = (characters: string): string =>
    characters[Math.floor(Math.random() * characters.length)];

  const categories = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // Uppercase letters
    "abcdefghijklmnopqrstuvwxyz", // Lowercase letters
    "0123456789", // Digits
    "!@#$%^&*()_-+=<>?/", // Special characters
  ];

  const password = categories.map(getRandomChar).join("");

  const remainingLength = Number(process.env.BP_GENERATED_PASSWORD_LENGTH || 10) - password.length;
  const allCharacters = categories.join("");
  const randomChars = Array.from({ length: remainingLength }, () => getRandomChar(allCharacters));

  console.log(`Generated Password ==> ${password + randomChars.join("")}`);
  return password + randomChars.join("");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformData = (value: string): any => {
  if (value === "NULL") {
    return null;
  }
  if (value === "FALSE") {
    return false;
  }
  if (value === "TRUE") {
    return true;
  }
  if (value === "UNDEFINED") {
    return undefined;
  }
  return value;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const csvToJson = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = [];

    const stream = fs.createReadStream(filePath);

    stream
      .pipe(csv())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("data", (data: any) => {
        // Map CSV row to CreateContactsDto and transform values
        const transformedData = Object.keys(data).reduce(
          (acc, key) => {
            acc[key] = transformData(data[key]);
            return acc;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {} as Record<string, any>,
        );

        result.push(transformedData);
      })
      .on("end", () => {
        resolve(result);
        fs.unlinkSync(filePath);
      })
      .on("error", (error) => {
        reject(error);
        fs.unlinkSync(filePath);
      });
  });
};
