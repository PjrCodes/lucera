import { PdfReader } from "pdfreader";

export async function parsePdfFile(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const items: string[] = [];
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(items);
      } else if (item.text) {
        items.push(item.text);
      }
    });
  });
}
