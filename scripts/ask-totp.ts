import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\n[!] Please enter your 6-digit Kotak Neo TOTP: ", (totp) => {
  console.log(totp.trim());
  rl.close();
});
