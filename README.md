## Run

```
docker-compose up
```

## Request

```
curl --location --request \
  GET 'localhost:3000/number-plate/<number-plate>/price[?[skip_cache_for_read=<true|false>]]'
```

### Example

```
curl --location --request \
  GET 'localhost:3000/number-plate/6/price?skip_cache_for_read=false'
```
