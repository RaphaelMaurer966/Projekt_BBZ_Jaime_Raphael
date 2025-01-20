CREATE TABLE posts (
                       id SERIAL PRIMARY KEY,
                       user_id SERIAL NOT NULL,
                       titel VARCHAR(64) NOT NULL,
                       inhalt VARCHAR(512) NOT NULL,
                       bild VARCHAR(256),
                       datum DATE DEFAULT now(),
                       likes INT DEFAULT 0
);

CREATE TABLE likes (
                       id SERIAL PRIMARY KEY,
                       user_id SERIAL NOT NULL,
                       posts_id SERIAL NOT NULL,
                       foreign key (posts_id) references posts(id) on delete cascade
);

CREATE TABLE events (
                       id SERIAL PRIMARY KEY,
                       user_id BIGINT(20) UNSIGNED NOT NULL,
                       titel VARCHAR(64) NOT NULL,
                       inhalt VARCHAR(512) NOT NULL,
                       datum DATE,
                       likes INT DEFAULT 0
);