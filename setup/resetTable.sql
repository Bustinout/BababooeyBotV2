DROP TABLE public.gym_champions;
CREATE TABLE public.gym_champions (
	id serial4 NOT NULL,
	description varchar NULL,
	user_id bigint NOT NULL,
	guild_id bigint NOT NULL,
	date_created timestamptz DEFAULT NOW()
);

DROP TABLE public.gym_weakmen;
CREATE TABLE public.gym_weakmen (
	id serial4 NOT NULL,
	description varchar NULL,
	user_id bigint NOT NULL,
	guild_id bigint NOT NULL,
	date_created timestamptz DEFAULT NOW()
);

DROP TABLE public.gym_workouts_current;
CREATE TABLE public.gym_workouts_current (
	id serial4 NOT NULL,
	description varchar NULL,
	user_id bigint NOT NULL,
	guild_id bigint NOT NULL,
	date_created timestamptz DEFAULT NOW()
);

DROP TABLE public.gym_workouts_past;
CREATE TABLE public.gym_workouts_past (
	id serial4 NOT NULL,
	description varchar NULL,
	user_id bigint NOT NULL,
	guild_id bigint NOT NULL,
	date_created timestamptz DEFAULT NOW()
);

DROP TABLE public.users;
CREATE TABLE public.users (
	id serial4 NOT NULL,
	discord_username varchar NOT NULL,
	discord_id bigint NOT NULL UNIQUE,
	gold int8 NOT NULL,
	date_created timestamptz DEFAULT NOW()
);