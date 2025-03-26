import fs from "fs";

const filePath = "./test-data.json";

// Export const saveTestData = (newData: object) => {
//     Let existingData = {};

//     If (fs.existsSync(filePath)) {
//         ExistingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
//     }

//     Const updatedData = { ...existingData, ...newData };
//     Fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

// };

export const loadTestData = () => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return {};
};
