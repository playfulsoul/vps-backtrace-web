const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = html.substring(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
try {
  new Function(js);
  console.log("Syntax OK");
} catch (e) {
  console.error("Syntax Error:", e);
}
