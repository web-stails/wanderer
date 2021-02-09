# wanderer
application of database structuring when working with frameworks

(RU)
1) распакуйте в папку wanderer в корене проекта laravel
2) продублитуйте файл config.conf.example без окончания .example
3) в созданом файле config.conf пропишите настройки подключения к базе данных
(важно: mysql должен подключаться по ip 127.0.0.1, localhost не подойдет т.к. библтотека mysql под node.js автоматически заменяет localhost на 127.0.0.1)
(wanderer - поддерживает mysql и postgresql)

4) дальшейшая работа будет происходить в файле db_structure.js

(EN)
1) unzip to the wanderer folder in the laravel project root
2) duplicate the config.conf.example file without ending .example
3) in the created config.conf file, specify the database connection settings
((important: mysql must connect via ip 127.0.0.1, localhost will not work because the mysql library is under node.js automatically replaces localhost with 127.0.0.1)
(wanderer-supports mysql and postgresql)

4) further work will take place in the file db_structure.js



db_structure.js

(RU)
 *  ---- СТРАННИК ----
 *  ---- ИНСТРУКЦИЯ ---
 *
 *  система СТРАННИК это система призвана заменить миграции, упростить процес разработки проектов
 *
 *  СТРАННИК является системой контроля структуры базы данных.
 *
 *  Объект tables содержит список таблиц которые должны быть в базе (системные таблицы)
 *
 *  Ключи первого уровня это имена таблиц.
 *      Правила написания имен таблиц:
 *      1) Все имена пишутся исключительно в нижнем регистре
 *      2) В качестве разделителя использовать символ "_" (нижнее тере)
 *  Ключи второго уровня это имена полей:
 *      1) Базовые правила соответетствую правилам базы данных
 *          правила наименования полей:
 *      2) первичный ключ "id" не указывается в шаблоне он добавится автоматически (по параметрам файла конфигурации)
 *          если нужно исключить поле "id" из таблицы то укажте id: false,
 *          если нужно изменить параметры поля "id" то просто укажите его как и обычное поле
 *              id: {
 *                  type: int,
 *                  default: 0,
 *                  primary_key: true,
 *                  auto_increment: true
 *              }
 *          незабудьте указать что это первичный ключ primary_key: true
 *
 *      3) если поле является связующим  то имя поля должно быть следующего вида:
 *           id_{имя связующей таблицы без префикса "table_"}_table если установлен режим option.binding_fields: id_name_table
 или {имя связующей таблицы без префикса "table_"}_id если установлен режим option.binding_fields: name_id
 *      4) если в одной таблице требуется несколько связующих полей к одной итойже таблице
 *          то после пост-префикса ..._table или _id имени поля можно добавить любой дополнительный пост-превикс через символ "_"
 *          пример в режиме option.binding_fields: id_name_table :{
 *              id_users_table_create: 'id', // поля для связи с пользователями - кто создал запись в тукущей табице
 *              id_users_table_last_update: 'id' // поля для связи с пользователями - кто сделал посделнюю правку
 *              id_users_table_del: 'id' // поля для связи с пользователями - кто произвел мягкое удаление
 *          }
 пример в режиме option.binding_fields: name_id :{
 *              users_id_create: 'id', // поля для связи с пользователями - кто создал запись в тукущей табице
 *              users_id_last_update: 'id' // поля для связи с пользователями - кто сделал посделнюю правку
 *              users_id_del: 'id' // поля для связи с пользователями - кто произвел мягкое удаление
 *          }
 *  параметры полей могут указываться в нескольких форматах
 *      1) Полный (ввиде объекта параметров)
 *          type: '{тип поля в базе данных}' //список типов будет указан ниже
 *          constraint: {размер поля}  //запвисит от типы может быть не обезательным
 *          default: {значение по умолчанию} если не указать то выставится автоматически: для числовых - 0; для тесктовых - ''; для типа text - null, json - {}; ...
 *          index: true - если нужно индексировать поле
 *
 *          param: {...} параметры доп системы странника используются для конструктора отображения и конструктора полей в создоваемой системе
 *
 *      2) Сокращенный в виде строки
 *          {тип поля}[({размер поля})][_index`если нужно интексировать поле`]
 *          пример:
 *              {название поля в бд}: 'int_index', // поле integer(11) default 0 // c добавлением индекса по данному полю в таблице (имена индексов автоматически)
 *              {название поля в бд}: 'int(9)', // integer(9) default 0
 *              {название поля в бд}: 'varchar', // varchar(255) default '';
 *              {название поля в бд}: 'varchar(40)_index', //varchar(40) default ''; // c добавлением индекса по данному полю в таблице (имена индексов автоматически)
 *              {название поля в бд}: 'varchar(63)', // varchar(63) default '';
 *              {название поля в бд}: 'text', // text nullable; на поле типа text индек лучше не ставить (текущая версия страника не поддерживает полнотекстовую индексацию)
 *      3) Смешанный - массив из 2 параметров. Первый - это строка как во втором варианте (сокращенная в виде строки) а второй это объект "param" как в первом варианте
 *          пример:
 *              {название поля в бд}: ['int_index', {
 *                  type: 'number',
 *                  label: 'Проценты',
 *                  top_params: {
 *                      min: 0,
 *                      step: 1
 *                      max: 100,
 *                      default: 50,
 *                      placeholder: 'Проценты'
 *                  }
 *              }], ...
 *              в базе данных будет создано поле integer (11) default 0; и проиндексированно
 *              в конструкторе полей системы будет поле <input type="number"
 *
 *
 * параметры:
 *
 *
 * для того чтобы произвести любые изменения в базе данных просто исправте шаблон, сохраните и запустите страника.

 *
 * отрицательная строна СТРАННИКА:
 *  минусом странника является невозможность переименовать созданную таблицу или поля
 *  (при переименовании поля или таблицы - старая таблица будет удалена и созданна новая без данных тоже и с именами полей)
 *
 
 
 
