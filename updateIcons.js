const fs = require('fs');
const path = require('path');

const iconsPath = path.join(__dirname, '..', 'assets', 'icons');

try {
  const files = fs
    .readdirSync(iconsPath)
    .filter((file) => file.match(/\.svg$/));
  console.log(files);

  // Remove fill and fix width and height
  files.forEach((file) => {
    const filePath = path.join(iconsPath, file);
    const data = fs.readFileSync(filePath, 'utf8');
    const result = data
      .replace(
        /\sfill="(?!currentColor).*?"|(?<=<svg[^>]*)\s(?:width|height)=".*?"/g,
        '',
      )
      .replace(
        /viewBox="(?:[0-9.]+\s){2}([0-9.]+)\s([0-9.]+)/,
        'width="$1" height="$2" $&',
      );
    fs.writeFileSync(filePath, result, 'utf8');
  });

  // Add icons to gallery
  const indexPath = path.join(iconsPath, 'gallery.html');
  const result = fs.readFileSync(indexPath, 'utf8').replace(
    /<script id="updateIcons">[\s\S]*?<\/script>/g,
    `<script id="updateIcons">
    /* This script is automatically generated using \`yarn updateIcons\` */
      window.addEventListener('load', () => {
        [${files.map(
          (fileName) => `'${fileName.replace(/\.svg$/, '')}'`,
        )}]
          .sort()
          .forEach((iconName) => {
            const listItem = document.createElement('li');

            const icon = document.createElement('img');
            icon.setAttribute('src', \`./\${iconName}.svg\`);
            icon.setAttribute('alt', 'this icon is missing');

            const name = document.createElement('p');
            name.innerText = iconName;

            listItem.appendChild(icon);
            listItem.appendChild(name);
            document
              .getElementsByTagName('ul')[0]
              .appendChild(listItem);
          });
      });
    </script>`,
  );
  fs.writeFileSync(indexPath, result, 'utf8');
} catch (error) {
  console.error(error);
}
