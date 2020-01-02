# Update

Auto-update your GitHub or GitLab repository and execute tasks/commands on push.

If this helps you out, please consider giving the repository a star. It makes our night sky better. Thanks.

## Installation

You're going to need the `screen` package if you plan to execute background tasks. If not, you'll be fine without it:

Ubuntu/Debain: `sudo apt-get install screen -y`
CentOS: `yum install screen`

Clone the repository:

```bash
git clone https://github.com/eddiejibson/update.git
```


Enter into repository's directory and and install the dependencies:
```bash 
cd update/ && npm install
```

You'll now [need to configure](#configuration) the platform, [setup your webserver](#configuring-web-server) and [add the webhook](#adding-a-webhook-to-a-repository) before you continue.

Starting:

```bash
node app.js
```

Alternatively, you may start it as a process, with PM2 (recommended):

```bash
npm install pm2 -g
pm2 start processes.json
```

## Configuration

All configuration should be done in a `config.json` file. Here's an example:

```javascript
{
    "port": "8090", //Port of the server to listen onto. Defaults to 8090
    "repos": {
        "eddiejibson/testupdate": { //Enter full repo name here ((username or organization)/repo)
            "secret": "test", //Optionally set a secret "key" to make sure 
	    "gitlab": false, //Is the repo from GitLab?
            //the webhook is indeed from Github and not an attacker
            "path": "/opt/testupdate", //The root path of the repository stored on your local system
            "cmds": [ //Optional. An array of commands you want executed after pull
                "npm install",
                 { //Instead of a string with the command, you can also specify extra options
                     "background": true, //This command will be ran in the background (not slowing down the request)
                     //This is reccomended for intensive commands that may take some time.
                     "cmd": "npm run build"
                 }
            ]
        }
    }
}
```

## Configuring web server

Example NGINX configuration (reverse proxy) with SSL. You can get a free SSL certificate for your domain/subdomain from [Let's Encrypt](https://letsencrypt.org/getting-started/).

```
server {
    listen 80;
    server_name <domain>;
    return 301 https://$server_name$request_uri;
}

server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
	
        ssl_certificate <path/to/ssl/certificate.pem>;
        ssl_certificate_key <path/to/ssl/key.key>;

        server_name <domain (e.g) git.mydomain.com>;

        location / {
            proxy_pass http://127.0.0.1:8090;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Forwarded-Referrer $http_referer;
            proxy_set_header Authorization $http_authorization;
            proxy_pass_header Authorization;
        }
}
```

## Adding a webhook to a repository

Step 1:

![Navigate to your repo's settings](https://i.jibson.me/768.png)

Step 2:

![Navigate to the "webhook" section](https://i.jibson.me/767.png)

Step 3:

![Click "add webhook"](https://i.jibson.me/288.png)

Step 4:

![Finalize webhook settings](https://i.jibson.me/825.png)
