#!/bin/sh
# wait-for-postgres.sh

set -e

cmd="$@"

until psql "$DATABASE_URL" '\q'; do
  >&2 echo "Postgres is unavailable - sleeping $DB_USER - $DB_PWD"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
