# 起動方法

### 起動

```
cd backend
docker compose up -d
```

### DB

```
docker compose exec db bash
mysql -u root -p
password: password
```

### MySQL

```
mysql> CREATE DATABASE calendar;
mysql> exit
```

### golang

```
docker compose exec go sh
/go/src # go run cmd/main.go
```
