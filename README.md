# mean-stack-backend

## Steps to run

``` 
git clone https://github.com/dj-mongodb/mean-stack-backend 
```

``` 
cd mean-stack-backend 
```

```
npm install cors dotenv express mongodb
```

```
npm install --save-dev typescript @types/cors @types/express @types/node ts-node 
``` 

create a file `.env`

Add the following line(please add your own details):

```
ATLAS_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```
Run Server

```
npx ts-node src/server.ts
```
