module.exports = class App_model {
	constructor() {
		this.db = require('knex')(config_global_option.db);
		this.dialect = this.db.client.config.client;
		this._tables = this.list_tables();
		this._table = '';
		this._active = false;
	}

	async table_exist(table) {
		return new Promise((resolve, reject) => {
			if(empty(table)) {
				reject(new Error('error not table'))
			} else {
				if(! empty(this._tables) && in_array(table, this._tables)) {
					resolve();
				} else {
					this.db.schema.hasTable(table)
					.then(x => {
						if(x) {
							resolve(x);
						} else {
							reject(x)
						}
					})
					.catch(error => reject(new Error(error)));
				}
			}
		})
	}

	// получить список таблиц
	async list_tables(){
		return new Promise((resolve, reject) => {
			if (this.dialect === 'mysql') {
				this.db.raw('show tables').then(resp => {
					let ret_list = [];
					! empty(resp[0]) && resp[0].forEach(table => {
						ret_list.push(Object.values(table)[0]);
					});
					return ret_list;
				})
				.then(data => resolve(data))
				.catch(error => reject(new Error(error)))
			} else if (this.dialect === "pg") {
				this.db.select("tablename")//SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'
				.from("pg_catalog.pg_tables")
				.where('schemaname', "public")
				.then(rst => resolve(rst.map(it => it.tablename)))
				.catch(error => reject(error))
			} else if (this.dialect === "mssql") {
				this.db.select("TABLE_NAME")
				.from('INFORMATION_SCHEMA.TABLES')
				.then(rst => {
					resolve(rst.map(it => it["TABLE_NAME"]))
				})
				.catch(error => reject(error))
			} else {
				reject(new Error(`this.dialect = ${this.dialect} the not supported`));
			}
		})
	}

	/* устанавливаем текущую таблицу
	* */
	async table(tableName = null, error_no_table = true) {
		return new Promise((resolve, reject) => {
			if(tableName) {
				// this.db.schema.dropTableIfExists(tableName)
				this.db.schema.hasTable(tableName)
				.then(exist => {
					if(exist) {
						this._table = tableName
						resolve(true);
					} else {
						if(error_no_table) {
							reject(new Error('Not table = "' + tableName + '"'));
						} else {
							resolve(false);
						}
					}
				})
				.catch(error => reject(new Error(error)))
			} else {
				reject(new Error('Not table'));
			}
		})
	}

	/**
	 * сохранение
	 * @param table
	 * @param data
	 * @returns {Promise<any>}
	 */
	async save(data = null) {
		if(! empty(data)) {
			if(! empty(data.id)) {
				let id = data.id
				delete data.id

				return this.update(id, data)
			} else {
				return this.insert(data)
			}
		} else {
			throw new Error('Not data (in this.save)')
		}
	}

	async insert(data = null) {
		if(data) {
			return this.db(this._table)
			.returning('id')
			.insert(data)
		} else {
			throw new Error('Not data (in this.insert)');
		}
	}

	async update(id = null, data = null) {
		if(id && data) {
			return this.db(this._table)
			.where({id})
			.update(data)
		} else {
			throw new Error('Not data (in this.update)');
		}
	}

	/**
	 * запрос всей таблицы
	 * @param table
	 * @returns {Promise<*|Knex.QueryBuilder>}
	 */
	async get_all() {
		return this.db(this._table)
	}

	/**
	 * запрос по ID позиции одногой строчки
	 * @param table
	 * @param id
	 * @returns {Promise<Knex.QueryBuilder>}
	 */
	async get_id(id = null) {
		return this.db(this._table)
		.where({id})
		.first()
	}

	/**
	 * добавление набора напаретов для составления запроса
	 * @param dbs Knex.QueryBuilder
	 * @param options data_array_strict
	 * @returns {Knex.QueryBuilder<object>}
	 */
	async convert_options_get(dbs, options) {

		for(let pr in options) {
			if(pr === 'where' || pr === 'limit' || pr === 'offset') {
				if(is_object(options[pr]) || typeof options[pr] === 'string' || typeof options[pr] === 'number') {
					dbs[pr](options[pr]); // where, limit, offset,
				} else if(pr === 'where', is_array(options[pr])) {
					options[pr].forEach(el => {
						if(is_object(el)) {
							dbs[pr](el);
						}

						if(is_array(el)) {
							dbs[pr](...el);
						}
					})
				}
			}

			if(pr === 'where_in' || pr === 'whereIn') {
				dbs.whereIn(...options[pr]);
			}

		}

		// return dbs;
	}

	async get(param = false) {
		let dbs = this.db(this._table);

		if(! empty(param.where)) {
			if (is_object(param.where)) {
				dbs.where(param.where);
			}
			if (is_array(param.where)) {
				param.where.forEach(el => {
					if (is_object(el)) {
						dbs.where(el);
					}

					if (is_array(el)) {
						dbs.where(...el);
					}
				})
			}
		}

		if(param.join) {
			if(is_array(param.join)) {
				dbs.join(...param.join)
			}
			if(is_object(param.join)) {
				for(let join_table in param.join) {
					dbs.join(join_table, ...param.join[join_table])
				}
			}
		}

		if(param.orderBy) {
			dbs.orderBy(param.orderBy)
		}

		if(param.limit) {
			dbs.limit(param.limit)
		}
		if(param.offset) {
			dbs.offset(param.offset)
		}

		if(param.select) {
			dbs.column(param.select);
		}

		return dbs;
	}

	/**
	 * запрос по условию
	 * @param table
	 * @param data
	 * @returns {Promise<*|Knex.QueryBuilder>}
	 */
	async get_where(data = null) {

		let dbs = this.db(this._table);

		if(is_object(data)) {
			dbs.where(data);
		}
		if(is_array(data)) {
			data.forEach(el => {
				if(is_object(el)) {
					dbs.where(el);
				}

				if(is_array(el)) {
					dbs.where(...el);
				}
			})
		}

		return dbs
	}

	/**
	 * Запрос по условию с возвратом одной строчки
	 * @param table
	 * @param data
	 * @returns {Promise<*|Knex.QueryBuilder>}
	 */
	async get_one(data = null) {
		let dbs = this.db(this._table);

		if(is_object(data)) {
			dbs.where(data);
		}
		if(is_array(data)) {
			data.forEach(el => {
				if(is_object(el)) {
					dbs.where(el);
				}

				if(is_array(el)) {
					dbs.where(...el);
				}
			})
		};

		dbs.first();

		return dbs;
	}

	async del(data = null) {

		let dbs = this.db(this._table);

		if(is_object(data)) {
			dbs.where(data);
		}
		if(is_array(data)) {
			data.forEach(el => {
				if(is_object(el)) {
					dbs.where(el);
				}

				if(is_array(el)) {
					dbs.where(...el);
				}
			})
		}

		return dbs.del()
	}


	/**
	 * изменение по условию
	 * @param table
	 * @param data
	 * @param where
	 * @returns {Promise<*|Knex.QueryBuilder>}
	 */
	async set_where(data, where) {
		let dbs = this.db(this._table);

		if(is_object(where)) {
			dbs.where(where);
		}
		if(is_array(where)) {
			where.forEach(el => {
				if(is_object(el)) {
					dbs.where(el);
				}

				if(is_array(el)) {
					dbs.where(...el);
				}
			})
		}

		if(is_object(data)) {
			dbs.update(data);
		}
		if(is_array(data)) {
			data.forEach(el => {
				if(is_object(el)) {
					dbs.update(el);
				}

				if(is_array(el)) {
					if(el[1] === '+' || el[1] === '++') {
						dbs.increment(el[0], ! empty(el[2]) ? el[2] : 1)
					}
					if(el[1] === '-' || el[1] === '--') {
						dbs.decrement(el[0], ! empty(el[2]) ? el[2] : 1)
					}
				}
			})
		}

		return dbs;
	}

	/**
	 * Получить количество элементов
	 * @param table таблица
	 * @param data условие на выборку
	 * @returns {Int<[count]>}
	 */
	async get_count(data) {
		let dbs = this.db(this._table);

		if(! empty(data)) {
			if (is_object(data)) {
				dbs.where(data);
			}
			if (is_array(data)) {
				data.forEach(el => {
					if (is_object(el)) {
						dbs.where(el);
					}

					if (is_array(el)) {
						dbs.where(...el);
					}
				})
			}
		}

		return await dbs.count({count: 'id'}).first()
		.then(x => x.count)
		.catch(e => {throw new Error(e)})
	}

	/**
	 * Получить максимальное значение по указаному полю
	 * @param table
	 * @param field
	 * @returns {int<max>}
	 */
	async get_max(field) {
		return await this.db(this._table).max(field).first()
		.then(x => x[field])
		.catch(e => {throw new Error(e)})
	}

	listDatabasesAsync(){
		if (this.dialect === "mysql") {
			return this.db.raw('show databases').then(getMySqlReturnValues);
		}

		if (this.dialect === "pg") {
			return this.db.select('datname')
			.from('pg_catalog.pg_database')
			.where('datistemplate', false)
			.where('datallowconn', true)
			.then(rst => {
				return rst.map(it => it.datname)
			})
		}

		if (this.dialect === "mssql") {
			return this.db.raw('SP_HELPDB')
			.then(rst => {
				return rst.map(it => it.name).filter(it => ["model", "tempdb", "master", "msdb"].indexOf(it) < 0);//exclude system dbs
			})
		} else {
			throw new Error(`${this.dialect} not supported`);
		}
	}

	async save_key(key, data) {
		let table = this._table;
		return await this.db(table)
		.where({
			field_key: key
		})
		.first()
		.then(async key_row => {
			if(! empty(key_row)) {
				return await this.db(table).update({
					field_data: data
				})
				.where({
					id: key_row.id
				})
				.then(() => {
					return key_row.id
				})
				.catch(e => {throw new Error(e)})
			} else {
				return await this.db(table)
				.returning('id')
				.insert({
					field_key: key,
					field_data: data
				})
				.then(x => x)
				.catch(e => {throw new Error(e)})
			}
		})
		.catch(e => {throw new Error(e)});
	}

	async get_keys() {
		return this.db(this._table)
		.then(r => {
			let res = {}
			if(r) {
				 r.forEach(element => {
				 	res[element.field_key] = element.field_data
				 })
				return res;
			} else {
				return null;
			}
		});
	}

	/**
	 * получить список полей в таблице
	 * @param table
	 * @returns {Bluebird<Knex.ColumnInfo>}
	 */
	async list_fields(table = this._table) {
		return this.db(table).columnInfo();
	}

	/**
	 * получить индексы в таблице
	 * @param table
	 * @returns {Promise<any>}
	 */
	async list_index(table = null) {
		return new Promise((resolve, reject) => {
			let sql = '';
			if (this.dialect === "mysql") {
				let table_chema = config_global_option.db.connection.database;

				if(empty(table)) {
					sql = `SELECT DISTINCT 
							TABLE_NAME AS 'table', 
							INDEX_NAME AS 'name', 
							COLUMN_NAME AS 'column', 
							INDEX_TYPE AS 'type' 
						FROM INFORMATION_SCHEMA.STATISTICS
						WHERE TABLE_SCHEMA = '${table_chema}';`
					;
				} else {
					sql = `SELECT DISTINCT 
							INDEX_NAME AS 'name', 
							COLUMN_NAME AS 'column' 
						FROM INFORMATION_SCHEMA.STATISTICS
						WHERE TABLE_SCHEMA = '${table_chema}' AND TABLE_NAME = '${table}';`
					;
				}

				this.db.raw(sql)
				.then(res => resolve(res[0]))
				.catch(error => reject(new Error(error)))
			}

			if (this.dialect === "pg") {
				if(empty(table)) {
					sql = `SELECT
						    t.relname AS table,
						    i.relname AS name,
						    a.attname AS column
						FROM
						    pg_class t,
						    pg_class i,
						    pg_index ix,
						    pg_attribute a
						WHERE
						    t.oid = ix.indrelid
						    AND i.oid = ix.indexrelid
						    AND a.attrelid = t.oid
						    AND a.attnum = ANY(ix.indkey)
						    AND t.relkind = 'r'
						    AND t.relname NOT LIKE 'pg_%'
						ORDER bY t.relname, i.relname;`
					;

				} else {
					sql = `select
						    i.relname as name,
						    a.attname as column
						from
						    pg_class t,
						    pg_class i,
						    pg_index ix,
						    pg_attribute a
						where
						    t.oid = ix.indrelid
						    and i.oid = ix.indexrelid
						    and a.attrelid = t.oid
						    and a.attnum = ANY(ix.indkey)
						    and t.relkind = 'r'
						    and t.relname = '${table}'
						order by t.relname, i.relname;`
					;
				}

				this.db.raw(sql)
				.then(res => resolve(res.rows))
				.catch(error => reject(new Error(error)))

			}
		})
	}

}
