# pokemon-graphql
This is a sampe project to uderstand GraphQL,
  - understanding CRUD operations operations
  - User authentication and autherization
  - Filtering and sorting
 
### Database Technology
  - PostgreSQL

### ORM
  - Prisma
 
 ### Web Framework
  - Fastify
 
 ## Up and Running
  - Run command `npm install`
  - Change the `.env.sample` into `.env`
  - Update the `.env` file with your database credetials
  - Run `npm run dev` or `npm run start`
 
## Testing
Open a web browser and go to the `http://localhost:3000/graphql`

### Testing steps
 - Sign up - create new User first
 use the below Mutation inside the Graphql
 ```mutation usr_create{
  signup(email: "test@mail.com", name: "name", password: "<password>") {
    token
    user {
      id
      name
      email
    }
  }
}
```
 
 - Login user
 Please add the token to the `REQUEST HEADERS`
 ```mutation user_login{
  login(email: "<user email>", password: "<password>") {
    token
    user {
      id
      name
      email
    }
  }
}
```
- Sample request header
```
{
  "Authorization": "Bearer RECEIVED ACCESS TOKEN"
}
```

```
 - Creating Pokemons
 Send the request with token, otherwise you will receive unautherise error.
 ```mutation pokemon_create{
  pokemon(name: "<name: string>",  height: <height:number>,  weight: <weight:number>, imgUrl: "<url of the image storage> ",  description: "<descrition:text>")
  {
	 id
 	}
} 
```
- Filtering and ordering pokemons
```
query pokemon_query{
	pokemon(filter:"name", weightfrom:<number>, weightto:<number>, heightfrom:<number>, heightto:<number>, orderBy: { [name || height || weight || createdAt] : [desc or asc] }){
    id
    name
    height
    weight
    imgUrl
    description
  } 
}
```
