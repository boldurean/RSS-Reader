[![hexlet-check](https://github.com/boldurean/frontend-project-lvl3/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/boldurean/frontend-project-lvl3/actions/) [![Node CI](https://github.com/boldurean/frontend-project-lvl3/actions/workflows/nodeCI.yml/badge.svg)](https://github.com/boldurean/frontend-project-lvl3/actions) [![Maintainability](https://api.codeclimate.com/v1/badges/00c6d9804aa30af5b00a/maintainability)](https://codeclimate.com/github/boldurean/frontend-project-lvl3/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/00c6d9804aa30af5b00a/test_coverage)](https://codeclimate.com/github/boldurean/frontend-project-lvl3/test_coverage)

### [RSS feeder](https://rss-boldurean.vercel.app) is an rss web service for collecting and easy access to news or other resources you love!

Simply add your favorite RSS news links and get all latest updates from the resource. The app will keep automatically update data every 5 secs. Enjoy!

### Installation:
This command will install app project dependencies into your project folder.

```makefile
make install
```

### Run developer mode:
This command will run the localhost server.
```makefile
make develop
```

### Build: 
Will create dist directiry ready for uploading to your server.
```makefile
make build
```

### Usage: 

Paste a **valid RSS** link in the field and pres **Add** 

![main page view](https://i.imgur.com/TIMkPqs.png)

The app will load all latest articles if those exist. Description is available in preview by clicking on button beside each article. See example bellow: 

![](example.gif)
