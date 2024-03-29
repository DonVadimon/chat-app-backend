# CHAT APP

## Directory structure

```bash
<root>
├── README.md # you are right here
├── chat-api # main chat api on nestjs
├── face-api # face analyze flask api
├── database # postgresql directory
├── pgadmin # pgadmin directory
├── nginx # nginx configuration
├── docker-compose.yml # shared docker-compose configuration
├── docker-compose.dev.yml # docker-compose configuration specific to devevlopment
├── docker-compose.face.api-only.yml # docker-compose configuration specific to face-api with api-only option
├── docker-compose.prod.yml # docker-compose configuration specific to production
└── docker-start.sh # script for docker-compose start
```

### Run app

Use command `sh ./docker-start.sh <mode>`

Available running modes:

 - `<no options>` - run app in development mode
 - `prod` - run app in production mode
 - `face-api-only` - run app but face-api response is mocked

<p align="center">
<img style="height:auto;border-radius: 50%;" alt="" width="260" height="260" class="avatar avatar-user width-full border color-bg-default" src="https://avatars.githubusercontent.com/u/67438684?v=4">
</p>

<h3 align="center">
Khizhnyakov Vadim, 2022-2023
</h3>
