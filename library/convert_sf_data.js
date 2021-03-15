module.exports = {
	async convert_files(tables) {
		if(! empty(tables)) {
			// todo преобразование сокращенных типов в полные
			forIn(tables, (fields_table, name_table) => {
				forIn(fields_table, (params_field, name_field) => {

					let	tp_pr = params_field;
					let	data_param = {};

					if(is_array(params_field)) {
						tp_pr = params_field[0] || params_field;
						data_param = params_field[1] || false;
					}
					/* bool */

					if(typeof tp_pr === 'string' && tp_pr === 'bool') {
						tables[name_table][name_field] = {
							type: 'tinyint',
							constraint: 1,
							default: 0,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && tp_pr === 'active') {
						tables[name_table][name_field] = {
							type: 'bool',
							constraint: 1,
							default: 1,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && tp_pr === 'active_param') {
						tables[name_table][name_field] = {
							type: 'bool',
							constraint: 1,
							default: 1,
							param: {
								type: 'checkbox',
								label: 'Активность',
								default: 1,
								...data_param
							}
						}
					}


					/* id */

					if(typeof tp_pr === 'string' && tp_pr === 'id') {
						tables[name_table][name_field] = {
							type: 'big_int',
							default: 0,
							index: true,
							unsigned: true,
							param: data_param
						}
					}

					/* integer */

					if(typeof tp_pr === 'string' && tp_pr === 'int') {
						tables[name_table][name_field] = {
							type: 'int',
							default: 0,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr === 'int_index') {
						tables[name_table][name_field] = {
							type: 'int',
							default: 0,
							index: true,
							param: data_param
						}
					}

					let reg_int = /^int\((\d+)\)(_index)?$/;
					if(typeof tp_pr === 'string' && reg_int.test(tp_pr)) {
						let param_constraint = tp_pr.match(reg_int);

						tables[name_table][name_field] = {
							type: 'int',
							default: 0,
							constraint: parseInt(param_constraint[1]),
							index: isset(param_constraint[2]),
							param: data_param
						}
					}


					if(typeof tp_pr === 'string' && tp_pr === 'unsigned_int') {
						tables[name_table][name_field] = {
							type: 'int',
							default: 0,
							unsigned: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr === 'unsigned_int_index') {
						tables[name_table][name_field] = {
							type: 'int',
							default: 0,
							index: true,
							unsigned: true,
							param: data_param
						}
					}

					let unsigned_reg_int = /^unsigned_int\((\d+)\)(_index)?$/;
					if(typeof tp_pr === 'string' && unsigned_reg_int.test(tp_pr)) {
						let param_constraint = tp_pr.match(unsigned_reg_int);

						tables[name_table][name_field] = {
							type: 'int',
							default: 0,
							unsigned: true,
							constraint: parseInt(param_constraint[1]),
							index: isset(param_constraint[2]),
							param: data_param
						}
					}

					/* varchar */

					if(typeof tp_pr === 'string' && (tp_pr === 'varchar' || tp_pr === 'string')) {
						tables[name_table][name_field] = {
							type: 'varchar',
							default: '',
							constraint: 255,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && (tp_pr === 'varchar_index' || tp_pr === 'string_index')) {
						tables[name_table][name_field] = {
							type: 'varchar',
							default: '',
							constraint: 255,
							index: true,
							param: data_param
						}
					}


					let reg_varchar = /^(?:varchar|string)\((\d+)\)(_index)?$/;

					if(typeof tp_pr === 'string' && reg_varchar.test(tp_pr)) {
						let param_constraint = tp_pr.match(reg_varchar);

						tables[name_table][name_field] = {
							type: 'varchar',
							default: '',
							constraint: parseInt(param_constraint[1]),
							index: isset(param_constraint[2]),
							param: data_param
						}
					}

					/* text */

					if(typeof tp_pr === 'string' && tp_pr === 'text') {
						tables[name_table][name_field] = {
							type: 'text',
							default: '',
							null: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'longtext') {
						tables[name_table][name_field] = {
							type: 'longtext',
							null: true,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && tp_pr == 'longText') {
						tables[name_table][name_field] = {
							type: 'longtext',
							null: true,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && tp_pr === 'long_text') {
						tables[name_table][name_field] = {
							type: 'longtext',
							default: '',
							null: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'smalltext') {
						tables[name_table][name_field] = {
							type: 'longtext',
							null: true,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && tp_pr == 'longText') {
						tables[name_table][name_field] = {
							type: 'longtext',
							null: true,
							param: data_param
						}
					}
					if(typeof tp_pr === 'string' && tp_pr === 'long_text') {
						tables[name_table][name_field] = {
							type: 'longtext',
							default: '',
							null: true,
							param: data_param
						}
					}


					/* decimal */


					if(typeof tp_pr === 'string' && tp_pr == 'decimal') {
						tables[name_table][name_field] = {
							type: 'decimal',
							constraint: '10,2',
							default: 0,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'decimal_index') {
						tables[name_table][name_field] = {
							type: 'decimal',
							constraint: '10,2',
							default: 0,
							index: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'unsigned_decimal') {
						tables[name_table][name_field] = {
							type: 'decimal',
							constraint: '10,2',
							default: 0,
							unsigned: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'unsigned_decimal_index') {
						tables[name_table][name_field] = {
							type: 'decimal',
							constraint: '10,2',
							default: 0,
							index: true,
							unsigned: true,
							param: data_param
						}
					}

					let reg_decimal = /^decimal\(([^\)]+)\)(_index)?$/;

					if(typeof tp_pr === 'string' && reg_decimal.test(tp_pr)) {
						let param_constraint = tp_pr.match(reg_decimal);

						tables[name_table][name_field] = {
							type: 'decimal',
							default: 0,
							constraint: parseInt(param_constraint[1]),
							index: isset(param_constraint[2]),
							param: data_param
						}
					}

					let unsigned_reg_decimal = /^decimal\(([^\)]+)\)(_index)?$/;

					if(typeof tp_pr === 'string' && unsigned_reg_decimal.test(tp_pr)) {
						let param_constraint = tp_pr.match(unsigned_reg_decimal);

						tables[name_table][name_field] = {
							type: 'decimal',
							default: 0,
							constraint: parseInt(param_constraint[1]),
							index: isset(param_constraint[2]),
							unsigned: true,
							param: data_param
						}
					}

					/* lson */

					if(typeof tp_pr === 'string' && tp_pr == 'json') {
						tables[name_table][name_field] = {
							type: 'json',
							null:true,
							param: data_param
						}
					}

					/* timestamp */

					if(typeof tp_pr === 'string' && tp_pr == 'timestamp') {
						tables[name_table][name_field] = {
							type: 'timestamp',
							null:true,
							param: data_param
						}
					}

					// if(typeof tp_pr === 'string' && tp_pr == 'unsigned_timestamp') {
					// 	tables[name_table][name_field] = {
					// 		type: 'timestamp',
					// 		// null:true,
					// 		unsigned: true,
					// 		param: data_param
					// 	}
					// }

					if(typeof tp_pr === 'string' && tp_pr == 'date') {
						tables[name_table][name_field] = {
							type: 'date',
							null: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'datetime') {
						tables[name_table][name_field] = {
							type: 'datetime',
							null: true,
							param: data_param
						}
					}

					if(typeof tp_pr === 'string' && tp_pr == 'time') {
						tables[name_table][name_field] = {
							type: 'time',
							null: true,
							param: data_param
						}
					}




				})
			})
		}
	}
};