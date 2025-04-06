# Massaki's Blog

A minimalist, functional, and aesthetic blog built with Hugo and TypeScript.

## Features

- **TypeScript Integration**: Enhanced interactivity using TypeScript
- **Dark/Light Mode**: Toggle between dark and light themes
- **Minimalist Design**: Clean, readable interface focused on content
- **Animations**: Subtle animations for a modern feel
- **Responsive**: Works on all devices

## Development

This blog uses:
- [Hugo](https://gohugo.io/) as the static site generator
- [TypeScript](https://www.typescriptlang.org/) for interactive elements
- [Webpack](https://webpack.js.org/) for bundling

### Getting Started

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Run Hugo development server:
```bash
hugo server -D
```

4. In a separate terminal, run TypeScript in watch mode:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
hugo --minify
```

## Customization

- Edit `config.toml` to change site parameters
- Styles are in `static/css/custom.css`
- TypeScript code is in `assets/ts/`

## License

MIT