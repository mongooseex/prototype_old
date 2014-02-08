
mysql -u root -proot -e "create database monoosex;GRANT ALL PRIVILEGES ON new_db.* TO mongoosexdb@localhost IDENTIFIED BY 'mongoosexdb'"

mysql -u root -proot -e "create table users (id bigint not null auto_increment, username varchar(32) not null, password varchar(256) not null, email varchar(128) not null, signupDate datetime not null, lastLoginDate datetime not null, verifiedDate datetime, isVerified bit(1) not null, primary key (id));"

mysql -u root -proot -e "alter table users add primary key (id);"