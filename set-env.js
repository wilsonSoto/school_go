const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const targetPath = './src/environments/environment.ts';
const envConfigFile = `
export const environment = {
  production: false,
  googleMapsApiKey: '${process.env.API_KEY_MAPS}',
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Environment file generated at ${targetPath}`);
  }
});
