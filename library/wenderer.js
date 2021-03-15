const moment = require('moment');
const convert_sf_data = require('./convert_sf_data');
const correct_models = require('./correct_models');
module.exports = new class database_structuring extends require('../models/app_model') {
	constructor() {
		super();
		this.convert_types = [
			{name: ['increments'], val: 'increments', type: 'n'},
			{name: ['big_increments'], val: 'bigIncrements', type: 'n'},
			{name: ['bool', 'boolean', 'tinyint'], val: 'boolean', type: 'n', pr: [{name: 'constraint', default: 255}]},
			{name: ['int', 'integer'], val: 'integer', type: 'n'},
			{name: ['big_int', 'bigInteger'], val: 'bigInteger', type: 'n'},
			{name: ['text'], val: 'text', type: 'sn'},
			{name: ['binary'], val: 'binary', type: 's'},
			{name: ['varchar'], val: 'string', type: 's', pr: [{name: 'constraint', default: 255}]},
			{name: ['string'], val: 'string', type: 's', pr: [{name: 'constraint', default: 255}]},
			{name: ['longtext'], val: 'text', type: 's', pr: ['longtext'] },
			{name: ['long_text'], val: 'text', type: 's', pr: ['longtext'] },
			{name: ['longText'], val: 'text', type: 's', pr: ['longtext'] },
			{name: ['float'], val: 'float', type: 'n', pr: [{name: 'precision', default: 8}, {name: 'scale', default: 2}]},
			{name: ['decimal'], val: 'decimal', type: 'n', pr: [{name: 'precision', default: 8}, {name: 'scale', default: 2}]},
			{name: ['date'], val: 'date', type: 'd'},
			{name: ['datetime'], val: 'datetime', type: 'd', pr: [{name: 'precision', default: {precision: 6}}]},
			{name: ['time'], val: 'time', type: 't', pr: [{name: 'precision', default: 6}]},
			{name: ['timestamp'], val: 'timestamp', type: 't'},
			{name: ['json', 'jsonb'], val: 'jsonb', type: 't'}
		];

		this.key_tables_table_id = 'id_tables_table_table';

		if(config_global_option.option.binding_fields == 'name_id') {
			this.key_tables_table_id = 'tables_table_id';
		}

	}

	async function_tables() {
		const {tables: tables_structure, data: table_data} = require('../db_structure');

		let tables = {
			table_tables: {
				title: {
					type: 'varchar',
					param: {
						type: 'text',
						label: 'Название',
						require: true
					}
				},
				name_table: 'varchar(64)_index',
				field: 'text',
				field_view: 'text',
				type: 'varchar(25)_index',
				active: 'active'
			},
			table_fields: {
				[this.key_tables_table_id]: 'id',
				order: 'int_index',
				name: {
					type: 'varchar',
					param: {
						type: 'text',
						label: 'Ключ поля',
						require: true,
						add_param: {
							pattern: '^[a-zA-Z_][0-9a-zA-Z_-]*$'
						}
					}
				},
				label: {
					type: 'varchar',
					param: {
						type: 'text',
						label: 'Подпись поля',
						require: true
					}
				},
				placeholder: ['string', {
					type: 'text',
					label: 'placeholder поля'
				}],
				edit: 'active',
				auto_save: 'bool',
				select_list: 'bool',
				require: {
					type: 'bool',
					constraint: 1,
					default: 0,
					param: {
						type: 'checkbox',
						label: 'Обязательное для ввода',
						default: 0
					}

				},
				unique: {
					type: 'bool',
					default: '0',
					param: {
						type: 'checkbox',
						label: 'Уникальное значение',
						default: '0'
					}
				},
				view: {
					type: 'bool',
					constraint: 1,
					default: 0,
					param: {
						type: 'checkbox',
						label: 'Вывести в просмотр',
						default: 0
					}
				},
				type: {
					type: 'varchar',
					constraint: 30,
					param: {
						type: 'select',
						label: 'Тип поля',
						values: {
							text: 'Строка',
							number: 'Число',
							date_sql: 'Дата',
							email: 'E-mail',
							color: 'Цвет',
							time: 'Время',
							textarea: 'Текстовое поле',
							checkbox: 'Флажок',
							edit: 'Редактор текста',
							img: 'Картинка',
							file: 'Файл',
							url: 'URL',
							select: 'Список',
							radio: 'Переключатели'
						}
					}
				},
				top_params: 'text', // все праметры поподают в выше стоящие
				add_params: 'text'  // дополнительные параметры могут быть чем угодно
			},
			...tables_structure
		};

		// перенос дефолтных полей в основной список если они помечены как игнорируемые
		await forIn(tables, async table => {

			// если нету опций в таблице создаем их
			if(typeof table._option == 'undefined') {
				table._option = {
					model:{
						SoftDelete: true, // управление подключением класса SoftDelete - default: true
						table: true, // управление переменной $table - default: true
						fillable: true, //управление массивом $fillable - default: true
						dates: true, // управление массивом $dates - default: true
						timestamp: true // управление строчкой public $timestamps = false; - default: true
					},
					default_vars: { // автоматическое добавление дефолтных полей
						id: true, // - default: true
						deleted_at: true, // - default: true
						created_at: true, // - default: true
						update_at: true // - default: true
					}
				};
			}

			if(typeof table.created_at != 'undefined' && table.created_at === false) {
				table._option.default_vars.created_at = false;
			}
			if(typeof table.id != 'undefined' && table.id === false) {
				table._option.default_vars.id = false;
			}
			if(typeof table.update_at != 'undefined' && table.update_at === false) {
				table._option.default_vars.update_at = false;
			}
			if(typeof table.deleted_at != 'undefined' && table.deleted_at === false) {
				table._option.default_vars.deleted_at = false;
				table._option.model.SoftDelete = false;
			}


			if(typeof table._option != 'undefined' && typeof table._option.default_vars != 'undefined') {
				await forIn(table._option.default_vars, (val, field) => {
					if(val == false) {
						table[field] = val;
					}
				});
			}
		})

		// преобразуем сокращеные параметры полей в полные
		await convert_sf_data.convert_files(tables);

		// console.log('tables _ 1 =>', tables);

		// коррекция масствов fillable в моделях
		await correct_models.correct_fillable(tables);

		return {tables, table_data};
	}

	field_tables(schema_table, data, dialect) {

		let add_params = (column, param, type = '') => {
				if(type === 'n') {
					if (isset(param.default)) {
						column.defaultTo(param.default);
					} else {
						column.defaultTo(0);
					}
				}
				if(type === 's') {
					if (isset(param.default)) {
						column.defaultTo(param.default);
					} else {
						column.defaultTo('');
					}
				}
				if(type === 'sn') {
					if (isset(param.default)) {
						column.defaultTo(param.default);
					}

					// column.nullable();
				}
				if(type === 'j') {
					if (isset(param.default)) {
						column.defaultTo(param.default);
					} else {
						column.defaultTo('{}');
					}
				}

				if(type === 'd') {
					if (isset(param.default)) {
						column.defaultTo(param.default);
					}
				}

				if(type === 't') {
					if (isset(param.default)) {
						column.defaultTo(param.default);
					}
				}

				if(empty(param.null) && type !== 'sn') {
					column.notNullable();
				} else {
					column.nullable();
				}

				if(param.unsigned) {
					column.unsigned();
				}

				if(param.modify) {
					column.alter();
				}
			},

			_fields_ = (name, param) => {

				// исключаем опции таблицы из списка преобразования
				if(name == '_option') {
					return;
				}

				this.convert_types.forEach(el => {
					if(in_array(param.type, el.name)) {
						if(! empty(el.pr)) {

							let add_param_construct_field = [];
							el.pr.forEach(pr => {
								if(typeof pr === 'object') {

									if(! empty(param[pr.name])) {
										add_param_construct_field.push(param[pr.name]);
									} else {


										add_param_construct_field.push(pr.default);
									}

								} else {
									add_param_construct_field.push(pr);
								}
							});

							if(el.val == 'date' && isset(param.default) && (param.default == 'new()' || param.default == 'new')) {
								param.default = this.db.raw('CURRENT_TIMESTAMP');
							};

							if(el.val == 'datetime' && isset(param.default) && (param.default == 'new()' || param.default == 'new')) {
								param.default = this.db.fn.now(6);
							};

							if(el.val == 'timestamp' && isset(param.default) && (param.default == 'new()' || param.default == 'new')) {
								// param.default = this.db.fn.now();
								param.default = this.db.raw('CURRENT_TIMESTAMP');
							};

							add_params(schema_table[el.val](name, ...add_param_construct_field), param, el.type);
						} else {

							if(el.val == 'date' && isset(param.default) && (param.default == 'new()' || param.default == 'new')) {
								param.default = this.db.raw('CURRENT_TIMESTAMP');
							};

							if(el.val == 'datetime' && isset(param.default) && (param.default == 'new()' || param.default == 'new')) {
								param.default = this.db.fn.now(6);
							};

							if(el.val == 'timestamp' && isset(param.default) && (param.default == 'new()' || param.default == 'new')) {
								// param.default = this.db.fn.now();
								param.default = this.db.raw('CURRENT_TIMESTAMP');
							};

							// timestamp


							add_params(schema_table[el.val](name), param, el.type);
						}
					}
				});
			}
		;

		// добавляем поля
		if(! empty(data.fields)) {
			forIn(data.fields, (param, name) => {
				// console.log('field_ => ',{param, name});
				_fields_(name, param, dialect);
			})
		}

		// модифицируем поля
		if(! empty(data.modify)) {
			forIn(data.modify, (param, name) => {
				// console.log({name, param});
				if(! param) {
					param = {
						modify: true
					}
				} else {
					param.modify = true;
				}


				_fields_(name, param, dialect);
			})
		}

		// удаляем поля
		if (!empty(data.del)) {
			data.del.forEach(column_name => {
				schema_table.dropColumn(column_name)
			})
		}

		// добавляем индексы
		if(! empty(data.add_index)) {
			data.add_index.forEach(column_name => {
				schema_table.index(column_name);
			})
		}

		// удяляем индексы
		if(! empty(data.del_index_name)) {
			forIn(data.del_index_name, (value, name) => {
				schema_table.dropIndex(name, value);
			})
		}

	}

	async woks_tables(tables = false, list_index_db = null, tables_db = []) {
		const tables_external_parameter = {};

		await asyncForeach(tables, async (fields_tables, table) => {
			let bases_default_field = {};

			let external_parameter = {},
				primary_field = config_global_option.option.primary_field,
				// модифицируемые поля таблицы
				param_modifi = {}
			;

			// автоматически выставляем ключевое поле
			if(! isset(fields_tables[primary_field])) {
				bases_default_field[primary_field] = {
					type: 'increments'
				};
			} else if(fields_tables.id === false) {
				delete(fields_tables.id); // поля id не должно быть в таблице
			}

			// добавляем поле мягкого удаления
			if(config_global_option.option.field_deleted_at &&
				! (isset(fields_tables[config_global_option.option.field_deleted_at]) && fields_tables[config_global_option.option.field_deleted_at] === false))
			{
				bases_default_field[config_global_option.option.field_deleted_at] = Object.assign({}, config_global_option.option.param_field_deleted_at)
			} else if(isset(fields_tables[config_global_option.option.field_deleted_at]) && fields_tables[config_global_option.option.field_deleted_at] === false) {
				delete(fields_tables[config_global_option.option.field_deleted_at]); // поля deleted_at не должно быть в таблице
			}

			// поле времени создания записи
			if(config_global_option.option.field_created &&
				! (isset(fields_tables[config_global_option.option.field_created]) && fields_tables[config_global_option.option.field_created] === false)) {
				bases_default_field[config_global_option.option.field_created] = Object.assign({}, config_global_option.option.param_field_created)
			} else if(isset(fields_tables[config_global_option.option.field_created]) && fields_tables[config_global_option.option.field_created] === false) {
				delete(fields_tables[config_global_option.option.field_created]); // поля created_at не должно быть в таблице
			}

			// поле времени последнего изменения
			if(config_global_option.option.field_update &&
				! (isset(fields_tables[config_global_option.option.field_update]) && fields_tables[config_global_option.option.field_update] === false))
			{
				bases_default_field[config_global_option.option.field_update] = Object.assign({}, config_global_option.option.param_field_update)
			} else if(isset(fields_tables[config_global_option.option.field_update]) && fields_tables[config_global_option.option.field_update] === false) {
				delete(fields_tables[config_global_option.option.field_update]); // поля created_at не должно быть в таблице
			}


			fields_tables = {
				...bases_default_field,
				...fields_tables
			}

			// console.log('fields_tables =>', fields_tables);

			if(in_array(table, tables_db))
			{ // таблца существует
				let this_field = await this.db(table) // получаем поля таблицы
				.columnInfo()
				.then(x => x)
				.catch(error => {
					console.error(error);
					process.exit(-1);
				})
				;

				let need_field = [],
					this_list_field = [],
					need_index = [],
					this_list_index = [], // массив полей с индексами которые есть в базе
					name_list_index = {} //соотнощение имени поля и имени индекса
				;

				for(let name_field in this_field) {
					this_list_field.push(name_field);
				}

				if(! empty(list_index_db[table])) {
					list_index_db[table].forEach(this_index => {
						// составляем массив полей с индексами которые есть в базе
						this_list_index.push(this_index.column);
						//соотнощение имени поля и имени индекса
						name_list_index[this_index.column] = this_index.name
					});
				}

				for (let name_field in fields_tables) {
					let param_field = fields_tables[name_field];

					need_field.push(name_field) // список полей таблицы которые должны быть

					// составляем индексы полей которые должнвы быть
					if(! empty(param_field.index)) {
						need_index.push(name_field)
					}

					// выписываем параметры для работы с полем при заполнении
					if (! empty(param_field.param)) {
						external_parameter[name_field] = param_field.param;
					}

					if (in_array(name_field, this_list_field)) {
						// Поле присутствует в таблице

						let types_ff = {};
						this.convert_types.forEach(t => {
							t.name.forEach(name => {
								types_ff[name] = t.val;
							})
						})

						// ищим различия (параметры данных поля в базе)
						if (
							// значение по умолчанию
							(! empty(param_field.default) && this_field[name_field].defaultValue !== param_field.default)
							// тип поля
							|| (this_field[name_field].type !== types_ff[param_field.type] && this_field[name_field].type !== param_field.type)
							// размер поля
							|| (! empty(param_field.constraint) && this_field[name_field].maxLength !== param_field.constraint)
							// значение null
							|| this_field[name_field].nullable === empty(param_field.null)
						) {
							if(param_field.type != 'increments') { // исключаем если это поле авто заполнение
								param_modifi[name_field] = param_field; // добавляем его в массив модификаций
							}

						}
					}
				}

				// получаем список полей котрые нужно удалить и которые нужно добавить
				let {add: add_fields, del: del_fields} = this_need(this_list_field, need_field);
				let	param_add_fields = {};


				// собираем поля с параметрами - котрые нужно добавить
				if(! empty(add_fields)) {
					add_fields.forEach(field => {
						param_add_fields[field] = fields_tables[field];
					})
				}

				// получаем список индексов-полей котрые нужно удалить и которые нужно добавить
				let {add: add_index, del: del_index} = this_need(this_list_index, need_index);
				let	del_index_name = {};

				// собираем индексы для удаления
				if(! empty(del_index)) {
					del_index.forEach(field => {
						if(field !== primary_field) {
							del_index_name[field] = name_list_index[field];
						}
					})
				}

				if (
					! empty(param_add_fields)
					|| ! empty(param_modifi)
					|| ! empty(del_fields)
					|| ! empty(add_index)
					|| ! empty(del_index_name)
				) {

					// console.log('table =>', table, {
					// 	fields: param_add_fields,
					// 	modify: param_modifi,
					// 	del: del_fields,
					// 	add_index,
					// 	del_index_name
					// });

					if(! empty(del_index_name)) {
						await this.db.schema.alterTable(table, schema_table => {
							this.field_tables(schema_table, {
								del_index_name
							});
						})
						.then(x => x)
						.catch(error => {
							console.error(error);
							process.exit(-1);
						})
					}

					await this.db.schema.alterTable(table, schema_table => {
						this.field_tables(schema_table, {
							fields: param_add_fields,
							modify: param_modifi,
							del: del_fields,
							add_index
						});

					})
					.then(x => x)
					.catch(error => {
						console.error(error);
						process.exit(-1);
					})


				}

				tables_external_parameter[table] = external_parameter;
			}
			else
			{
				// TODO Таблицы не существует, создаем ее
				let  add_index = [];

				forIn(fields_tables, (param_field, name_field) => {
					//составляем индексы полей
					if(! empty(param_field.index)) {
						add_index.push(name_field);
					}

					// выписываем параметры для работы с полем при заполнении
					if (! empty(param_field.param)) {
						external_parameter[name_field] = param_field.param;
					}
				})

				if(! empty(fields_tables)) {

					// console.log('table =>', table);

					await this.db.schema.createTable(table, schema_table => {
						this.field_tables(schema_table, {
							fields: fields_tables,
							add_index
						})
					})
					.then(x => x)
					.catch(error => {
						console.error(error);
						process.exit(-1);
					})
				}

				tables_external_parameter[table] = external_parameter;
			}
		})

		return tables_external_parameter;

	}

	async init(){
		let external_parameter_tables = {}, // внешние параметры
			// сюда запишим индексы всех таблиц в базе
			index_tables_db = {},
			// сюда запишим список таблиц которые есть в базе
			tables_db = await this.list_tables()
			.then(x => x)
			.catch(e => {
				console.error(e);
				process.exit(-1);
			})
		;

		let {tables, table_data} = await this.function_tables();

		// получаем индексы всех таблиц
		let list_index_tables = await this.list_index()
		.then(x => x)
		.catch(e => {
			console.error(e);
			process.exit(-1);
		});

		// подготовка массива списка индексов к дальнейшей работе
		if(! empty(list_index_tables)) {
			list_index_tables.forEach(el => {
				if(empty(index_tables_db[el.table])) {
					index_tables_db[el.table] = [];
				}

				index_tables_db[el.table].push({
					name: el.name,
					column: el.column,
					type: el.type
				});
			});
		}

		// выполняем основную структуризацию бд
		// получаем массив выше стоящих параметров
		external_parameter_tables = await this.woks_tables(tables, index_tables_db, tables_db);

		// console.log('er =>', tables);
		// работаем с полями таблиц в таблице полей таблиц (сори за формулировку)
		await asyncForeach(tables, (async function(fields, table) { // перебор по таблицам

			// получаем запись об таблице из таблицы таблиц
			let table_table = await this.db('table_tables')
			.where({
				name_table: table
			})
			.first()
			.then(x => ! empty(x) ? x : false)
			.catch(e => {
				console.error(e)
				process.exit(-1);
			})
			;

			let field_view = ! empty(external_parameter_tables[table]) ? JSON.stringify(external_parameter_tables[table]) : '{}';

			// console.log('field_view => ', field_view);

			let id = 0;

			// console.log('table_table =>', table_table);

			if(! empty(table_table)) { // запись есть (корректируем)
				const tv_data = {
					id: parseInt(table_table.id), // id числовой на всякий случай parseInt
					field: JSON.stringify(fields),
					field_view: field_view,
					type: 'system',
					active: true
				};

				// console.log('tv_data =>', tv_data);

				await this.table('table_tables')
				.then(() => {
					return this.save(tv_data)
				})
				.then(x => x)
				.catch(e => {
					console.error(e);
					process.exit(-1);
				})
				;

				id = table_table.id;
			} else { // записи нету создаем (запись об таблице в тадлице таблиц)
				id = await this.table('table_tables')
				.then(async () => this.save({
					name_table: table,
					field: JSON.stringify(fields),
					field_view: field_view,
					type: 'system',
					active: true
				}))
				.then(x => x[0])
				.catch(e => {
					console.error(e);
					process.exit(-1);
				});
			}

			// console.log('table_table id =>', id);

			id = parseInt(id);
			// дальше работаем с полями записанными в таблицу полей по текущей обрабатываемой таблице
			if(! empty(external_parameter_tables[table])) {

				// записываем поля таблицы в таблицу полей таблиц
				await asyncForeach(external_parameter_tables[table], async (params, field) => {
					if (! empty(params.type) && ! empty(params.label)) {
						let data_field = {};

						let is_id = await this.db('table_fields')
						.where({
							[this.key_tables_table_id]: id,
							name: field
						})
						.then(x => {
							if(! empty(x)) {
								if(x.length > 1) {
									asyncForeach(x, async (ff, index) => {
										if(index) {
											this.db('table_fields')
											.where({
												id: ff.id
											})
											.del()
											.then(x => x)
											.catch(e => {
												console.error(error);
												process.exit(-1);
											})
										}
									})
								}

								return x[0].id;
							} else {
								return 0
							}
						})
						.catch(e => {
							console.error(e);
							process.exit(-1);
						})

						if(is_id > 0) {
							data_field['id'] = is_id;
						} else {
							// получаем максимальный индекс позиции поля (order)
							data_field['order'] = await this.db('table_fields')
							.where({
								[this.key_tables_table_id]: id
							})
							.max('order')
							.first()
							.then(x => {
								if(! empty(x.max)) {
									return x.max
								} else {
									return 0
								}
							})
							.catch(e => {
								console.error(e);
								process.exit(-1);
							})
							;

							data_field['order'] ++;
						}

						data_field[this.key_tables_table_id] = id;
						data_field['label'] = !empty(params.label) ? params.label : field;
						data_field['placeholder'] = !empty(params.placeholder) ? params.placeholder : data_field['label'];

						let edit = false;
						// поле редактируется если есть параметры и тип поля известен
						if (! empty(params)) {
							for(let name_type_field in global_variants_field_types) {
								if(params.type === name_type_field) {
									edit = true;
								}
							}
						}
						// поле не редактируется если это явно указанно
						if(isset(params.edit) && empty(params.edit)) {
							edit = false;
						}


						data_field['edit'] = edit;
						data_field['select_list'] = !empty(params.select_list) ? params.select_list : false;
						data_field['require'] = !empty(params.require) ? params.require : false;
						data_field['unique'] = !empty(params.unique) ? params.unique : false;
						data_field['auto_save'] = !empty(params.auto_save) ? params.auto_save : false;
						data_field['view'] = ! empty(params.view) ? true : false;
						data_field['type'] = params.type;
						data_field['name'] = field;
						data_field['top_params'] = JSON.stringify(! empty(params.top_params) ? params.top_params : {});
						data_field['add_params'] = ! empty(params.top_params) ? JSON.stringify(params.top_params) : '';

						let to_id = await this.table('table_fields')
						.then(() => this.save(data_field))
						.then(x => x.id)
						.catch(error => {
							console.error('error =>', error);
							process.exit(-1);
						})

						// console.log('to_id', to_id);
					}
				})
			}

			// получаем все поля по текущей таблице записанные в таблицу полей
			let this_field_this_table = await this.db('table_fields')
			.where({
				[this.key_tables_table_id]: id
			})
			.then(x => x)
			.catch(error => {
				console.error(error);
				process.exit(-1);
			})
			;

			// console.log
			if (! empty(this_field_this_table)) {
				await asyncForeach(this_field_this_table, async field => {
					if(empty(external_parameter_tables[table][field.name])) {
						await this.db('table_fields')
						.where({
							id: field.id
						})
						.del()
						.then(x => x)
						.catch(error => {
							console.error(error);
							process.exit(-1);
						})
					}
				})
			}
		}).bind(this));

		// удаляем ошибки создания полей
		await this.db('table_fields')
		.where({
			[this.key_tables_table_id]: 0
		})
		.del()
		.then(x => x)
		.catch(error => {
			console.error(error);
			process.exit(-1);
		});


		// составляем массив имен таблиц в корфигураторе
		let names_tables = []
		for(let p in tables) {
			names_tables.push(p);
		}

		// получаем системные таблицы
		let table_system = await this.db('table_tables')
		.where({
			type: 'system'
		})
		.then(x => x)
		.catch(error => {
			console.error(error);
			process.exit(-1);
		})
		;

		if(! empty(table_system)) {
			await asyncForeach(table_system, async row_table => {
				// если такая таблица в корфигурации
				if(! in_array(row_table.name_table, names_tables)) {
					// если таблицы нету в конфигураторе
					// удаляем запись
					await this.db('table_tables')
					.where({
						id: row_table.id
					})
					.del()
					.then(x => x)
					.catch(error => console.rror(error))

					// удаляем поля таблицы из таблицы полей таблиц (если они осталить)
					await this.db('table_fields')
					.where({
						[this.key_tables_table_id]: row_table.id
					})
					.del()
					.then(x => x)
					.catch(error => console.rror(error))

					// если выстален режим только свои, то сразу удаяем и таблицу с записью
					if(! empty(config_global_option.option.wanderer_mode) && config_global_option.option.wanderer_mode == 'only') {
						await this.db.schema.dropTableIfExists(row_table.name_table)
						.then(x => x)
						.catch(error => {
							console.error(error);
							process.exit(-1);
						})
					}
				}
			})
		}

		// получаем не системные таблицы (созданные в процессе работы системы)
		let table_not_system = await this.db('table_tables')
		.where('type', '<>', 'system')
		.then(x => x)
		.catch(error => {
			console.error(error);
			process.exit(-1);
		})
		;

		if(! empty(table_not_system)) {

			let t_a = {};

			table_not_system.forEach(table => {
				t_a[table.name_table] = JSON.parse(table.field);
			});

			const top_param = await this.woks_tables(t_a, index_tables);

			if(! empty(top_param)) {
				await asyncForeach(top_param, async (field_param, index) => {
					await this.db('table_tables').update({
						field_view: JSON.stringify(field_param)
					}).where({
						name_table: index
					})
					.then(x => x)
					.catch(error => {
						console.error(error);
						process.exit(-1);
					})
				});
			}
		}

		// удаление талиц которых нет в $table и $table_admin
		// на данную строчку все таблицы должны быть учтены в таблице таблиц
		// если в бд есть таблицы которые не указаны в таблице таблиц то удаляем их
		tables_db = await this.list_tables()
		.then(x => x)
		.catch(error => {
			console.error(error);
			process.exit(-1);
		})
		;

		if(! empty(tables_db)) {

			let table_table_tables = await this.db('table_tables')
			.then(x => x)
			.catch(error => {
				console.error(error);
				process.exit(-1);
			})
			;

			let list_name_tables = [];

			await asyncForeach(table_table_tables, async this_table => {

				// если таблицы нету в бд но есть в таблице таблиц (убаляем запись)
				if(this_table.type === 'system' && ! in_array(this_table.name_table, tables_db)) {

					// удаляем запись
					await this.db('table_tables')
					.where({
						id: this_table.id
					})
					.del()
					.then(x => x)
					.catch(error => {
						console.error(error);
						process.exit(-1);
					})

					// удаляем поля таблицы из таблицы полей таблиц (если они осталить)
					await this.db('table_fields')
					.where({
						[this.key_tables_table_id]: this_table.id
					})
					.del()
					.then(x => x)
					.catch(error => {
						console.error(error);
						process.exit(-1);
					});


				} else {
					list_name_tables.push(this_table.name_table)
				}
			})


			if(empty(config_global_option.option.wanderer_mode) || config_global_option.option.wanderer_mode == 'all') {
				// удаляем таблицы которых нету в таблице таблиц
				await asyncForeach(tables_db, async name_table => {
					// если таблицы нету в бд но есть в таблице таблиц (убаляем запись)
					if (! in_array(name_table, list_name_tables)) {

						this.db.schema.dropTableIfExists(name_table)
						.then(x => x)
						.catch(error => {
							console.error(error);
							process.exit(-1);
						})
					}
				})
			}
		}

		// ---- заполнение таблиц ------

		// маска для определения что поле связующее
		let reg_mask_connect = /^id_(.+)_table/


		if(config_global_option.option.binding_fields == 'name_id') {
			reg_mask_connect = /^(.+)_id_?.{0,}/
		}

		if(! empty(table_data)) {
			await asyncForeach(table_data, async (construct, table) => {
				await asyncForeach(construct, async param => {
					if(! empty(param.search)) {

						// если заполняемое поле это id(связующее поле) и в качестве связки указан не id а параметры поиска
						await asyncForeach(param.search, async (value_data, key) => {
							if(is_object(value_data) && reg_mask_connect.test(key)) {
								let reg_p = key.match(reg_mask_connect);

								let val = await this.db(reg_p[1])
								.where(value_data)
								.first('id')
								.then(x => x.id)
								.catch(e => {
									console.error(e);
									process.exit(-1);
								})
								;

								if(! empty(val)) {
									param.search[key] = val
								} else {
									param.search[key] = 0;
								}
							}
						});

						let data = await this.db(table)
						.where(param.search)
						.first('*')
						.then(x => x)
						.catch(e => {
							console.error(e);
							process.exit(-1);
						})
						;

						if(! empty(data)) {
							if(! empty(param.data) && (! isset(param.update) || param.update == true)) {
								let update_to = false;

								for(let p in data) {
									if(! empty(param.data[p])) {

										if(tables[table][p].type == 'timestamp') {
											if(param.data[p][key] == 'this_time()' && data[p] != null) {
												param.data[p][key] = Date.now();
												update_to = true;
											}
										} else if(param.data[p] !== data[p]) {
											update_to = true;
										}
									}
								}

								// есди заполняемое поле это id(связующее поле) и в качестве связки указан yне id а параметры поиска
								await asyncForeach(param.data, async (value_data, key) => {
									if(is_object(value_data) && reg_mask_connect.test(key)) {
										let reg_p = key.match(reg_mask_connect);


										let val = await this.db(reg_p[1])
										.where(value_data)
										.first('id')
										.then(x => x.id)
										.catch(e => {
											console.error(e);
											process.exit(-1);
										})
										;

										if(! empty(val)) {
											param.data[key] = val
										} else {
											param.data[key] = 0;
										}
									}

									if(value_data == 'this_time()') {
										ins[key] = moment().format('YYYY-MM-DD HH:mm:ss');
									}
								});


								if(update_to) {
									await this.db(table)
									.update(param.data)
									.where({id: data.id})
									.then(x => x)
									.catch(e => {
										console.error(error);
										process.exit(-1);
									})
									;
								}
							}
						} else {
							let ins = {...param.search};

							if(! empty(param.data)) {
								ins = {...param.search, ...param.data}
							}

							// console.log(ins);
							// process.exit(-1);

							// есди заполняемое поле это id(связующее поле) и в качестве связки указан yне id а параметры поиска
							let reg = /^(.+)_id_?.+/;
							await asyncForeach(ins, async (value_data, key) => {
								// console.log('f =>', value_data, key);
								if(is_object(value_data) && reg.test(key)) {
									let reg_p = key.match(reg);

									let val = await this.db(reg_p[1])
									.where(value_data)
									.first('id')
									.then(x => x.id)
									.catch(e => {
										console.error('error =>', e);
										process.exit(-1);
									})
									;

									if(! empty(val)) {
										ins[key] = val
									} else {
										ins[key] = 0;
									}
								}

								if(value_data == 'this_time()') {
									ins[key] = moment().format('YYYY-MM-DD HH:mm:ss');//Date.now();
								}
							});

							// console.log(ins);
							// process.exit(-1);


							await this.db(table)
							.insert(ins)
							.then(x => x)
							.catch(e => {
								console.error('error =>', e);
								process.exit(-1);
							})
							;
						}
					}
				})
			})
		}

		console.log('end structurize db');

		process.exit(-1);
	}
}
