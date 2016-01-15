FROM mhart/alpine-node:5

RUN apk add --update make gcc g++ python git && rm -rf /var/cache/apk/*

RUN adduser -S bitcoin

WORKDIR /home/bitcoin/app

COPY package.json /home/bitcoin/app/

RUN npm install --ignore-scripts

COPY . /home/bitcoin/app/

RUN chown -R bitcoin /home/bitcoin

USER bitcoin

RUN npm rebuild

RUN npm run transpile

ENTRYPOINT ["node"]

CMD ["--version"]
