# [nusmodchat](https://modchat.nuscomputing.com)

A community-maintained portal to view all available Telegram chats for NUS modules.

## Installation

1. Run `cp .env.example .env`.
1. Create a Telegram bot ID with [BotFather](https://t.me/BotFather), and add
   it to the `.env` file.
1. Create an empty `.data` folder with `mkdir .data` for the Lowdb database.
1. Run `npm install` to install dependencies.

## Development

To run the development server, run:

```
npm run start
```

Before committing, be sure to format your code by running:

```
npm run prettify
```
