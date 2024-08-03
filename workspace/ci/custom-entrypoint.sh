#!/bin/bash
# Start SQL Server
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to start
sleep 30s

# Determine the correct path for sqlcmd
if [ -x /opt/mssql-tools/bin/sqlcmd ]; then
    SQLCMD=/opt/mssql-tools/bin/sqlcmd
elif [ -x /opt/mssql-tools18/bin/sqlcmd ]; then
    SQLCMD=/opt/mssql-tools18/bin/sqlcmd
else
    echo "sqlcmd not found."
    exit 1
fi

# Run the initialization script
$SQLCMD -S localhost -U sa -P "YourStrong(!)Password" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'competition') CREATE DATABASE competition;"

# Wait for SQL Server to stop
wait
