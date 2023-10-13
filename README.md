
# Référentiel National des Bâtiments (RNB)

Bienvenue sur le répertoire de code du site du Référentiel National des Bâtiments (RNB)

Si vous souhaitez accéder au répertoire contenant les ressources concernant la construction du standard du référentiel dans le cadre du groupe de travail CNIG sur le thème du bâiment, c'est par [ici](https://github.com/fab-geocommuns/BatID)

Si vous souhaitez accéder au répertoire de code contenant le coeur technique du projet (imports, API, logique métier), [rdv ici](https://github.com/fab-geocommuns/RNB-coeur) 

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Configuration

In order to run the project, you will need to specifiy some information, which can be done using a `.env` file.
This file will have to hold the following information:
- `NEXT_PUBLIC_API_BASE`: the url of the bat-id api

So your `.env` file should look like something similar to:
```
NEXT_PUBLIC_API_BASE=my-url
```

The file should be placed at the root folder of your local copy of the project.


## Deployement 

This Next.js app is deployed using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

![](https://images.ctfassets.net/e5382hct74si/78Olo8EZRdUlcDUFQvnzG7/fa4cdb6dc04c40fceac194134788a0e2/1618983297-powered-by-vercel.svg)

## License

Distributed under the Apache 2 License. See [`LICENSE`](LICENSE) for more information.
