## CS:GO Inspect Link

This app allows inspecting skins from other players in-game, on a game server.
This works by providing an inspect link for the desired skin.

## Installation

1. Clone this repository
2. Run `npm install` to install all dependencies
3. Run `cp .env.example .env` and fill out all env variables
4. Run `npm run migrate` to run all database migrations
5. Run `npm run skins:update` to parse all skins and insert them into the database
6. Run `npm run start` to start the app

## Setup

### Install the SourceMod Plugin on your CS:GO server

In order to work, you need to install the CS:GO Inspect Link [SourceMod Plugin](https://github.com/zonenet/csgo-inspectlink-sm). Detailed instructions for the installation can be found in the readme of the repository.

Note that you can add the plugin to multiple CS:GO servers. This way, you can have one web app that works with any number of CS:GO servers.


### Add Steam Accounts

This app requires at least one Steam account in order to extract data from the CS:GO inspect links through the Steam API. Each Steam account can only inspect one skin at a time, so if you have some traffic then you might consider to add more than just one Steam account. The more Steam accounts, the more concurrent requests the app can serve.

You can add new Steam accounts to the database through the `node cmd account:create` command. Here's an example:

```
node cmd account:create --username user123 --password password123 --secret secret123
```

The `username` argument is the Steam username, the `password` argument is the account password, and the `secret` is the shared secret which is required to login through 2FA.

If you want to want to remove a Steam account from the database, simply use this command:

```
node cmd account:destroy --username user123
```

## Environment Variables

|Variable|Type|Default|Description|
|-|-|-|-|
|NODE_ENV|string|development|The current environment. Possible values are `development` and `production`. Make sure to set this to `production` when you're going live.|
|WEB_PORT|integer|3000|The port that the Express web server is listening to.|
|APP_KEY|string|none|The app key. This key should be a random string that is used to encrypt Steam account credentials. needs to be 32 chars long!|
|DATABASE_URL|string|none|The URL of the PostgreSQL database that is used by the application.|
|DATABASE_DEBUG|boolean|true|Whether to log database queries or not.|
|DATABASE_SSL|boolean|false|Whether to connect to the database through SSL.|
|DATABASE_MIN_CONNECTIONS|integer|1|The minimum number of open database connections.|
|DATABASE_MAX_CONNECTIONS|integer|10|The maximum number of open database connections.|
|STEAM_API_KEY|string|none|The Steam API key that is used to interact with the Steam API.|
|INSPECT_TIMEOUT_MS|integer|3000|The time in milliseconds after which an inspect request times out if no response from Steam is received.|

## REST API

### Errors

Error responses always have a 4XX or 5XX HTTP status code. Additionally, errors always have an `id` and a `message` property. Here's an example:

```json
{
  "id": "SERVER_ERROR",
  "message": "Ouch! An unexpected server error occurred."
}
```

The `message` string is user-friendly and can be displayed to directly to end users.

Here's a full list of all errors:

|ID|Status Code|Message|
|-|-|-|
|VALIDATION_ERROR|400|This message varies depending on the validation error.|
|UNSUPPORTED_SKIN|400|Sorry but this skin is currently not supported.|
|NOT_FOUND|404|Whoops, this endpoint does not exist.|
|ALL_SERVERS_FULL|500|Sorry, all of our CS:GO test servers are currently full. Please try again later.|
|INSPECTION_FAILED|500|Failed to inspect the given CS:GO inspect link, please try again.|
|SERVER_ERROR|500|Ouch! An unexpected server error occurred.|

### Endpoints

#### Inspect specific item

##### Endpoint

`POST /inspectlink`

##### Input Parameters

|Parameter|Type|Required|Description|
|-|-|-|-|
|link|string|Yes|The inspect link of the CS:GO skin that the player should be equipped with.

##### Description

This endpoint retrieve information about a specific CS:GO Item.

##### Response Examples

```json
{
    "paintkit_name": "Night Terror",
    "paintkit_defindex": 1130,
    "paintindex": 1130,
    "item_name": "M4A1-S",
    "item_defindex": 60,
    "item_class": "weapon_m4a1",
    "item_name_technical": "weapon_m4a1_silencer",
    "item_type": "Rifle",
    "wear": 0.30472201108932495,
    "seed": 303,
    "customname": null,
    "stickers": [
        {
            "slot": 0,
            "sticker_id": 5022,
            "wear": null,
            "scale": null,
            "rotation": null,
            "tint_id": null
        },
        {
            "slot": 1,
            "sticker_id": 5022,
            "wear": null,
            "scale": null,
            "rotation": null,
            "tint_id": null
        },
        {
            "slot": 2,
            "sticker_id": 5022,
            "wear": null,
            "scale": null,
            "rotation": null,
            "tint_id": null
        },
        {
            "slot": 3,
            "sticker_id": 5022,
            "wear": null,
            "scale": null,
            "rotation": null,
            "tint_id": null
        }
    ],
    "stattrak": -1
}
```

#### List all items

##### Endpoint

`GET /items`

##### Description

This endpoint lists all CS:GO items for which skins are available.

##### Response Examples

Here's an example response:

```json
{
  "items": [
    {
      "id": 8,
      "name": "AK-47",
      "name_technical": "weapon_ak47",
      "defindex": 7,
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/weapons/base_weapons/weapon_ak47.a320f13fea4f21d1eb3b46678d6b12e97cbd1052.png",
      "class": "weapon_ak47",
      "type": "Rifle"
    },
    {
      "id": 9,
      "name": "AUG",
      "name_technical": "weapon_aug",
      "defindex": 8,
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/weapons/base_weapons/weapon_aug.6b97a75aa4c0dbb61d81efb6d5497b079b67d0da.png",
      "class": "weapon_aug",
      "type": "Rifle"
    }
  ]
}
```

#### List all paintkits

##### Endpoint

`GET /paintkits`

##### Description

This endpoint lists all available paintkits.

##### Response Examples

Here's an example response:

```json
{
  "paintkits": [
    {
      "id": 1,
      "name": "Spruce DDPAT",
      "name_technical": "handwrap_camo_grey",
      "defindex": 10010
    },
    {
      "id": 2,
      "name": "Badlands",
      "name_technical": "handwrap_fabric_orange_camo",
      "defindex": 10036
    }
  ]
}
```

#### List all skins

##### Endpoint

`GET /skins`

##### Description

This endpoint lists all available skins.

##### Response Examples

Here's an example response:

```json
{
  "skins": [
    {
      "id": 1,
      "name": "Hand Wraps | Spruce DDPAT",
      "name_technical": "leather_handwraps_handwrap_camo_grey",
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/leather_handwraps_handwrap_camo_grey_light_large.04557b1a8d68bccdd60b18521346091328756ded.png",
      "item": {
        "id": 1,
        "name": "Hand Wraps",
        "name_technical": "leather_handwraps",
        "defindex": 5032,
        "image_url": "",
        "class": "wearable_item",
        "type": "Gloves"
      },
      "paintkit": {
        "id": 1,
        "name": "Spruce DDPAT",
        "name_technical": "handwrap_camo_grey",
        "defindex": 10010
      }
    },
    {
      "id": 2,
      "name": "Hand Wraps | Badlands",
      "name_technical": "leather_handwraps_handwrap_fabric_orange_camo",
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/leather_handwraps_handwrap_fabric_orange_camo_light_large.f8453c60f74a846bd3c05310de4f004cd95a1aa2.png",
      "item": {
        "id": 1,
        "name": "Hand Wraps",
        "name_technical": "leather_handwraps",
        "defindex": 5032,
        "image_url": "",
        "class": "wearable_item",
        "type": "Gloves"
      },
      "paintkit": {
        "id": 2,
        "name": "Badlands",
        "name_technical": "handwrap_fabric_orange_camo",
        "defindex": 10036
      }
    }
  ]
}
```

## Software Suite

The CS:GO Inspect Link backend works as a standalone in retrieving information about a skin, but to inspect a skin in-game the SourceMod plugin is required.

- [NodeJS Backend](https://github.com/zonenet/csgo-inspectlink) (this repository)
- [SourceMod Plugin](https://github.com/chescos/csgo-inspectlink-sm)



## Credits

This project is based upon [chescos's CS:GO Skin Tester](https://github.com/chescos/csgo-skin-tester)