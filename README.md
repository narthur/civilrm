# Convex

This example demonstrates the [Convex](https://convex.dev) backend platform.

## Get this project

Run the following to clone this starter template:

```bash
codebuff --create convex my-app
```

## Development

While developing:

```bash
npm run dev
```

This command runs `next dev` and `convex dev` at the same time. This command will log you into Convex, so you'll need to create a Convex account if this is your first project.

Once everything is working, commit your code and deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

Use `npx convex deploy --cmd 'npm run build'` as the build command and set the `CONVEX_DEPLOY_KEY` environmental variable in Vercel ([Documentation](https://docs.convex.dev/production/hosting/vercel)).
