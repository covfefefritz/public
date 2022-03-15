drop table if exists users;
drop table if exists messages;
drop table if exists loggedInUsers;
create table users(
    firstname varchar(100),
    lastname varchar(100),
    gender varchar(100),
    city varchar(100),
    country varchar(100),
    email varchar(100),
    password varchar(100),
    hash varchar(100),
    salt varchar(100),
    primary key(email)
);

create table messages(
  id integer,
  sender_email varchar(100),
  receiver_email varchar(100),
  location varchar(100),
  message varchar(300),
  primary key(id)
);

create table loggedInUsers(
  token varchar(100),
  email varchar(100),
  primary key(token)
);