(EN)
* - - - - WANDERER - - - -
* - - - - INSTRUCTIONS - - -
*
* The WANDERER system is a system designed to replace migration, simplify the process of project development
*
* WANDERER is a database structure control system.
*
* The tables object contains a list of tables that should be in the database (system tables)
*
* First-level keys are table names.
* Rules for writing table names:
* 1) All names are written exclusively in lowercase
* 2) As a separator, use the " _ " character (lower tere)
* Second-level keys are field names:
* 1) Basic rules according to the database rules
* rules for naming fields:
* 2) the primary key "id" is not specified in the template, it will be added automatically (according to the parameters of the configuration file)
* if you need to exclude the field "id" from the table, then specify id: false,
* if you need to change the parameters of the "id" field, just specify it as a normal field
* id: {
* type: int,
* default: 0,
* primary_key: true,
* auto_increment: true
* }
* remember to specify which is the primary key primary_key: true
*
* 3) if the field is binding the name field must be the following:
* id_{name binding tables without the prefix "table_"}_table if set mode option.binding_fields: id_name_table
or {name the junction table without the prefix "table_"}_id if you set the option.binding_fields: name_id
* 4) if a table requires several linking fields to the same table ITALIE
* then after the post-prefix ..._table or _id of the field name, you can add any additional post-prefix using the " _ "symbol
* example in option mode. binding_fields: id_name_table :{
* id_users_table_create: 'id', / / fields for communicating with users - who created the record in the tukushchaya tabitsa
* id_users_table_last_update: 'id' / / fields for communicating with users - who made the last edit
* id_users_table_del: 'id' / / fields for communicating with users - who made a soft delete
* }
example in option mode. binding_fields: name_id: {
* users_id_create: 'id', / / fields for communicating with users - who created the record in the tukushchaya tabitsa
* users_id_last_update: 'id' / / fields for communicating with users - who made the last edit
* users_id_del: 'id' / / fields for communicating with users - who made a soft delete
* }
* field parameters can be specified in several formats
* 1) Full (as a parameter object)
* type: '{field type in the database}' //the list of types will be given below
* constraint: {field size} //zavisit from types may not be skipped
* default: {default} if you do not specify it will be set automatically: for numeric - 0; for testowych - "; for text - null, json - {}; ...
* index: true - if you want to index the field
*
* param: {...} the parameters of the additional system of the wanderer are used for the display constructor and the field constructor in the system being created
*
* 2) Abbreviated as a string
* {field type}[({field size})][_index ' if you need to index a field`]
* example:
* {name of field in dB}: 'int_index', // field is integer(11) default 0 // c by adding an index on this field in the table (the index names automatically)
* {name of field in dB}: 'int(9)', // integer(9) default 0
* {name of field in dB}: 'varchar', // varchar(255) default ";
* {name of field in dB}: 'varchar(40)_index', //varchar(40) default "; // by adding index on this field in the table (the index names automatically)
* {name of field in dB}: 'varchar(63)', // varchar(63) default ";
* {name of the field in the database}: 'text', / / text nullable; it is better not to put an index on a field of the text type (the current version of the page does not support full - text indexing)
* 3) Mixed-an array of 2 parameters. The first is a string as in the second variant (abbreviated as a string) and the second is the "param" object as in the first variant
* example:
* {db field name}: ['int_index', {
* type: 'number',
* label: 'Percentages',
* top_params: {
* min: 0,
* step: 1
* max: 100,
* default: 50,
* placeholder: 'Percentages'
* }
*}], ...
* the field integer (11) default 0 will be created in the database; and indexed
* in the system field constructor, there will be a field <input type= "number"
*
*
* parameters:
*
*
* to make any changes in the database, simply correct the template, save it and run the page.

*
* the negative sides of the WANDERER:
* the disadvantage of the wanderer is the inability to rename the created table or fields
* (if you rename a field or table , the old table will be deleted and a new one will be created without data, too, and with field names)
*

