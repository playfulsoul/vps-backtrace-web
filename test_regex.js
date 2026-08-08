const log = `HOST: lg-sg-singapore.rabisu.com          Loss% Snt Last Avg Best Wrst StDev
  1.|-- 15.235.180.252                     0.0%  4  1.9  1.2  0.6  1.9  0.6
  2.|-- 10.133.2.82                        0.0%  4  6.0  1.9  0.5  6.0  2.7
`;
const lines = log.split(/\r?\n/);
const regex = /(?:\d+[\.\|-]+|\b\d+\b)\s+([^\s]+)?\s*([0-9.]+)%?\s+(\d+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s+([0-9.]+))?/;
for (let line of lines) {
    if (!line.trim()) continue;
    console.log(line);
    console.log(line.match(regex));
}
