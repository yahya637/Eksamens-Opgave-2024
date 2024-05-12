create table Activitytracker
(
	activity_id int identity,
	name varchar(255) not null,
	kcalPerHour int not null,
	primary key (activity_id)
)
go

create table Users
(
	user_id int identity,
	fullName nvarchar(50),
	username nvarchar(50) not null,
	email nvarchar(50) not null,
	passwordHash nvarchar(256),
	birthdate date,
	gender nvarchar(10),
	weight decimal(5,2),
	primary key (user_id),
	unique (email),
	unique (username)
)
go

create table BmrCalculations
(
	bmr_id int identity,
	user_id int not null,
	bmr_mj decimal(6,2),
	bmr_kcal decimal(8,2),
	calculation_date date default CONVERT([date],sysdatetimeoffset() AT TIME ZONE 'Central European Standard Time'),
	calculation_time time(0) default CONVERT([time],sysdatetimeoffset() AT TIME ZONE 'Central European Standard Time'),
	primary key (bmr_id),
	foreign key (user_id) references Users,,
)
go

create table Mealcreator
(
	MealId int identity,
	MealName varchar(255) not null,
	calcEnergy100g float,
	calcProtein100g float,
	calcFat100g float,
	calcFiber100g float,
	User_id int,
	ingredients varchar(max),
	totalMealWeight decimal(10,2),
	primary key (MealId),
	foreign key (User_id) references Users
)
go

create table UserActivities
(
	registeredActivity_id int identity,
	user_id int,
	activity_id int,
	activity_name varchar(255) not null,
	KcalBurned float,
	DurationMinutes int not null,
	DateOnly date default CONVERT([date],sysdatetimeoffset() AT TIME ZONE 'Central European Standard Time'),
	TimeOnly time(0) default CONVERT([time],sysdatetimeoffset() AT TIME ZONE 'Central European Standard Time'),
	primary key (registeredActivity_id),
	foreign key (activity_id) references Activitytracker,
	foreign key (user_id) references Users,,
)
go

CREATE TRIGGER LowerCaseInsertTrigger
ON dbo.Users
AFTER INSERT
AS
BEGIN
  UPDATE u
  SET u.email = LOWER(i.email),
      u.fullName = LOWER(i.fullName),
      u.username = LOWER(i.username),
      u.gender = LOWER(i.gender)
  FROM Nutri.Users u
  INNER JOIN inserted i ON u.user_id = i.user_id
END;
go

create table WaterIntake
(
	WaterID int identity,
	User_id int,
	waterAmount_ml float,
	intake_date date default CONVERT([date],sysdatetimeoffset() AT TIME ZONE 'Central European Standard Time'),
	intake_time time(0) default CONVERT([time],sysdatetimeoffset() AT TIME ZONE 'Central European Standard Time'),
	primary key (WaterID),
	foreign key (User_id) references Users,
	foreign key (User_id) references Users,,
)
go

create table consumedMeal
(
	consumed_Id int identity,
	meal_Id int,
	user_Id int,
	mealName varchar(255),
	consumedWeight float,
	consumedEnergy float,
	consumedProtein float,
	consumedFat float,
	consumedFiber float,
	dateAdded date,
	timeAdded time,
	location varchar(255),
	primary key (consumed_Id),
	foreign key (meal_Id) references Mealcreator,
	foreign key (user_Id) references Users
)
go

