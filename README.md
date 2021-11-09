# wanderer
application of database structuring when working with frameworks

(RU)
1) распакуйте в папку wanderer в корень проекта laravel
2) продублируйте файл config.conf.example без окончания .example
3) в созданном файле config.conf пропишите настройки подключения к базе данных

`
#протокол базы данных pg - postgressql; mysql - mysql
db.client: {протокол}
# адрес нахождения базы данных
db.connection.host: {хост}
# пользователь
db.connection.user: {пользователь}
# пароль
db.connection.password: {пароль}
# база данных
db.connection.database: {база данных}
`

(важно: mysql должен подключаться по ip 127.0.0.1, localhost не подойдет, т.к. библиотека mysql под node.js автоматически заменяет localhost на 127.0.0.1)
(wanderer - поддерживает mysql и postgresql)

4) В папке wanderer установите библиотеки

`
npm i mysql
npm i moment
npm i knex
`

Дальнейшая работа будет происходить в файле db_structure.js

db_structure.js

---- wanderer ----
---- ИНСТРУКЦИЯ ---

wanderer - это система призвана заменить миграции, упростить процесс разработки проектов.

wanderer является системой контроля структуры базы данных.

Объект tables содержит список таблиц, которые должны быть в базе (системные таблицы)
Ключи первого уровня это имена таблиц.

Правила написания имен таблиц:
* Все имена пишутся исключительно в нижнем регистре
* В качестве разделителя использовать символ "_" (нижнее тире)

Ключи второго уровня - это имена полей:
* Базовые правила соответствуют правилам базы данных. Правила наименования полей:
* первичный ключ "id" не указывается в шаблоне, он добавится автоматически (по параметрам файла конфигурации)
* если нужно исключить поле "id" из таблицы, то укажите id: false,
* если нужно изменить параметры поля "id", то просто укажите его как и обычное поле

`id: {
   type: int,
   default: 0,
   primary_key: true,
   auto_increment: true
}`


Не забудьте указать что это первичный ключ primary_key: true
Если поле является связующим, то имя поля должно быть следующего вида:

id_{имя связующей таблицы без префикса "table_"}_table если установлен режим option.binding_fields: id_name_table или {имя связующей таблицы без префикса "table_"}_id если установлен режим option.binding_fields: name_id

Если в одной таблице требуется несколько связующих полей к одной и той же таблице, то после пост-префикса ..._table или _id имени поля можно добавить любой дополнительный пост-префикс через символ "_"
Пример в режиме option.binding_fields = id_name_table:

`id_name_table :{
    id_users_table_create: 'id', // поля для связи с пользователями - кто создал запись в текущей таблице
    id_users_table_last_update: 'id' // поля для связи с пользователями - кто сделал последнюю правку
    id_users_table_del: 'id' // поля для связи с пользователями - кто произвел мягкое удаление
}`

Пример в режиме option.binding_fields = name_id:

`name_id :{
   users_id_create: 'id', // поля для связи с пользователями - кто создал запись в текущей таблице
   users_id_last_update: 'id' // поля для связи с пользователями - кто сделал последнюю правку
   users_id_del: 'id' // поля для связи с пользователями - кто произвел мягкое удаление
}`

Параметры полей могут указываться в нескольких форматах
1) Полный (в виде объекта параметров)

`type: '{тип поля в базе данных}' //список типов будет указан ниже
constraint: {размер поля}  //зависит от типа, может быть не обязательным
default: {значение по умолчанию} если не указать то выставится автоматически: для числовых - 0; для текстовых - ''; для типа text - null, json - {}; ...
index: true - если нужно индексировать поле
null: true - если поле может быть null
param: {...} параметры доп системы странника используются для конструктора отображения и конструктора полей в создаваемой системе`

2) Сокращенный в виде строки
{тип поля}[({размер поля})][_index`если нужно индексировать поле`]
пример:

`{название поля в бд}: 'int_index', // поле integer(11) default 0 // c добавлением индекса по данному полю в таблице (имена индексов добавляются автоматически)
{название поля в бд}: 'int(9)', // integer(9) default 0
{название поля в бд}: 'varchar', // varchar(255) default '';
{название поля в бд}: 'varchar(40)_index', //varchar(40) default ''; // c добавлением индекса по данному полю в таблице (имена индексов добавляются автоматически)
{название поля в бд}: 'varchar(63)', // varchar(63) default '';
{название поля в бд}: 'text', // text nullable; на поле типа text индекс лучше не ставить (текущая версия странника не поддерживает полнотекстовую индексацию)`

