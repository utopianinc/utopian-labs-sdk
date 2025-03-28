# Utopian Labs TypeScript SDK

The Utopian Labs TypeScript SDK provides convenient access to the Utopian Labs API from
applications written in server-side TypeScript.

## Documentation

See the [`utopianlabs` API docs](https://docs.utopianlabs.ai/) for Node.js.

## Requirements

Node 20 or higher.

## Installation

Install the package with:

```sh
npm install utopianlabs
# or
yarn add utopianlabs
```

## Usage

The package needs to be configured with your account's API key, which is
available in the [Utopian Labs API Keys page](https://portal.utopianlabs.ai/api-keys).

### Create a new agent run

```ts
import { UtopianLabs } from "utopianlabs";
const utopianLabs = new UtopianLabs({ apiKey: "your-api-key" });

const run = await utopianLabs.agents.runs.create({
  agent: "r1",
  lead: {
    company: {
      website: "https://example.com",
    },
  },
});

console.log(run);
```

### Fetch an agent run

```ts
import { UtopianLabs } from "utopianlabs";
const utopianLabs = new UtopianLabs({ apiKey: "your-api-key" });

const runData = await utopianLabs.agents.runs.get({
  id: "abc123",
});

console.log(runData);
```
