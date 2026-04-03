Run docker with everything:

docker compose up -d

Run the container alone:

docker run --name eventorganizer-postgres \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres123 \
	-e POSTGRES_DB=EventOrganizer \
	-p 127.0.0.1:5432:5432 \
	-d postgres:17-alpine

Connect to the container:

docker exec -it eventorganizer-postgres psql -U postgres -d EventOrganizer