3) Смешанный - массив из 2 параметров. Первый - это строка как во втором варианте (сокращенная в виде строки) а второй это объект "param" как в первом варианте
пример:

`{название поля в бд}: ['int_index', {
  type: 'number',
  label: 'Проценты',
  top_params: {
  min: 0,
  step: 1
  max: 100,
  default: 50,
  placeholder: 'Проценты'
}
}], ...`

в базе данных будет создано поле integer (11) default 0; и проиндексировано
в конструкторе полей системы будет поле <input type="number">

Также по умолчанию создаются timestamp поля created_at, updated_at, deleted_at. Поле created_at заполняется при создании записи, deleted_at - при мягком удалении.  

Если вы хотите отключить в таблице какое-либо из этих полей, впишите соответствующие строки: 

`
created_at: false,
updated_at: false,
deleted_at: false,
`

Таблицы нужно сгруппировать. Ниже пример группирования таблиц business, business_vs_users, personal_chars в группу books  

`
const books = {
   business: {
       title: 'string'
   },
   business_vs_users: {
       deleted_at: false,
       created_at: false,
       updated_at: false,
       business_id: 'id',
       users_id: 'id'
   },
   personal_chars: {
       title: 'string'
   }
}
`
Группы таблиц объединяются в массиве tables

`
const
   tables = {
       ...default_tables,
       ...options_tables,
       ...payments_tables,
       ...form_tables,
       ...work_tables,
       ...coupons_tables,
       ...certifications,
       ...books,
       ...amo_tables
   }
;
`

Для автозаполнения полей в таблице используется массив data вида

const data = {
	{таблица}: [
		search: {
			{ключ}: {значение},
{ключ2}: {значение2}
},
data: {
	{какие поля вставить с ключами / заменить для записей с ключами}
}
], ...
}

Где в search передаем ключи, по которым ищем записи, в data - значения, которые вставляем с ключами в новую запись или заменяем ими старые значения в записи с соответствующими ключами.

Странник не может удалять ранее вставленные им автозаписи из БД.

Пример заполнения
`
const data = { // automatic basic filling
   lessons_types: [
       {
           search: {
               slug: 'regular'
           },
           data: {
               title: 'Урок',
           }
       },
       {
           search: {
               slug: 'exam'
           },
           data: {
               title: 'Экзамен',
           }
       },
       {
           search: {
               slug: 'live'
           },
           data: {
               title: 'LIVE',
           }
       },
       {
           search: {
               slug: 'olympiad'
           },
           data: {
               title: 'Олимпиада',
           }
       },
   ],
   forms_fields: [
       {
           search: {
               name: 'surname'
           },
           data: {
               title: 'Фамилия',
               model: 'App\\Models\\Lk\\Users',
               type: 'string',
               order: 0
           }
       },
       {
           search: {
               name: 'name'
           },
           data: {
               title: 'Имя',
               model: 'App\\Models\\Lk\\Users',
               type: 'string',
               order: 1
           }
       },
       {
           search: {
               name: 'phone'
           },
           data: {
               title: 'Телефон',
               model: 'App\\Models\\Lk\\Users',
               type: 'phone',
               order: 2
           }
       },
       {
           search: {
               name: 'email'
           },
           data: {
               title: 'Email',
               model: 'App\\Models\\Lk\\Users',
               type: 'email',
               required: true,
               order: 3
           }
       },
       {
           search: {
               name: 'promo'
           },
           data: {
               title: 'Промокод',
               type: 'string',
               order: 4
           }
       },
       {
           search: {
               name: 'personal_chars_id'
           },
           data: {
               title: 'Что лучше вас характеризует',
               model: 'App\\Models\\ReferenceBooks\\PersonalChars',
               type: 'select',
               order: 5
           }
       },
       {
           search: {
               name: 'business_ids'
           },
           data: {
               title: 'Ваша сфера/интересы',
               model: 'App\\Models\\ReferenceBooks\\Business',
               type: 'multiselect',
               order: 6
           }
       },
   ]
};
`

В последнюю очередь массивы tables и data экспортируются из db_structure.js

`
module.exports = {tables, data};
`
Параметры:
* для того чтобы произвести любые изменения в базе данных просто исправьте шаблон, сохраните и запустите странника.

Отрицательная сторона СТРАННИКА:
*  минусом странника является невозможность переименовать созданную таблицу или поля (при переименовании поля или таблицы - старая таблица будет удалена и создана новая без данных тоже и с именами полей)
*  нет вывода результатов работы в консоль
*  автозаполненные поля при удалении из конфигурации не удаляются из БД.
