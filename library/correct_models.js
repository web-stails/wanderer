const fs = require('fs');

module.exports = {
	/* чтение папки с моделями */
	async read_dir(path = './app/Models') {
		let files = [];
		let items = fs.readdirSync(path);

		for(let i = 0; i < items.length; i ++) {
			let file = path + '/' + items[i];

			let stats = fs.statSync(file);
			if (stats.isDirectory()) {
				let _files = await this.read_dir(file);
				files.push(..._files);
			} else {
				files.push({path: file, file: items[i]});
				// console.log(files);
			}
		}

		return files;
	},

	async parse_strings_model(fileContent, table_name, fields) {
		// разделяем файл модели на строки
		let file_s = fileContent.split("\n");

		let SoftDelete_field = false;
		if(typeof fields.deleted_at == 'undefined' || fields.deleted_at !== false) {
			// при условии что в параметрах таблицы не сказанно игнорировать SoftDelete
			if(typeof fields._option.model.SoftDelete == 'undefined'  || fields._option.model.SoftDelete != false) {
				SoftDelete_field = true;
			}
		}

		// обязательные параметры модели
		let is_not_param = {
			table: false,
			fillable: false,
			dates: false
		}

		// SoftDeletes параметры
		let is_SoftDeletes_param = {
			use_files_delete: false, //номер строки вставки подключения библиотеки мягкого удаления
			use_SoftDeletes: false, // номер строчки вставки наследования методов класса мягкого удаления
		}

		let is_timestamps = {
			index_timestamps: false, // индекс строки вставки:- public $timestamps = false;

		}


		let adds_index = 1;
		let adds_index2 = 0;
		let last_use = 0;
		let last_class = 0;


		let sings = {
			_namespace: {
				reg: new RegExp('^namespace', 'g'),
				f(index) {

				}
			},
			_use: {
				reg:new RegExp('use\\s', 'i'),
				f(index, string) {
					if(/use Illuminate\\Database\\Eloquent\\SoftDeletes;/i.test(string)) {
						is_SoftDeletes_param.use_files_delete = index;
					}

					if(/use SoftDeletes;/i.test(string)) {
						is_SoftDeletes_param.use_SoftDeletes = index;
					}

					if(! last_class) {
						last_use = index;
					}
				}
			},
			_class: {
				reg: new RegExp('^class', 'i'),
				f(index) {
					last_class = index;
				}
			},
			_begin: {
				reg: new RegExp("^\\{", 'i'),
				f(index, string) {
					last_class = index;
				}
			},
			_table: {
				// 'protected $table ='
				reg:new RegExp('protected \\$table = ([^;]*);', 'i'),
				f(index) {
					is_not_param.table = true;
					adds_index2 ++;
				}
			},
			_fillable: {
				reg:new RegExp("\\$fillable([^;]*);", 'i'),
				f(index) {
					is_not_param.fillable = true;

					adds_index2 ++;
				}
			},
			_dates: {
				reg:new RegExp("\\$dates([^;]*);", 'i'),
				f(index) {
					is_not_param.dates = true;
					adds_index2 ++;
				}
			},
			_timestamps: {
				reg: new RegExp("publi$timestamps = (?:false|true);", 'i'),
				f(index) {

				}
			}
		};
		let strings_names = [];


		file_s.forEach((string, index) => {
			strings_names[index] = {
				str: string
			};

			forIn(sings, (sing, name) => {
				if(sing.reg.test(string)) {
					sing.f(index, string);
					strings_names[index] = {
						name,
						str: string
					};
				}
			});
		});

		// console.log('datea_f_ts =>', strings_names);

		if(SoftDelete_field) {
			// добавляем подключаемую библиотеку SoftDeletes в пространство имен
			if(! is_SoftDeletes_param.use_files_delete) {
				strings_names.splice(last_use + adds_index, 0, {
					str: 'use Illuminate\\Database\\Eloquent\\SoftDeletes;'
				});

				adds_index ++;
			}

			// добавляем подключение функций библитеки SoftDeletes
			if(! is_SoftDeletes_param.use_SoftDeletes) {
				strings_names.splice(last_class + adds_index, 0, {
					str: '    use SoftDeletes;'
				});

				adds_index ++;
			}
		} else {
			// удаляем подключаемую библиотеку SoftDeletes в пространство имен
			if(is_SoftDeletes_param.use_files_delete) {
				strings_names.splice(is_SoftDeletes_param.use_files_delete, 1);
			}

			// добавляем подключение функций библитеки SoftDeletes
			if(is_SoftDeletes_param.use_SoftDeletes) {
				strings_names.splice(is_SoftDeletes_param.use_SoftDeletes, 1);
			}
		}

		if(! is_not_param.table) {
			strings_names.splice(last_class + adds_index + adds_index2, 0, {
				name: '_table',
				str: '    protected $table = \'' + table_name + '\';'
			});

			adds_index ++;
		}

		if(! is_not_param.fillable) {
			strings_names.splice(last_class + adds_index + adds_index2, 0, {
				name: '_fillable',
				str: '    protected $fillable = [];'
			});

			adds_index ++;
		}

		if(! is_not_param.dates) {
			strings_names.splice(last_class + adds_index + adds_index2, 0, {
				name: '_dates',
				str: '    protected $dates = [];'
			});

			adds_index ++;
		}

		//
		// console.log('datea_f_ts =>', strings_names);
		// process.exit(-1);

		return strings_names;
	},

	async correct_fillable_arr_model(file, new_name, table_name, fields) {
		let fileContent = fs.readFileSync(file.path, "utf8");

		// console.log('oreg =>', fileContent);

		// console.log('d_file =>', fileContent);
		// let _class = file.file.split('.');

		let strings_names = await this.parse_strings_model(fileContent, table_name, fields);

		let indexses = {
			table: 0,
			fillable: 0,
			dates: 0
		}

		// составляем массив полей дат
		let fields_dates = [];
		if(typeof fields.created_at == 'undefined' || fields.created_at !== false) {
			fields_dates.push('created_at');
		}
		if(typeof fields.updated_at == 'undefined' || fields.updated_at !== false) {
			fields_dates.push('updated_at');
		}
		if(typeof fields.deleted_at == 'undefined' || fields.deleted_at !== false) {
			fields_dates.push('deleted_at');
		}

		forIn(fields, (field, name) => {
			if(field.type == 'timestamp') {
				fields_dates.push(name);
			}
		});

		forIn(strings_names, (m, index) => {
			if(m.name == '_table') {
				indexses.table = index;
			}
			if(m.name == '_fillable') {
				indexses.fillable = index;
			}
			if(m.name == '_dates') {
				indexses.dates = index;
			}
		});

		// строчка вставки мени таблицы
		if(indexses.table > 0
			// при условии что в параметрах таблицы не сказанно игнорировать имя таблицы
			&& (typeof fields._option.model.table == 'undefined'|| fields._option.model.table != false))
		{
			let re_table = new RegExp('table([^;]*);', 'g');
			strings_names[indexses.table].str = strings_names[indexses.table].str.replace(re_table, (x, data) => {
				return 'table = \'' + table_name + '\';';
			});
		}

		// массив переменных
		if(indexses.fillable > 0
			// при условии что в параметрах таблицы не сказанно игнорировать список полей таблицы
			&& (typeof fields._option.model.fillable == 'undefined'|| fields._option.model.fillable != false))
		{
			let re_fillable = new RegExp('fillable([^;]*);', 'g');
			strings_names[indexses.fillable].str = strings_names[indexses.fillable].str.replace(re_fillable, (x, data) => {
				let str_rep = 'fillable = [';

				let index = 0;
				forIn(fields, (d, name) => {
					if(index ++) {
						str_rep += ', ';
					}
					str_rep += "'" + name + "'";
				});

				str_rep += '];';
				// console.log('str =>', str_rep, '<||>');
				return str_rep;
			});
		}

		// массив переменных даты
		if(indexses.dates > 0
			// при условии что в параметрах таблицы не сказанно игнорировать список полей таблицы дат
			&& (typeof fields._option.model.dates == 'undefined'|| fields._option.model.dates != false))
		{
			let re_dates = new RegExp('dates([^;]*);', 'g');
			strings_names[indexses.dates].str = strings_names[indexses.dates].str.replace(re_dates, (x, data) => {
				let str_rep = 'dates = [';

				let index = 0;
				forIn(fields_dates, name => {
					if(index ++) {
						str_rep += ', ';
					}
					str_rep += "'" + name + "'";
				});

				str_rep += '];';
				// console.log('str =>', str_rep, '<|');
				return str_rep;
			});
		}

		// console.log('datea_f_ts =>', strings_names);

		let res = '';
		forIn(strings_names, (str, index) => {
			if(index > 0) {
				// console.log('index =>', index);
				res += "\n";
			}
			res += str.str;
		});


		if(fields.created_at == false && fields.updated_at == false) {

			fields_dates.push('created_at');
		}
		if(typeof fields.updated_at == 'undefined' || fields.updated_at !== false) {
			fields_dates.push('updated_at');
		}

		// console.log('res =>', res);



		// let correct = false;

		// let re_fillable = new RegExp('fillable([^;]*);', 'g');
		// if(re_fillable.test(fileContent)) {
		// 	// console.log(' ========= >', file, new_name, fields);
		//
		// 	fileContent = fileContent.replace(re_fillable, (x, data) => {
		// 		let str_rep = 'fillable = [';
		//
		// 		let index = 0;
		// 		forIn(fields, (d, name) => {
		// 			if(index ++) {
		// 				str_rep += ', ';
		// 			}
		// 			str_rep += "'" + name + "'";
		// 		});
		//
		// 		str_rep += '];';
		// 		// console.log('str =>', str_rep, '<|');
		// 		return str_rep;
		// 	});
		//
		// 	correct = true;
		// }


		if(res != fileContent) {
			// сохраняем изменения
			fs.writeFileSync(file.path, res, function (error) {});
		}



		// process.exit(-1);
	},

	async correct_fillable(tables) {
		// коррекция масствов fillable в моделях
		if(! empty(config_global_option.option.correct_laravel_model) && config_global_option.option.correct_laravel_model == 'true') {
			let files_models = await this.read_dir();

			// пробуем автоматически заполнять массивы fillable
			forIn(tables, (table_fields, table_name) => {

				let new_name = table_name.toString().replace(/^(.)|_(.)/g, (x, y, z) => y ? y.toUpperCase() : z.toUpperCase());
				// console.log('name table =>', table_name, ' =>', new_name);

				// console.log(files_models[0]);

				// this.correct_fillable_arr_model(files_models[0].path, table_fields);

				// model_is_search = true;
				//
				let model_is_search = false;
				files_models.forEach(file => {
					if (! model_is_search && file.file == new_name + '.php') {


						this.correct_fillable_arr_model(file, new_name, table_name, table_fields);

						model_is_search = true;
					}
				})

			});
			// await this.read_dir();
			// let fileContent = fs.readFileSync("hello.txt", "utf8");

		}
	}
};