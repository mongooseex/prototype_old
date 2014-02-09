#!/bin/bash

echo -n "Enter the MySQL root password: "
read -s rootpw
echo -n "Enter database name: "
read dbname
echo -n "Enter database username: "
read dbuser
echo -n "Enter database user password: "
read dbpw

Q1="CREATE DATABASE IF NOT EXISTS $dbname;"
Q2="USE $dbname;"
Q3="GRANT USAGE ON *.* TO $dbuser@localhost IDENTIFIED BY '$dbpw';"
Q4="GRANT ALL PRIVILEGES ON $dbname TO $dbuser@localhost;"
Q5="FLUSH PRIVILEGES;"
Q6="USE $dbname;"
Q7="DROP TABLE IF EXISTS users;"
Q8="CREATE TABLE users (id bigint not null auto_increment, username varchar(32) not null, password varchar(256) not null, email varchar(128) not null, signupDate datetime not null, lastLoginDate datetime not null, verifiedDate datetime, isVerified bit(1) not null, primary key (id));"
Q9="FLUSH PRIVILEGES;"

SQL="${Q1}${Q2}${Q3}${Q4}${Q5}${Q6}${Q7}${Q8}${Q9}"

mysql -u root -p$rootpw -e "$SQL"

if [ $? != "0" ]; then
 echo "[Error]: Database creation failed"
 exit 1
else
 echo "------------------------------------------"
 echo " Database has been created successfully "
 echo "------------------------------------------"
 echo " DB Info: "
 echo ""
 echo " DB Name: $dbname"
 echo " DB User: $dbuser"
 echo " DB Pass: $dbpw"
 echo ""
 echo "------------------------------------------"
fi